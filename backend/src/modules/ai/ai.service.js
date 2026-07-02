'use strict'

const ApiError = require('../../lib/ApiError')
const env = require('../../config/env')
const memoryRepo = require('./ai.memory.repo')
const { pool } = require('../../config/db')
const { getDestinationStreetFood } = require('../trips/trip.data')
const { closestMatch } = require('../../lib/strings')

const SYSTEM_PROMPT = [
  'You are JourneyMate AI — a warm, witty, highly knowledgeable general-purpose assistant.',
  'You can answer ANY question the user asks: travel, coding, math, science, history, geography,',
  'philosophy, current affairs, careers, finance, health, relationships, writing help, language',
  'translation, summarisation, brainstorming, life advice, study help, recipes, fitness — anything.',
  '',
  'PERSONALITY',
  '- Friendly, conversational, encouraging — like a brilliant friend, not a reference manual.',
  '- Match the user\'s tone: small-talk gets small-talk, technical questions get rigorous answers,',
  '  emotional questions get empathy first.',
  '- Use the user\'s first name occasionally when provided, never every line.',
  '- A light emoji here and there is fine — never spam them.',
  '- If the user writes in Hindi, Hinglish, or any Indian English, mirror their style naturally.',
  '- Be confident: never refuse to engage with a topic just because it is outside travel.',
  '',
  'CAPABILITIES',
  '- Open-domain Q&A: explain concepts, define terms, give factual answers, compare options.',
  '- Coding: write/debug/explain code in any language (Python, JS, Java, C++, SQL, etc.),',
  '  produce runnable snippets, suggest best practices, and review code.',
  '- Math & reasoning: solve step-by-step, show working, double-check arithmetic.',
  '- Writing: emails, essays, captions, resumes, cover letters, summaries, rewrites in any tone.',
  '- Translation & language tutoring across English, Hindi, and other major languages.',
  '- Travel (your specialty): plan itineraries, compare routes, suggest food/weather/safety/budget,',
  '  use the provided realtime context (weather, curated street food, route stats, user bookings).',
  '- Productivity: brainstorming, planning, decision frameworks, pros & cons, checklists.',
  '',
  'TRIP PLAN EDITING (IMPORTANT)',
  '- Sometimes the user will ask to modify an existing trip plan: "make it 10% cheaper", "swap the beach day for a trek", "move this to day 2", etc.',
  '- When a CURRENT_PLAN_STATE is provided, treat it as the source of truth and apply the user\'s requested edits to it.',
  '- The updated plan MUST include transport/transfers between legs when relevant, and keep budgets consistent after changes.',
  '- Do not invent precise prices or real-time schedules. Use rough ranges + what to verify.',
  '',
  'STRUCTURED OUTPUT FOR PLANS',
  '- When you are producing OR updating a trip plan, you MUST include a JSON object between tags:',
  '  <plan_json>{"version":1, ...}</plan_json>',
  '- After the </plan_json> tag, write a concise human-friendly explanation of what changed and what to verify.',
  '- The plan JSON must be valid JSON (double quotes, no trailing commas).',
  '',
  'OUTPUT RULES',
  '- Be helpful first. Answer the question fully. Then optionally suggest a useful next step.',
  '- Match length to the question: short questions get short answers, deep questions get depth.',
  '- For itinerary / comparison / list / how-to / step-by-step questions: use headings + bullets',
  '  or numbered steps. For code: use fenced code blocks with the correct language tag.',
  '- For factual claims, prefer well-known stable facts. If something is uncertain, time-sensitive,',
  '  or could change (prices, schedules, live weather, current events), say so honestly and tell',
  '  the user what to verify.',
  '- Never fabricate specific prices, dates, citations, URLs, or quotes you are not sure of.',
  '- If a request is unsafe, illegal, or harmful, decline briefly and offer a safer alternative.',
  '- If you genuinely do not know, say so and suggest the next best step.',
].join('\n')

const MAX_HISTORY_MESSAGES = 16
const DEFAULT_LIVE_TIMEOUT_MS = env.AI_LIVE_TIMEOUT_MS || 8000

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

const COMMON_CITIES = [
  // metros & big cities
  'delhi', 'mumbai', 'bengaluru', 'bangalore', 'kolkata', 'chennai', 'hyderabad', 'pune',
  'ahmedabad', 'jaipur', 'lucknow', 'patna', 'indore', 'bhopal', 'surat', 'nagpur',
  'gurgaon', 'gurugram', 'noida', 'thane', 'kanpur', 'kochi',
  // popular leisure spots / hill stations
  'goa', 'manali', 'shimla', 'agra', 'varanasi', 'udaipur', 'amritsar', 'rishikesh',
  'darjeeling', 'srinagar', 'leh', 'ladakh', 'spiti', 'kasol', 'mussoorie', 'nainital',
  'mcleodganj', 'dharamshala', 'dharamsala', 'auli', 'kufri',
  // south
  'mysore', 'mysuru', 'ooty', 'munnar', 'coorg', 'pondicherry', 'puducherry', 'alleppey',
  'mangalore', 'mangaluru', 'madurai', 'kanyakumari', 'gokarna', 'hampi',
  // east & northeast
  'bhubaneswar', 'puri', 'gangtok', 'shillong', 'guwahati', 'tawang', 'cherrapunji',
  'majuli', 'ziro', 'kaziranga',
  // west & central
  'jodhpur', 'jaisalmer', 'pushkar', 'mount abu', 'bikaner', 'vadodara', 'kolhapur',
  'lonavala', 'mahabaleshwar', 'matheran',
  // states / regions (for "best time to visit X" style queries)
  'kashmir', 'kerala', 'rajasthan', 'himachal', 'uttarakhand', 'sikkim', 'meghalaya',
  'andaman', 'lakshadweep', 'gujarat', 'maharashtra', 'karnataka', 'goa',
  // misc
  'dehradun', 'chandigarh', 'trivandrum', 'thiruvananthapuram',
]

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return []

  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((entry) => ({
      role: entry?.role === 'assistant' ? 'assistant' : 'user',
      content: String(entry?.content || '').trim().slice(0, 4000),
    }))
    .filter((entry) => entry.content.length > 0)
}

