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

// Build identifier — bumps with every deploy so we can tell mobile users
// instantly whether they're on the latest shipped JS or on a stale cached
// bundle. Falls back to a stable string in dev.
export const APP_BUILD = (() => {
  try {
    const t = import.meta.env?.VITE_BUILD_ID
    if (t) return String(t)
  } catch { /* ignore */ }
  return 'dev'
})()

if (typeof window !== 'undefined' && typeof console !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info(`[JourneyMate] build=${APP_BUILD} • api=${BASE_URL}`)
}

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

// ────────────────────────────────────────────────────────────────────────────
//  Backend wake-up (Render free tier cold-start mitigation)
// ────────────────────────────────────────────────────────────────────────────
//
// Free-tier hosts (Render, Fly, Railway) put idle dynos to sleep. The first
// request after that takes 30–90 s while the container boots — long enough
// to time out a normal search.
//
// `wakeBackend()` fires lightweight `/health` pings in the background until
// it gets a 2xx response. Components can subscribe to its lifecycle via
// `subscribeWakeStatus(cb)` to show a "Server waking up…" chip.
//
// Status values:
//   'idle'   – not started yet
//   'waking' – pinging in progress (first ping hasn't returned 2xx yet)
//   'ready'  – health check succeeded → dyno is warm
//   'failed' – exhausted retries; let the user kick it off manually

let wakeStatus = 'idle'
let wakePromise = null
const wakeListeners = new Set()

function setWakeStatus(next) {
  if (wakeStatus === next) return
  wakeStatus = next
  wakeListeners.forEach((cb) => {
    try { cb(next) } catch { /* listener errors must not break others */ }
  })
}

export function getWakeStatus() {
  return wakeStatus
}

export function subscribeWakeStatus(cb) {
  wakeListeners.add(cb)
  cb(wakeStatus) // emit current value immediately
  return () => wakeListeners.delete(cb)
}

/**
 * Detects if we're on a known slow / metered connection so we can avoid
 * launching the wake ping that would otherwise compete for bandwidth with
 * the user's actual search request on a 2G / saveData mobile.
 */
function isSlowConnection() {
  try {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (!c) return false
    if (c.saveData) return true
    const t = String(c.effectiveType || '').toLowerCase()
    return t === 'slow-2g' || t === '2g'
  } catch {
    return false
  }
}

/**
 * Ping `/health` repeatedly until it responds 2xx or we give up.
 * Idempotent — concurrent callers share the same promise.
 *
 *   maxAttempts – how many pings to try (default 6)
 *   perTimeout  – timeout per ping in ms (default 8000)
 *
 * Each attempt uses a fresh axios instance (NOT the shared `api` interceptor
 * stack) so it can't be cancelled by other interceptors and never carries
 * auth headers — `/health` is public.
 *
 * On 2G/save-data networks we skip altogether so the ping doesn't steal
 * bandwidth from the user's actual API call.
 */
export function wakeBackend({ maxAttempts = 6, perTimeout = 8000 } = {}) {
  if (wakePromise) return wakePromise
  if (isSlowConnection()) {
    setWakeStatus('idle')
    return Promise.resolve(false)
  }
  setWakeStatus('waking')

  wakePromise = (async () => {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await axios.get(`${BASE_URL}/health`, {
          timeout: perTimeout,
          headers: { 'Cache-Control': 'no-cache' },
          // _t cache-buster prevents 304 / stale CDN responses
          params: { _t: Date.now() },
        })
        setWakeStatus('ready')
        return true
      } catch {
        // Brief backoff (2s, 3s, 4s, 5s …) — total budget ~60s.
        await new Promise((r) => setTimeout(r, 1000 + attempt * 1000))
      }
    }
    setWakeStatus('failed')
    return false
  })()

  // Allow a future caller to retry after a failure.
  wakePromise.finally(() => {
    if (wakeStatus !== 'ready') wakePromise = null
  })

  return wakePromise
}

export default api
