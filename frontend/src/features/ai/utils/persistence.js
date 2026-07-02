const STORAGE_KEY = 'jm_ai_chat_history_v2'
const MAX_PERSISTED = 40

const DEFAULT_GREETING = {
  id: 1,
  role: 'bot',
  text: "Hi! I'm JourneyMate AI — your travel co-pilot. Ask for itineraries, budgets, weather, routes, or smart comparisons.",
  followUps: [
    'Plan a 3-day budget Goa trip from Delhi',
    'Compare train vs flight Mumbai→Bengaluru',
    'Best month to visit Manali, and why?',
  ],
  plan: null,
}

export function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch {
    // ignore malformed
  }
  return [DEFAULT_GREETING]
}

export function persistMessages(messages) {
  try {
    const trimmed = messages.slice(-MAX_PERSISTED)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // storage may be blocked; safe to ignore
  }
}

export function buildResetGreeting() {
  return {
    id: Date.now(),
    role: 'bot',
    text: 'Cleared. What should we plan next?',
    followUps: [],
    plan: null,
  }
}