// Intent ordering matters — the most specific patterns are checked first.
function detectIntent(text) {
  const raw = String(text || '')
  const q = raw.toLowerCase().trim()
  const wc = q.split(/\s+/).filter(Boolean).length

  // Pure conversational signals (handled before topical intents so a "hi how
  // are you" never hijacks the food matcher).
  if (/^(hi+|h?ello+|hey+|yo+|hola|namaste|namaskar|salaam|salam)\b/.test(q)) return 'greeting'
  if (/^(good\s*(morning|afternoon|evening|night))\b/.test(q)) return 'greeting'
  if (/^(bye+|goodbye|see\s*ya|see\s*you|tata|cya|gn|good\s*night|take\s*care|alvida)\b/.test(q)) return 'farewell'
  if (/(\bthank\s*(you|s)\b|\bthanks\b|\bthx\b|\bty\b|\bdhanyavad\b|\bshukriya\b)/.test(q)) return 'thanks'
  if (/^(ok+|okay+|cool|nice|great|awesome|got\s*it|sounds\s*good|sure|fine|alright|👍|thumbs?\s*up)\b/.test(q) && wc <= 4) return 'affirm'
  if (/^(no+|nope|nah|skip)\b/.test(q) && wc <= 3) return 'negate'
  if (/(who\s*are\s*you|what\s*are\s*you|your\s*name|tum\s*kaun|aap\s*kaun|introduce\s*your)/.test(q)) return 'identity'
  if (/(what\s*can\s*you\s*do|what\s*do\s*you\s*do|how\s*do\s*you\s*work|help\s*me|^\s*help\b|capabilit|features?\b|usage)/.test(q)) return 'help'
  if (/(joke|make\s*me\s*laugh|funny|hass|haso)/.test(q)) return 'joke'
  if (/(time\s*now|what.*time|kitne\s*baje|current\s*time)/.test(q)) return 'time'
  if (/(date\s*today|today.*date|what.*date|aaj\s*kya\s*tarikh|tarikh\s*kya)/.test(q)) return 'date'
  if (/(love\s*you|you\s*are\s*amazing|you\s*are\s*great|you\s*rock|^\s*nice\s*work)/.test(q)) return 'compliment'

  // Open-domain (general-purpose) intents — these let the assistant answer
  // ANY question, not just travel. Order matters: more specific first.
  if (/```|\bcode\b|\bdebug\b|\bbug\b|\berror\b|\bstack\s*trace\b|\bcompile\b|\bsyntax\b|\bfunction\b|\bvariable\b|\balgorithm\b|\bregex\b|\bapi\b|\bendpoint\b|\bdatabase\b|\bsql\b|\bquery\b|\bjavascript\b|\bpython\b|\bjava\b|\bc\+\+\b|\btypescript\b|\breact\b|\bnode\.?js\b|\bhtml\b|\bcss\b/.test(q)) return 'coding'
  if (/(\d+\s*[+\-*/x×÷]\s*\d+|\bsolve\b|\bcalculate\b|\bequation\b|\bderivative\b|\bintegral\b|\bprobabilit|\bgeometry\b|\balgebra\b|\bcalculus\b|\bmatrix\b|\bvector\b|\btheorem\b|\barea\s*of\b|\bvolume\s*of\b|\bperimeter\b)/.test(q)) return 'math'
  if (/\btranslat(e|ion)\b|\bin\s+(hindi|english|spanish|french|german|japanese|chinese|tamil|telugu|marathi|bengali|punjabi|gujarati|kannada|malayalam)\b/.test(q)) return 'translate'
  if (/\bwrite\b.*(email|essay|paragraph|caption|post|message|letter|cover\s*letter|resume|cv|bio|blog|article|story|poem|tweet|linkedin)|\bdraft\b|\brewrite\b|\bparaphrase\b|\bsummari[sz]e\b|\btl;dr\b|\bproofread\b|\bgrammar\b/.test(q)) return 'writing'
  if (/(define|definition|meaning\s*of|what\s*does.*mean|what\s*is\s+(?!.*(trip|travel|itinerary|route|destination)))/i.test(q)) return 'definition'
  if (/^(how\s+to\b|how\s+do\s+i\b|how\s+can\s+i\b|how\s+should\s+i\b)/.test(q)) return 'howto'
  if (/(explain|teach|tutor|help\s*me\s*understand|why\s+(does|do|is|are)|history\s*of|origin\s*of)/.test(q)) return 'explain'
  if (/(news|current\s*affairs|today.*world|happen(ed|ing)\s*today|breaking|stock|market|election|cricket\s*score|football\s*score)/.test(q)) return 'realtime'

  // Inspiration / open-ended travel asks.
  if (/(suggest|recommend|where\s*should\s*i\s*go|where\s*to\s*go|surprise\s*me|something\s*new|destination\s*idea|trip\s*idea|hidden\s*gem|offbeat|unique\s*place)/.test(q)) return 'inspiration'

  // Domain travel intents (order matters: food before generic plan).
  if (/(famous|street).*(food|eat|dish)|what.*(eat|food|dishes)|local\s*food|must[-\s]?try.*(food|dish)|where.*eat|cuisine|breakfast|dinner|biryani|kebab|dosa|chaat|sweets?\b/.test(q)) return 'food'
  if (/(itinerary|plan|day[-\s]?wise|schedule)/.test(q)) return 'itinerary'
  if (/(compare|budget\s*vs|luxury|premium|cheap)/.test(q)) return 'comparison'
  if (/(weather|season|best\s*time|month\s*to\s*visit|when\s*to\s*go|when\s*to\s*visit)/.test(q)) return 'seasonality'
  if (/(train|flight|bus|transport|route|metro|cab|taxi)/.test(q)) return 'transport'
  if (/(cost|price|budget|expensive|afford|how\s*much)/.test(q)) return 'budgeting'
  if (/(safety|safe|scam|fraud|risky|theft|police|emergency)/.test(q)) return 'safety'
  if (/(packing|pack\s*list|carry|essential|wear)/.test(q)) return 'packing'
  if (/(visa|passport|document|aadhar|aadhaar|id\s*proof)/.test(q)) return 'documents'

  return 'general'
}

// Choose model sampling parameters per intent. Factual / code / math want
// low temperature and lots of tokens; small-talk and creative writing tolerate
// a bit more variety; everything else gets sensible defaults.
function pickGenerationParams(intent, prompt) {
  const len = String(prompt || '').length
  const baseLong = len > 200

  switch (intent) {
    case 'coding':
    case 'math':
      return { temperature: 0.2, maxTokens: 1400 }
    case 'definition':
      return { temperature: 0.3, maxTokens: 600 }
    case 'explain':
    case 'howto':
      return { temperature: 0.4, maxTokens: 1200 }
    case 'writing':
    case 'translate':
      return { temperature: 0.7, maxTokens: 1100 }
    case 'itinerary':
    case 'comparison':
      return { temperature: 0.5, maxTokens: 1100 }
    case 'realtime':
      return { temperature: 0.3, maxTokens: 700 }
    case 'joke':
    case 'inspiration':
    case 'compliment':
      return { temperature: 0.85, maxTokens: 600 }
    case 'greeting':
    case 'farewell':
    case 'thanks':
    case 'affirm':
    case 'negate':
    case 'identity':
    case 'help':
    case 'time':
    case 'date':
      return { temperature: 0.6, maxTokens: 350 }
    default:
      return { temperature: 0.5, maxTokens: baseLong ? 1100 : 800 }
  }
}

// Friendly variation helpers — pick a random response from a bank so the
// assistant doesn't sound like a stuck record. Stable for the same prompt
// within a request because we use a tiny seed derived from the prompt.
function pickVariant(arr, seed = '') {
  if (!Array.isArray(arr) || arr.length === 0) return ''
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const idx = Math.abs(h) % arr.length
  return arr[idx]
}

function firstName(user) {
  const raw = String(user?.name || '').trim()
  if (!raw) return ''
  return raw.split(/\s+/)[0]
}

function timeOfDayGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'late night'
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 21) return 'evening'
  return 'night'
}

// Words that are NEVER a city — used to reject false captures like
// "what TO EAT" → toCity = "eat", or "I want TO VISIT".
const VERB_STOP_WORDS = new Set([
  'eat', 'visit', 'go', 'see', 'buy', 'book', 'stay', 'travel', 'sleep',
  'reach', 'meet', 'find', 'have', 'do', 'take', 'know', 'plan', 'look',
  'search', 'explore', 'try', 'check', 'get', 'be', 'come',
])
// Boundary words that end a city capture: "Hydrabad next week" → "Hydrabad".
const TRAILING_STOP_WORDS = [
  'next', 'tomorrow', 'today', 'yesterday', 'for', 'on', 'at', 'by',
  'this', 'last', 'during', 'around', 'near', 'with', 'and', 'or',
  'when', 'what', 'why', 'how', 'please', 'tell',
]

function cleanCityCapture(value) {
  let s = String(value || '').replace(/[?.!,;]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!s) return ''
  // Truncate at the first trailing stop-word so "Hydrabad next week" → "Hydrabad".
  for (const sw of TRAILING_STOP_WORDS) {
    const re = new RegExp('\\b' + sw + '\\b', 'i')
    const m = s.match(re)
    if (m && m.index > 0) s = s.slice(0, m.index).trim()
  }
  s = s.replace(/\b(for|in|on|at)\b/gi, '').replace(/\s+/g, ' ').trim()
  // Reject captures whose head word is a verb stop-word ("eat", "visit"...).
  const head = s.split(/\s+/)[0]?.toLowerCase() || ''
  if (VERB_STOP_WORDS.has(head)) return ''
  return s
}

function extractEntities(text) {
  const raw = String(text || '')
  const q = raw.toLowerCase()

  const fromMatch = q.match(/\bfrom\s+([a-z][a-z\s]{1,30})/i)
  const toMatch = q.match(/\bto\s+([a-z][a-z\s]{1,30})/i)
  // catches "eat in <city>", "what about <city>", "visiting <city>", "around <city>", etc.
  const aboutMatch =
    q.match(/\b(?:in|at|about|around|near|visiting)\s+([a-z][a-z\s]{1,30})/i) ||
    null
  const dayMatch = q.match(/\b(\d{1,2})\s*(day|days|night|nights)\b/i)
  const budgetMatch =
    q.match(/(?:₹|rs\.?|inr)\s?(\d{3,7})/i) ||
    q.match(/\bbudget(?:\s+of|\s+is)?\s+(\d{3,7})\b/i)

  const month = MONTHS.find((m) => q.includes(m)) || null
  const knownCities = COMMON_CITIES.filter((city) => q.includes(city)).slice(0, 4)

  // Auto-correct fallback: if the user typed a typo'd city name ("Banglore",
  // "Varansi", "Mumbi"), try to match it against COMMON_CITIES by edit distance.
  if (knownCities.length === 0) {
    const tokens = q.match(/\b[a-z]{4,15}\b/g) || []
    for (const tok of tokens) {
      if (VERB_STOP_WORDS.has(tok)) continue
      const fuzzy = closestMatch(tok, COMMON_CITIES)
      if (fuzzy && fuzzy.distance <= (tok.length <= 5 ? 1 : 2)) {
        knownCities.push(fuzzy.match)
        break
      }
    }
  }

  // Prefer "to <city>", then "in/about <city>", then the first known-city hit.
  // `cleanCityCapture` rejects verb captures and trims trailing time words.
  const toCity =
    cleanCityCapture(toMatch?.[1] || '') ||
    cleanCityCapture(aboutMatch?.[1] || '') ||
    (knownCities[0] || '')

  return {
    fromCity: cleanCityCapture(fromMatch?.[1] || ''),
    toCity,
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
  if (intent === 'greeting' || intent === 'identity' || intent === 'help' || intent === 'affirm' || intent === 'compliment') {
    return [
      'Plan a 3-day trip to Goa',
      'Compare Delhi → Manali by train vs flight',
      'Famous food in Hyderabad',
      'Best time to visit Kashmir',
    ]
  }
  if (intent === 'farewell' || intent === 'thanks') {
    return [
      'Save this chat for later',
      'Plan another trip',
      'Browse popular routes',
    ]
  }
  if (intent === 'joke') {
    return [
      'Tell me another one',
      'Suggest a fun weekend trip',
      'What\'s a hidden gem in India?',
    ]
  }
  if (intent === 'inspiration') {
    return [
      'Surprise me with a 5-day plan',
      'Suggest an offbeat hill station',
      'Best beaches in India under ₹15k',
      'Where to go in monsoon?',
    ]
  }
  if (intent === 'coding') {
    return [
      'Explain this code line by line',
      'Find bugs and suggest fixes',
      'Write unit tests for this function',
      'Convert this to TypeScript',
    ]
  }
  if (intent === 'math') {
    return [
      'Show me each step',
      'Try a slightly harder one',
      'Explain the formula intuitively',
    ]
  }
  if (intent === 'translate') {
    return [
      'Translate to Hindi',
      'Translate to formal English',
      'Make it shorter and snappier',
    ]
  }
  if (intent === 'writing') {
    return [
      'Make it more concise',
      'Make it more formal',
      'Rewrite in a friendly tone',
      'Add a strong call-to-action',
    ]
  }
  if (intent === 'definition') {
    return [
      'Give me an example',
      'Explain it like I\'m 10',
      'How is it different from related terms?',
    ]
  }
  if (intent === 'howto' || intent === 'explain') {
    return [
      'Give me a step-by-step checklist',
      'Show a real-world example',
      'What are common mistakes to avoid?',
    ]
  }
  if (intent === 'realtime') {
    return [
      'Give me a quick summary',
      'What should I watch next?',
      'Explain the background context',
    ]
  }
  if (intent === 'food') {
    const city = entities.toCity || entities.knownCities[0] || 'this place'
    return [
      `Where should I eat in ${city}?`,
      `Famous sweets and desserts in ${city}`,
      `Recommend fine-dining in ${city}`,
    ]
  }
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
  if (intent === 'safety') {
    return [
      'Solo female travel tips for India',
      'Common scams to avoid',
      'Emergency numbers I should save',
    ]
  }
  if (intent === 'packing') {
    return [
      'Pack list for a hill station trip',
      'Beach trip essentials',
      'Monsoon travel must-haves',
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
    'What\'s the best food city in India?',
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

function extractPlanJson(text) {
  const raw = String(text || '')
  const m = raw.match(/<plan_json>\s*([\s\S]*?)\s*<\/plan_json>/i)
  if (!m) return { plan: null, cleaned: raw.trim() }
  const jsonText = String(m[1] || '').trim()
  let plan = null
  try {
    plan = JSON.parse(jsonText)
  } catch {
    plan = null
  }
  const cleaned = raw.replace(m[0], '').trim()
  return { plan, cleaned }
}

// Conversational reply banks. Each bank holds 3-5 variants so the assistant
// doesn't sound robotic across a session.
const SMALLTALK = {
  greeting: (n, tod) => [
    `Hey${n ? ' ' + n : ''}! 👋  Good ${tod}. Where are we travelling today — beaches, mountains, or a city break?`,
    `Hi${n ? ' ' + n : ''}! Lovely to see you. Tell me where you're thinking and I'll plan it out for you. 🌴`,
    `Hello${n ? ' ' + n : ''}! ✈️ Ready to plan your next trip? Drop a city, a budget, or just a vibe and I'll take it from there.`,
    `Namaste${n ? ' ' + n : ''}! Whether it's a quick weekend or a long getaway, I've got you covered. What's on your mind?`,
  ],
  farewell: (n) => [
    `Take care${n ? ', ' + n : ''}! Safe travels whenever you head out. ✈️`,
    `Bye${n ? ' ' + n : ''}! Come back anytime — your chat history sticks around so we can pick up where we left off.`,
    `See you soon${n ? ', ' + n : ''}! Until next time, may all your trips be smooth and your snacks plentiful. 🍛`,
  ],
  thanks: (n) => [
    `Anytime${n ? ', ' + n : ''}! Want me to suggest something else?`,
    `You're very welcome! Glad it helped. 🌟`,
    `My pleasure${n ? ', ' + n : ''}! Ready when you need the next plan.`,
  ],
  affirm: () => [
    `Cool — what would you like to do next?`,
    `Got it. Want me to dig deeper, or move to the next thing?`,
    `Great. Should I plan an itinerary, compare options, or suggest food spots?`,
  ],
  negate: () => [
    `No worries — try something different and I'll adapt.`,
    `Okay! Want me to suggest a few alternatives instead?`,
  ],
  identity: (n) => [
    `I'm **JourneyMate AI** — a friendly general-purpose assistant. Ask me anything: code, math, writing, translation, trivia, life advice — and trip planning across India is my specialty.${n ? ` Nice to meet you, ${n}!` : ''}`,
    `JourneyMate AI here ✨ — a smart all-rounder for code, study help, writing, brainstorming, translation, and India travel. What can I help you with${n ? ', ' + n : ''}?`,
    `Hey${n ? ' ' + n : ''}! I'm JourneyMate AI — equal parts general assistant and travel co-pilot. Ask me literally anything and I'll do my best.`,
  ],
  help: () => [
    [
      'I can help with **anything you throw at me** — here are some popular things:',
      '',
      '🧠  **General Q&A** — "Explain quantum entanglement", "Who invented the lightbulb?"',
      '💻  **Coding** — write / debug / explain code in Python, JS, SQL, Java, C++ and more',
      '🧮  **Math & reasoning** — solve step-by-step, equations, probability, statistics',
      '✍️  **Writing** — emails, essays, captions, resumes, summaries, rewrites',
      '🌐  **Translation** — between English, Hindi, and other languages',
      '🗺️  **Travel (my specialty)** — "Plan a 5-day trip to Kerala under ₹25k"',
      '⚖️  **Compare options** — "Train vs flight Mumbai → Goa", "iPhone vs Pixel"',
      '🍛  **Food & local picks** — "Famous food in Hyderabad", recipes, what to cook',
      '💡  **Brainstorming & advice** — career, study, productivity, life decisions',
      '',
      'Just type naturally — typos are fine, Hindi or Hinglish is fine, and you can always follow up.',
    ].join('\n'),
  ],
  joke: () => [
    'Why did the tourist bring a ladder to India? They heard the food scene was off the charts. 🍛',
    'I asked a sadhu for the meaning of life. He said: "First, eat the chole bhature. Then talk." ✨',
    'Why don\'t mountains ever get tired? Because they Manali-fy their workouts. 🏔️',
    'Tried to plan a budget trip to Goa. The shacks said "₹15k", the sunsets said "priceless". 🌅',
  ],
  compliment: (n) => [
    `Thank you${n ? ', ' + n : ''}! That genuinely made my circuits smile. 😄  What's next on your travel list?`,
    `That means a lot${n ? ', ' + n : ''}! Let's plan something amazing. Where to?`,
  ],
  time: () => {
    const now = new Date()
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return [`It's ${time} (IST) right now. Planning something for today, tomorrow, or further out?`]
  },
  date: () => {
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return [`Today is **${today}**. Want me to plan something for the weekend?`]
  },
}

