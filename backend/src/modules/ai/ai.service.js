'use strict'

const ApiError = require('../../lib/ApiError')
const env = require('../../config/env')
const memoryRepo = require('./ai.memory.repo')

const SYSTEM_PROMPT =
  'You are JourneyMate AI, an advanced India travel planner combining LLM reasoning with extracted trip entities. ' +
  'Use user context + extracted entities to give practical answers. Keep responses concise, clear, and highly actionable. ' +
  'If user asks for itinerary/comparison, use structured headings with bullet points. ' +
  'If information is uncertain, say what to verify. Avoid hallucinated prices or guaranteed timings.'

const MAX_HISTORY_MESSAGES = 10

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

const COMMON_CITIES = [
  'delhi', 'mumbai', 'bengaluru', 'bangalore', 'kolkata', 'chennai', 'hyderabad', 'pune',
  'ahmedabad', 'jaipur', 'goa', 'manali', 'shimla', 'agra', 'varanasi', 'udaipur', 'kochi',
  'amritsar', 'rishikesh', 'darjeeling', 'srinagar', 'leh', 'dehradun', 'lucknow', 'patna',
]

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return []

  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((entry) => ({
      role: entry?.role === 'assistant' ? 'assistant' : 'user',
      content: String(entry?.content || '').trim().slice(0, 1200),
    }))
    .filter((entry) => entry.content.length > 0)
}

function detectIntent(text) {
  const q = text.toLowerCase()
  if (/(itinerary|plan|day[-\s]?wise|schedule)/.test(q)) return 'itinerary'
  if (/(compare|budget vs|luxury|premium|cheap)/.test(q)) return 'comparison'
  if (/(weather|season|best time|month)/.test(q)) return 'seasonality'
  if (/(train|flight|bus|transport|route)/.test(q)) return 'transport'
  if (/(cost|price|budget|expensive|afford)/.test(q)) return 'budgeting'
  if (/(safety|safe|scam|fraud|risky)/.test(q)) return 'safety'
  if (/(hi|hello|hey)/.test(q)) return 'greeting'
  return 'general'
}

