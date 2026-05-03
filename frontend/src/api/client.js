import axios from 'axios'

/**
 * Dev: Vite proxy serves /api → backend.
 * Production (e.g. Vercel): you MUST set VITE_API_URL to the real API origin + /api
 * (e.g. https://your-api.vercel.app/api). Otherwise requests hit the static site and fail (Network Error).
 */
function apiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL
  if (raw != null && String(raw).trim() !== '') {
    const u = String(raw).trim().replace(/\/$/, '')
    try {
      const parsed = new URL(u)
      if (parsed.pathname === '/' || parsed.pathname === '') {
        return u.endsWith('/api') ? u : `${u}/api`
      }
    } catch {
      // ignore, fall through
    }
    return u
  }
  if (import.meta.env.DEV) return '/api'
  if (import.meta.env.PROD && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(
      '[JourneyMate] VITE_API_URL is not set. Add it in Vercel → Project → Settings → Environment Variables ' +
        '(value like https://YOUR-BACKEND-HOST/api), then redeploy the frontend.'
    )
  }
  return '/api'
}

const BASE_URL = apiBaseUrl()
export const API_BASE_URL = BASE_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Fail fast (15s) instead of hanging forever when the backend is unreachable.
  // Long LLM/streaming endpoints opt-out by passing their own `timeout` per request.
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* ────────────────────────────────────────────────────────────────────────────
 * Server warm-up
 *
 * Free-tier hosts (Render etc.) sleep idle services and the first request
 * after wake-up takes 30–60 s. To make the user's *actual* search feel
 * instant, we fire a fire-and-forget ping to `/health` as soon as the app
 * boots — by the time the user submits a search the dyno is already warm.
 *
 * `warmUpServer()` is also exposed so screens that lead into a search
 * (HeroSearch focus, popular-route hover, etc.) can re-poke the server
 * if it might have gone back to sleep.
 *
 * Memoised: at most one warm-up flight every 60 s.
 * ──────────────────────────────────────────────────────────────────────── */

let lastWarmUpAt = 0
let warmUpInFlight = null

export function warmUpServer() {
  const now = Date.now()
  if (now - lastWarmUpAt < 60_000) return warmUpInFlight ?? Promise.resolve()
  lastWarmUpAt = now
  warmUpInFlight = api
    .get('/health', { timeout: 90_000, _silent: true })
    .catch(() => null) // never throw — this is best-effort
    .finally(() => { warmUpInFlight = null })
  return warmUpInFlight
}

// Auto-warm on import in the browser so the first paint already starts the
// wake-up handshake. SSR / tests skip this safely.
if (typeof window !== 'undefined') {
  // Defer slightly so we don't compete with critical resource loads.
  setTimeout(() => { warmUpServer() }, 50)
}

export default api