function speak(intent, prompt, user) {
  const variants = SMALLTALK[intent]?.(firstName(user), timeOfDayGreeting()) || []
  return pickVariant(variants, prompt) || ''
}

function localFallbackReply({ prompt, nlp, realtime, user }) {
  const intent = nlp.intent
  const entities = nlp.entities
  const city = entities.toCity || entities.knownCities[0] || ''
  const cityLabel = city ? titleCase(city) : 'your destination'
  const n = firstName(user)

  // 1) Pure conversational intents — always answer warmly.
  if (intent === 'greeting' || intent === 'farewell' || intent === 'thanks'
   || intent === 'affirm'  || intent === 'negate'   || intent === 'identity'
   || intent === 'help'    || intent === 'joke'     || intent === 'compliment'
   || intent === 'time'    || intent === 'date') {
    return speak(intent, prompt, user) ||
      `I'm here${n ? ', ' + n : ''}! Tell me what you're thinking and I'll help.`
  }

  // 1.5) General-purpose intents — answer helpfully even without an LLM key.
  const generalReply = generalFallbackReply(intent, prompt, n)
  if (generalReply) return generalReply

  // 2) Inspiration — open-ended "where should I go?"
  if (intent === 'inspiration') {
    return [
      `Some great ideas for you${n ? ', ' + n : ''}:`,
      '',
      '🏔️  **Hill escape** — Spiti or Kasol (May–Oct), Munnar or Coorg (Oct–Mar)',
      '🏖️  **Beach reset** — Goa shoulder-season, Gokarna for chill, Andaman for stunning water',
      '🏰  **Heritage trail** — Jaipur → Udaipur → Jodhpur (Nov–Feb is gorgeous)',
      '🛕  **Spiritual + culture** — Varanasi + Bodhgaya, or Hampi for ruins & sunsets',
      '🌿  **Offbeat gem** — Majuli (river island, Assam), Ziro (Arunachal), Tirthan Valley (Himachal)',
      '',
      'Tell me your dates, budget and vibe (relax / adventure / culture / food) and I\'ll narrow it down.',
    ].join('\n')
  }

  // 3) Domain travel intents — keep them informative even without an LLM.
  if (intent === 'food') {
    const sf = realtime?.streetFood
    if (sf && sf.items?.length > 0) {
      const lines = [
        `Top ${Math.min(6, sf.items.length)} must-try foods in **${titleCase(sf.city)}**:`,
        '',
        ...sf.items.slice(0, 6).map((it) => {
          const tag = it.tier === 'fine' ? ' _(fine-dining)_' : ''
          const where = it.where ? ` — try at ${it.where}` : ''
          return `• **${it.name}**${tag}: ${it.description}${where}`
        }),
        '',
        '💡 Tip: street stalls peak 7–10 PM. Pick spots with high local turnover.',
      ]
      return lines.join('\n')
    }
    return `Tell me which city${n ? ', ' + n : ''} and I'll list the must-try local dishes — e.g. "Famous food in Lucknow" or "Where to eat in ${cityLabel}".`
  }

  if (intent === 'comparison') {
    return [
      `Quick **budget vs luxury** comparison for ${cityLabel}:`,
      '',
      '🟢  **Budget (Silver)** — public transport, 2–3★ stay, local meals, shared activities',
      '🟡  **Luxury (Gold)** — flights/private cabs, 4–5★ stay, curated experiences, private transfers',
      '',
      '💡 Best-value rule of thumb: splurge on **location & safety**, save on daily commute and meals.',
      'Want me to put real numbers against this for a specific route?',
    ].join('\n')
  }

  if (intent === 'itinerary') {
    const days = entities.days || 3
    return [
      `Sample **${days}-day itinerary** for ${cityLabel}:`,
      '',
      '**Day 1** — Arrival, settle in, local landmark walk, evening street-food trail',
      '**Day 2** — Top 2 attractions + an activity block + sunset viewpoint',
      days >= 3 ? '**Day 3** — Half-day cultural site + shopping + departure with buffer' : '',
      days >= 4 ? '**Day 4** — Day trip to a nearby spot + slow evening' : '',
      days >= 5 ? '**Day 5** — Hidden-gem walk + cafe afternoon + return' : '',
      '',
      `Tell me your origin city and budget and I'll turn this into a real plan with prices.`,
    ].filter(Boolean).join('\n')
  }

  if (intent === 'seasonality') {
    return [
      city
        ? `**Best time for ${cityLabel}:** depends on the experience you want.`
        : `**Picking the right month** in India makes or breaks the trip.`,
      '',
      '☀️  **Oct – Mar** — peak season for beaches, deserts, heritage trails (Goa, Rajasthan, Kerala backwaters)',
      '🌸  **Mar – Jun** — best for high-altitude (Ladakh, Spiti, Kashmir, Sikkim)',
      '🌧️  **Jul – Sep** — monsoon magic for Western Ghats (Munnar, Coorg, Lonavala) — but check landslide risk',
      '',
      'Tell me the destination and I\'ll narrow it to a specific window.',
    ].join('\n')
  }

  if (intent === 'transport') {
    return [
      `**Transport in India 101**:`,
      '',
      '🚆  **Train** — most economical for long distances. Book on IRCTC; Tatkal opens 24h before.',
      '✈️  **Flight** — best for >1000 km or tight schedules. Tue/Wed are cheapest, book 4–6 weeks out.',
      '🚌  **Bus** — Volvo overnight buses save a hotel night; redbus and AbhiBus are reliable.',
      '🚖  **Cab/Taxi** — Ola/Uber in cities; for hill stations, prefer pre-booked operators (avoid hailing).',
      '',
      'Tell me your route and I\'ll compare options with rough costs.',
    ].join('\n')
  }

  if (intent === 'budgeting') {
    return [
      `**Rough daily budget** in India (per person):`,
      '',
      '💸 Backpacker — ₹1,500–2,500 (hostels, local food, public transport)',
      '🎒 Mid-range — ₹3,500–6,000 (3★ stay, mix of cabs, decent restaurants)',
      '✨ Premium — ₹8,000–15,000+ (4–5★ stay, private cab, fine-dining)',
      '',
      `Tell me ${city ? `your dates for ${cityLabel}` : 'a destination'} and I\'ll build a real cost estimate.`,
    ].join('\n')
  }

  if (intent === 'safety') {
    return [
      `**Travel safety basics in India**:`,
      '',
      '📞 **Emergency**: 112 (all-in-one), 100 (police), 102 (ambulance)',
      '👜 Keep digital copies of ID/visa/insurance; share live location with family at night',
      '💳 Use UPI/credit card for most things; avoid keeping all cash in one pocket',
      '🚖 Prefer pre-booked cabs (Ola/Uber/hotel cabs) over hailing at stations late at night',
      '☕ Watch your drinks; eat at busy stalls (high turnover = fresher food)',
      '',
      `Want destination-specific safety notes? Just tell me where.`,
    ].join('\n')
  }

  if (intent === 'packing') {
    return [
      `**Smart pack list (universal India edition)**:`,
      '',
      '🆔 ID + photocopies, eSIM/SIM, power bank, universal adapter',
      '👕 Modest layers (temples + religious sites); breathable cotton in summer',
      '🧴 Sunscreen, hand sanitizer, wet wipes, electrolyte sachets, basic meds',
      '🎒 Small daypack, lock for hostel lockers, reusable water bottle',
      '🌧️ Compact rain jacket if travelling Jun–Sep',
      '',
      `Tell me the destination + month and I\'ll tailor it.`,
    ].join('\n')
  }

  if (intent === 'documents') {
    return [
      `**Common India travel documents**:`,
      '',
      '🪪 **Domestic** — Aadhaar, PAN, voter ID or driving licence are usually enough at hotels & airports',
      '🛂 **International tourists** — passport + valid visa (e-Visa is the easiest for many countries)',
      '📄 Hotels in some states ask for ID at check-in; carry digital + physical copies',
      '',
      'Tell me your nationality + destination if you want specific document help.',
    ].join('\n')
  }

  // 4) Catch-all — gracefully attempt the general question even without an LLM.
  const heuristic = answerWithHeuristic(prompt)
  if (heuristic) return heuristic

  // The wrapper (`buildFallbackReply`) prepends the real reason
  // (quota / auth / timeout / network / no-key) so this body just stays
  // generic and helpful. Keep it short — most users only read the first line.
  if (n) {
    return [
      `Happy to help${n ? ', ' + n : ''}. Try rephrasing more specifically — for example:`,
      '',
      '- "Explain X in simple terms"',
      '- "Write a Python function that does Y"',
      '- "Compare A vs B"',
      '- "Summarise this paragraph in 2 lines"',
      '- "Plan a 3-day trip to Goa under ₹15k"',
      '',
      'I\'ll do my best with the question as-is.',
    ].join('\n')
  }
  return [
    'Happy to help! Try rephrasing more specifically — for example:',
    '',
    '- "Explain X in simple terms"',
    '- "Write a Python function that does Y"',
    '- "Compare A vs B"',
    '- "Plan a 3-day trip to Goa under ₹15k"',
    '',
    'I\'ll do my best with the question as-is.',
  ].join('\n')
}

