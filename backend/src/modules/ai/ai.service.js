'use strict'

const ApiError = require('../../lib/ApiError')
const env = require('../../config/env')
const memoryRepo = require('./ai.memory.repo')
const { pool } = require('../../config/db')

const SYSTEM_PROMPT =
  'You are JourneyMate AI, an advanced India travel planner using LLM reasoning + real-time data + extracted entities. ' +
  'Use provided realtime context whenever available and clearly mention when data is unavailable. ' +
  'Keep responses concise, practical, and highly actionable. ' +
  'If user asks itinerary/comparison, use structured headings with bullet points. ' +
  'Avoid hallucinated prices, schedules, weather, or guarantees.'

const MAX_HISTORY_MESSAGES = 10
const DEFAULT_LIVE_TIMEOUT_MS = env.AI_LIVE_TIMEOUT_MS || 8000

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

function buildUserMessage({ prompt, user, nlp, realtimeContext }) {
  return [
    `User: ${user?.name || 'Traveler'} (${user?.email || 'unknown'})`,
    `Intent: ${nlp.intent}`,
    `Language: ${nlp.language}`,
    `Entities: ${JSON.stringify(nlp.entities)}`,
    '',
    'Realtime context (external + platform data):',
    realtimeContext || 'No live context available.',
    '',
    `Original query: ${prompt}`,
    '',
    'Respond in concise practical format. For itinerary/comparison, include headings + bullets and add what data user should verify.',
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

function titleCase(v) {
  return String(v || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')
}

function toSlug(v) {
  return String(v || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function shouldFetchWeather(prompt, nlp) {
  const q = prompt.toLowerCase()
  return (
    nlp.intent === 'seasonality' ||
    /(weather|temperature|rain|forecast|today|tomorrow|climate)/.test(q)
  )
}

function shouldFetchPlatformStats(prompt, nlp) {
  const q = prompt.toLowerCase()
  return (
    nlp.intent === 'comparison' ||
    nlp.intent === 'transport' ||
    nlp.intent === 'itinerary' ||
    /(route|routes|booking|bookings|popular|availability)/.test(q)
  )
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = DEFAULT_LIVE_TIMEOUT_MS) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function fetchCityWeather(cityName) {
  const city = titleCase(cityName)
  if (!city) return null

  const geocodeUrl =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=in&limit=1&q=${encodeURIComponent(city)}`
  const geo = await fetchJsonWithTimeout(
    geocodeUrl,
    { headers: { 'User-Agent': 'JourneyMate/2.0 travel assistant' } },
    DEFAULT_LIVE_TIMEOUT_MS
  )
  if (!Array.isArray(geo) || geo.length === 0) return null

  const first = geo[0]
  const lat = Number(first.lat)
  const lon = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto'
  const weather = await fetchJsonWithTimeout(weatherUrl, {}, DEFAULT_LIVE_TIMEOUT_MS)
  if (!weather?.current) return null

  return {
    city,
    lat,
    lon,
    timezone: weather.timezone || null,
    current: weather.current,
  }
}

async function fetchRouteStats(cityName) {
  const slug = toSlug(cityName)
  if (!slug) return null

  const q = `
    SELECT origin_slug, destination_slug, tag, duration
    FROM routes
    WHERE origin_slug = $1 OR destination_slug = $1
    ORDER BY id DESC
    LIMIT 6
  `
  const { rows } = await pool.query(q, [slug]).catch(() => ({ rows: [] }))
  if (!rows.length) return null
  return {
    citySlug: slug,
    totalMatches: rows.length,
    recentRoutes: rows.slice(0, 3).map((r) => ({
      from: r.origin_slug,
      to: r.destination_slug,
      tag: r.tag,
      duration: r.duration,
    })),
  }
}

async function fetchUserBookingStats(userId) {
  if (!userId) return null
  const summaryQ = `
    SELECT COUNT(*)::int AS total_bookings, COALESCE(SUM(price_inr), 0)::int AS total_spend_inr
    FROM bookings
    WHERE user_id = $1
  `
  const recentQ = `
    SELECT origin, destination, plan, price_inr, travel_date, status
    FROM bookings
    WHERE user_id = $1
    ORDER BY id DESC
    LIMIT 3
  `

  const [summaryRes, recentRes] = await Promise.all([
    pool.query(summaryQ, [userId]).catch(() => ({ rows: [{ total_bookings: 0, total_spend_inr: 0 }] })),
    pool.query(recentQ, [userId]).catch(() => ({ rows: [] })),
  ])

  const summary = summaryRes.rows[0] || { total_bookings: 0, total_spend_inr: 0 }
  return {
    totalBookings: Number(summary.total_bookings || 0),
    totalSpendInr: Number(summary.total_spend_inr || 0),
    recent: recentRes.rows || [],
  }
}

function toRealtimeContextText(realtime) {
  const lines = []
  lines.push(`Context generated at: ${new Date().toISOString()}`)

  if (realtime.weather) {
    const w = realtime.weather
    lines.push(
      `Live weather (${w.city}): temp=${w.current.temperature_2m}C, feels_like=${w.current.apparent_temperature}C, ` +
      `precipitation=${w.current.precipitation}, wind=${w.current.wind_speed_10m} km/h, timezone=${w.timezone || 'unknown'}`
    )
  } else {
    lines.push('Live weather: unavailable')
  }

  if (realtime.routeStats) {
    lines.push(
      `Platform routes for "${realtime.routeStats.citySlug}": ${realtime.routeStats.totalMatches} recent matches.`
    )
    for (const r of realtime.routeStats.recentRoutes) {
      lines.push(`- ${r.from} -> ${r.to} (${r.tag || 'General'}, ${r.duration || 'duration unknown'})`)
    }
  } else {
    lines.push('Platform routes: no matching route context found')
  }

  if (realtime.userBookingStats) {
    const b = realtime.userBookingStats
    lines.push(`User bookings: total=${b.totalBookings}, total_spend_inr=${b.totalSpendInr}`)
    for (const x of b.recent || []) {
      lines.push(
        `- booking: ${x.origin} -> ${x.destination}, plan=${x.plan}, price=${x.price_inr}, status=${x.status}`
      )
    }
  }

  return lines.join('\n')
}

async function buildRealtimeContext({ prompt, nlp, user }) {
  if (!env.AI_REALTIME_ENABLED) {
    return { realtime: null, realtimeText: 'Realtime lookups disabled by server config.' }
  }

  const candidateCity = nlp.entities.toCity || nlp.entities.fromCity || nlp.entities.knownCities[0] || ''
  const [weather, routeStats, userBookingStats] = await Promise.all([
    shouldFetchWeather(prompt, nlp) && candidateCity ? fetchCityWeather(candidateCity) : Promise.resolve(null),
    shouldFetchPlatformStats(prompt, nlp) && candidateCity ? fetchRouteStats(candidateCity) : Promise.resolve(null),
    fetchUserBookingStats(user?.id),
  ])

  const realtime = { weather, routeStats, userBookingStats }
  return {
    realtime,
    realtimeText: toRealtimeContextText(realtime),
  }
}

async function chat({ message, history, user }) {
  const prompt = String(message || '').trim()
  if (!prompt) throw ApiError.badRequest('Message is required')

  const nlp = buildNlpContext(prompt)
  const followUps = buildFollowUps(nlp.intent, nlp.entities)
  const dbHistory = await memoryRepo.getRecentMessages(user?.id, 20).catch(() => [])
  const mergedHistory = [...dbHistory, ...sanitizeHistory(history)].slice(-MAX_HISTORY_MESSAGES)
  const { realtime, realtimeText } = await buildRealtimeContext({ prompt, nlp, user })

  if (!env.AI_API_KEY) {
    const fallback = {
      reply: localFallbackReply({ prompt, nlp }),
      model: 'rnlp-fallback',
      usage: null,
      nlp,
      followUps,
      realtime,
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
      content: buildUserMessage({ prompt, user, nlp, realtimeContext: realtimeText }),
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
      realtime,
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
      realtime,
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
  yield { type: 'meta', model: result.model, nlp: result.nlp, realtime: result.realtime || null }
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