function extractEntities(text) {
  const raw = String(text || '')
  const q = raw.toLowerCase()

  const fromMatch = q.match(/\bfrom\s+([a-z][a-z\s]{1,30})/i)
  const toMatch = q.match(/\bto\s+([a-z][a-z\s]{1,30})/i)
  const dayMatch = q.match(/\b(\d{1,2})\s*(day|days|night|nights)\b/i)
  const budgetMatch =
    q.match(/(?:₹|rs\.?|inr)\s?(\d{3,7})/i) ||
    q.match(/\bbudget(?:\s+of|\s+is)?\s+(\d{3,7})\b/i)

  const month = MONTHS.find((m) => q.includes(m)) || null
  const knownCities = COMMON_CITIES.filter((city) => q.includes(city)).slice(0, 4)

  const normalizeEntity = (value) =>
    String(value || '')
      .replace(/\b(for|in|on|at)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

  return {
    fromCity: normalizeEntity(fromMatch?.[1] || ''),
    toCity: normalizeEntity(toMatch?.[1] || ''),
    days: dayMatch ? Number(dayMatch[1]) : null,
    budgetInr: budgetMatch ? Number(budgetMatch[1]) : null,
    month,
    knownCities,
  }
}

function extractLanguage(text) {
  // Detect Devanagari quickly for Hindi-like input; otherwise default English.
  return /[\u0900-\u097F]/.test(text) ? 'hi' : 'en'
}

function buildFollowUps(intent, entities) {
  if (intent === 'itinerary') {
    return [
      'Give me a day-wise itinerary',
      'Suggest food and local experiences',
      'Estimate total cost with buffer',
    ]
  }
  if (intent === 'comparison') {
    return [
      'Show budget vs luxury side-by-side',
      'Which option gives best value?',
      'Suggest a mid-range option too',
    ]
  }
  if (intent === 'seasonality') {
    return [
      'What should I pack for this season?',
      'Any weather risk to consider?',
      'Suggest best nearby alternatives',
    ]
  }
  if (entities.toCity) {
    return [
      `Plan a 3-day trip to ${entities.toCity}`,
      `Best time to visit ${entities.toCity}`,
      `Budget tips for ${entities.toCity}`,
    ]
  }
  return [
    'Plan a budget trip for me',
    'Compare train vs flight for my route',
    'Give a weekend travel suggestion',
  ]
}

function buildNlpContext(prompt) {
  const intent = detectIntent(prompt)
  const entities = extractEntities(prompt)
  const language = extractLanguage(prompt)
  return { intent, entities, language }
}

function buildUserMessage({ prompt, user, nlp }) {
  return [
    `User: ${user?.name || 'Traveler'} (${user?.email || 'unknown'})`,
    `Intent: ${nlp.intent}`,
    `Language: ${nlp.language}`,
    `Entities: ${JSON.stringify(nlp.entities)}`,
    '',
    `Original query: ${prompt}`,
    '',
    'Respond in concise practical format. For itinerary/comparison, include headings + bullets.',
  ].join('\n')
}

function localFallbackReply({ prompt, nlp }) {
  const city = nlp.entities.toCity || nlp.entities.knownCities[0] || 'your destination'
  if (nlp.intent === 'comparison') {
    return [
      `Here is a quick budget vs luxury comparison for ${city}:`,
      '- Budget: public transport + 2/3 star stay + local meals + shared activities.',
      '- Luxury: flights/cabs + premium stay + curated experiences + private transfers.',
      '- Best value tip: spend more on location and safety, save on daily commute costs.',
    ].join('\n')
  }
  if (nlp.intent === 'itinerary') {
    const days = nlp.entities.days || 3
    return [
      `Quick ${days}-day sample itinerary for ${city}:`,
      '- Day 1: arrival, local landmark walk, evening market/food trail.',
      '- Day 2: key attractions + activity block + sunset viewpoint.',
      '- Day 3: half-day cultural spot + shopping + return with time buffer.',
    ].join('\n')
  }
  return `I can help with itinerary, budget comparison, timing, and route ideas. Try: "Plan a 3-day budget trip from Delhi to Goa in November under 20000 INR".`
}

async function chat({ message, history, user }) {
  const prompt = String(message || '').trim()
  if (!prompt) throw ApiError.badRequest('Message is required')

  const nlp = buildNlpContext(prompt)
  const followUps = buildFollowUps(nlp.intent, nlp.entities)
  const dbHistory = await memoryRepo.getRecentMessages(user?.id, 20).catch(() => [])
  const mergedHistory = [...dbHistory, ...sanitizeHistory(history)].slice(-MAX_HISTORY_MESSAGES)

  if (!env.AI_API_KEY) {
    const fallback = {
      reply: localFallbackReply({ prompt, nlp }),
      model: 'rnlp-fallback',
      usage: null,
      nlp,
      followUps,
    }
    await persistConversation(user?.id, prompt, fallback.reply)
    return fallback
  }

  if (typeof fetch !== 'function') {
    throw ApiError.unavailable('AI service is unavailable in this Node runtime')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS)

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...mergedHistory,
    {
      role: 'user',
      content: buildUserMessage({ prompt, user, nlp }),
    },
  ]

  try {
    const response = await fetch(env.AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        temperature: 0.4,
        max_tokens: 500,
        messages,
      }),
      signal: controller.signal,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      if (response.status === 401) throw ApiError.unavailable('AI API key is invalid')
      if (response.status === 429) throw ApiError.tooMany('AI rate limit reached. Please retry in a moment.')
      throw ApiError.unavailable(data?.error?.message || 'AI service request failed')
    }

    const reply = String(data?.choices?.[0]?.message?.content || '').trim()
    if (!reply) throw ApiError.unavailable('AI did not return a response')

    const result = {
      reply,
      model: env.AI_MODEL,
      usage: data?.usage || null,
      nlp,
      followUps,
    }
    await persistConversation(user?.id, prompt, reply)
    return result
  } catch (err) {
    const fallbackResult = {
      reply: localFallbackReply({ prompt, nlp }),
      model: 'rnlp-fallback',
      usage: null,
      nlp,
      followUps,
    }
    await persistConversation(user?.id, prompt, fallbackResult.reply)

    if (err.name === 'AbortError') {
      return fallbackResult
    }
    if (err instanceof ApiError) return fallbackResult
    return fallbackResult
  } finally {
    clearTimeout(timer)
  }
}

function splitForStreaming(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const chunks = []
  let current = ''
  for (const w of words) {
    const next = current ? `${current} ${w}` : w
    if (next.length > 24) {
      chunks.push(current || w)
      current = current ? w : ''
    } else {
      current = next
    }
  }
  if (current) chunks.push(current)
  return chunks.length ? chunks : [String(text || '')]
}

async function *chatStream({ message, history, user }) {
  const result = await chat({ message, history, user })
  const pieces = splitForStreaming(result.reply)
  yield { type: 'meta', model: result.model, nlp: result.nlp }
  for (const piece of pieces) {
    yield { type: 'token', content: piece + ' ' }
  }
  yield { type: 'done', followUps: result.followUps, usage: result.usage }
}

async function persistConversation(userId, userPrompt, assistantReply) {
  if (!userId) return
  await memoryRepo.saveMessage(userId, 'user', userPrompt).catch(() => {})
  await memoryRepo.saveMessage(userId, 'assistant', assistantReply).catch(() => {})
}

module.exports = { chat, chatStream }