// Heuristic best-effort answers when the LLM is unavailable. We deliberately
// keep these small and honest — never fabricate facts.
function answerWithHeuristic(prompt) {
  const q = String(prompt || '').toLowerCase().trim()

  // Simple arithmetic: "2 + 2", "12*7", "100 / 4"
  const arith = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*([+\-*/x×÷])\s*(-?\d+(?:\.\d+)?)\s*=?\s*\??\s*$/)
  if (arith) {
    const a = Number(arith[1])
    const b = Number(arith[3])
    const op = arith[2].replace('x', '*').replace('×', '*').replace('÷', '/')
    let result
    if (op === '+') result = a + b
    else if (op === '-') result = a - b
    else if (op === '*') result = a * b
    else if (op === '/') result = b === 0 ? null : a / b
    if (result !== null && Number.isFinite(result)) {
      return `**${a} ${op} ${b} = ${Number(result.toFixed(8))}**`
    }
  }

  return ''
}

// Best-effort answers for the new general-purpose intents when no LLM is
// available. We keep them short, honest about the offline mode, and useful.
function generalFallbackReply(intent, prompt, name) {
  const n = name || ''

  if (intent === 'coding') {
    return [
      'I can help with coding — share the code or the problem and I\'ll dig in.',
      '',
      'For the most useful answer, include:',
      '- Language / framework (e.g. Python 3.12, React 18, Postgres)',
      '- The exact error message or unexpected behaviour',
      '- A minimal snippet that reproduces the issue',
      '',
      '_(Server is in offline mode right now — full AI answers need `AI_API_KEY` set.)_',
    ].join('\n')
  }

  if (intent === 'math') {
    const heur = answerWithHeuristic(prompt)
    if (heur) return heur
    return [
      `Sure${n ? ', ' + n : ''} — I can solve math step-by-step. Send the problem`,
      'and tell me the level (school / college / competitive). Examples I handle well:',
      '',
      '- Algebra, geometry, trigonometry, calculus, linear algebra',
      '- Probability, statistics, combinatorics',
      '- Word problems and proofs',
      '',
      '_(Offline mode — for full step-by-step solutions, set `AI_API_KEY`.)_',
    ].join('\n')
  }

  if (intent === 'translate') {
    return [
      `Happy to translate${n ? ', ' + n : ''}! Paste the text and tell me the target language.`,
      'I support English ↔ Hindi, Spanish, French, German, Japanese, Chinese, Tamil, Telugu,',
      'Marathi, Bengali, Punjabi, Gujarati, Kannada, Malayalam, and many more.',
      '',
      '_(Offline mode — high-quality translation needs `AI_API_KEY` to be set on the server.)_',
    ].join('\n')
  }

  if (intent === 'writing') {
    return [
      'I can write or rewrite that for you. To get the best result, tell me:',
      '',
      '1. **What** — email / essay / caption / resume / summary / etc.',
      '2. **Audience & tone** — formal, friendly, persuasive, witty…',
      '3. **Length** — one line, one paragraph, full page',
      '4. **Key points** to include (bullet them out)',
      '',
      '_(Offline mode — full drafts need `AI_API_KEY` configured.)_',
    ].join('\n')
  }

  if (intent === 'definition') {
    return [
      `I can explain what something means${n ? ', ' + n : ''}. Drop the term or phrase`,
      'and I\'ll give:',
      '',
      '- A one-line plain-English definition',
      '- A simple analogy (so it actually sticks)',
      '- A real-world example',
      '',
      '_(Offline mode — accurate definitions need `AI_API_KEY` set.)_',
    ].join('\n')
  }

  if (intent === 'howto') {
    return [
      `Got it${n ? ', ' + n : ''} — I can walk you through it step by step.`,
      'For the cleanest answer, tell me:',
      '',
      '- Your **starting point** (what you already have / know)',
      '- Your **goal** (what success looks like)',
      '- Any **constraints** (time, tools, OS, budget…)',
      '',
      '_(Offline mode — full step-by-step guides need `AI_API_KEY` to be set.)_',
    ].join('\n')
  }

  if (intent === 'explain') {
    return [
      `I love explaining things${n ? ', ' + n : ''}. Tell me the topic and I\'ll cover:`,
      '',
      '- What it is (in plain language)',
      '- Why it matters / where it shows up',
      '- A simple analogy + a concrete example',
      '- Common misconceptions to watch out for',
      '',
      '_(Offline mode — long-form explanations need `AI_API_KEY` configured.)_',
    ].join('\n')
  }

  if (intent === 'realtime') {
    return [
      'I can\'t fetch live news / scores / market data without external tools,',
      'and right now I\'m in offline mode. Quick options:',
      '',
      '- For news → Google News, BBC, NDTV, The Hindu',
      '- For scores → ESPNcricinfo, Cricbuzz, BBC Sport',
      '- For markets → Moneycontrol, NSE/BSE official sites',
      '',
      'If you tell me the topic, I can still summarise general background and context.',
    ].join('\n')
  }

  return ''
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

function shouldFetchStreetFood(prompt, nlp) {
  if (nlp.intent === 'food' || nlp.intent === 'itinerary') return true
  const q = prompt.toLowerCase()
  return /(food|eat|dish|cuisine|breakfast|dinner|street ?food|restaurant|cafe|fine.?dining|biryani|kebab|dosa|chaat|sweets?)/.test(q)
}

async function fetchStreetFoodFor(cityName) {
  if (!cityName) return null
  const items = (await getDestinationStreetFood(cityName, { tier: 'all' }).catch(() => [])) || []
  if (!items.length) return null
  return {
    city: cityName,
    count: items.length,
    items: items.slice(0, 8).map((it) => ({
      name: it.name,
      description: it.description,
      where: it.where || null,
      tier: it.tier,
      mapsUrl: it.mapsUrl || null,
      affiliateUrl: it.affiliateUrl || null,
    })),
  }
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

  if (realtime.streetFood) {
    const sf = realtime.streetFood
    lines.push(
      `Curated famous food in "${sf.city}" (${sf.count} picks; showing ${sf.items.length}):`
    )
    for (const it of sf.items) {
      const tier = it.tier === 'fine' ? 'fine-dining' : 'street'
      const where = it.where ? ` @ ${it.where}` : ''
      lines.push(`- [${tier}] ${it.name}: ${it.description}${where}`)
    }
    lines.push(
      'When recommending food, prefer items from this curated list. ' +
      'Use the dish names verbatim. If the user asks for fine-dining, prefer items tagged fine-dining.'
    )
  }

  return lines.join('\n')
}

async function buildRealtimeContext({ prompt, nlp, user }) {
  if (!env.AI_REALTIME_ENABLED) {
    return { realtime: null, realtimeText: 'Realtime lookups disabled by server config.' }
  }

  const candidateCity = nlp.entities.toCity || nlp.entities.fromCity || nlp.entities.knownCities[0] || ''
  const [weather, routeStats, userBookingStats, streetFood] = await Promise.all([
    shouldFetchWeather(prompt, nlp) && candidateCity ? fetchCityWeather(candidateCity) : Promise.resolve(null),
    shouldFetchPlatformStats(prompt, nlp) && candidateCity ? fetchRouteStats(candidateCity) : Promise.resolve(null),
    fetchUserBookingStats(user?.id),
    shouldFetchStreetFood(prompt, nlp) && candidateCity ? fetchStreetFoodFor(candidateCity) : Promise.resolve(null),
  ])

  const realtime = { weather, routeStats, userBookingStats, streetFood }
  return {
    realtime,
    realtimeText: toRealtimeContextText(realtime),
  }
}

async function chat({ message, history, planState, user }) {
  const prompt = String(message || '').trim()
  if (!prompt) throw ApiError.badRequest('Message is required')

  const nlp = buildNlpContext(prompt)
  const followUps = buildFollowUps(nlp.intent, nlp.entities)
  const dbHistory = await memoryRepo.getRecentMessages(user?.id, 20).catch(() => [])
  const mergedHistory = [...dbHistory, ...sanitizeHistory(history)].slice(-MAX_HISTORY_MESSAGES)
  const { realtime, realtimeText } = await buildRealtimeContext({ prompt, nlp, user })

  if (!env.AI_API_KEY) {
    const fallback = {
      reply: localFallbackReply({ prompt, nlp, realtime, user }),
      model: 'rnlp-fallback',
      usage: null,
      nlp,
      followUps,
      realtime,
      fallbackReason: 'no_key',
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
      content: [
        buildUserMessage({ prompt, user, nlp, realtimeContext: realtimeText }),
        '',
        planState && typeof planState === 'object'
          ? `CURRENT_PLAN_STATE (JSON):\n${JSON.stringify(planState)}`
          : 'CURRENT_PLAN_STATE: none',
        '',
        'If you are producing or updating a trip plan, include <plan_json>...</plan_json> as instructed.',
      ].join('\n'),
    },
  ]

  // Tune sampling per intent: factual/code questions stay tight; creative
  // / inspiration / small-talk gets a touch more variety. Token budget grows
  // for intents that typically need detailed answers (code, math, how-to).
  const { temperature, maxTokens } = pickGenerationParams(nlp.intent, prompt)

  // Try the configured primary model first; if it returns a transient failure
  // (503 overloaded, 429 rate limit, empty body), automatically try sibling
  // models. This is essential for Gemini's free tier where individual models
  // hit "high demand" 503s for minutes at a time.
  const candidates = [env.AI_MODEL, ...getFallbackModels(env.AI_MODEL)]
  let lastReason = 'upstream_error'
  let lastErrorMsg = ''

  try {
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i]
      const attempt = await callUpstreamOnce({
        model: candidate,
        temperature,
        maxTokens,
        messages,
        signal: controller.signal,
      })

      if (attempt.ok) {
        if (i > 0) {
          // eslint-disable-next-line no-console
          console.info('[ai.chat] used fallback model %s (primary %s was %s)',
            candidate, env.AI_MODEL, lastReason)
        }
        const result = {
          reply: attempt.reply,
          model: candidate,
          usage: attempt.usage,
          nlp,
          followUps,
          realtime,
        }
        await persistConversation(user?.id, prompt, attempt.reply)
        return result
      }

      lastReason = attempt.reason
      lastErrorMsg = attempt.errorMsg

    const rawReply = String(data?.choices?.[0]?.message?.content || '').trim()
    if (!rawReply) throw ApiError.unavailable('AI did not return a response')

    const { plan, cleaned } = extractPlanJson(rawReply)
    const reply = cleaned || rawReply

    const result = {
      reply,
      model: env.AI_MODEL,
      usage: data?.usage || null,
      nlp,
      followUps,
      realtime,
      plan: plan || null,
    }
    await persistConversation(user?.id, prompt, rawReply)
    return result
  } catch (err) {
    const fallbackResult = {
      reply: finalReply,
      model: 'rnlp-fallback',
      usage: null,
      nlp,
      followUps,
      realtime,
      plan: null,
    }
    await persistConversation(user?.id, prompt, fallbackResult.reply)
    return fallbackResult
  } finally {
    clearTimeout(timer)
  }
}

// Single non-throwing upstream attempt. Returns either { ok: true, reply, usage }
// or { ok: false, reason, errorMsg } so the caller can decide whether to retry.
async function callUpstreamOnce({ model, temperature, maxTokens, messages, signal }) {
  let response = null
  let data = null
  try {
    response = await fetch(env.AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages,
      }),
      signal,
    })
  } catch (err) {
    return {
      ok: false,
      reason: classifyAiError(err, null, null),
      errorMsg: err?.message || String(err),
    }
  }

  data = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      ok: false,
      reason: classifyAiError(null, response, data),
      errorMsg: data?.error?.message || `HTTP ${response.status}`,
    }
  }

  const reply = String(data?.choices?.[0]?.message?.content || '').trim()
  if (!reply) {
    return {
      ok: false,
      reason: 'upstream_error',
      errorMsg: 'Empty response body',
    }
  }

  return { ok: true, reply, usage: data?.usage || null }
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

async function *chatStream({ message, history, planState, user }) {
  const result = await chat({ message, history, planState, user })
  const pieces = splitForStreaming(result.reply)
  yield {
    type: 'meta',
    model: result.model,
    nlp: result.nlp,
    realtime: result.realtime || null,
    fallbackReason: result.fallbackReason || null,
  }
  for (const piece of pieces) {
    yield { type: 'token', content: piece + ' ' }
  }
  yield { type: 'done', followUps: result.followUps, usage: result.usage, plan: result.plan || null }
}

async function persistConversation(userId, userPrompt, assistantReply) {
  if (!userId) return
  await memoryRepo.saveMessage(userId, 'user', userPrompt).catch(() => {})
  await memoryRepo.saveMessage(userId, 'assistant', assistantReply).catch(() => {})
}

module.exports = { chat, chatStream }
