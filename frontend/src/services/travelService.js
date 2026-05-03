import api from '../api/client'
export { CITIES } from '../data/indianCities'

/**
 * @param {number} [options.days] Visit length in days (1–5). Backend returns itinerary + `requestedDays`.
 */
function tripErrorMessage(err) {
  const e = err?.response?.data?.error
  if (e == null) return err?.message || 'Request failed'
  if (typeof e === 'string') return e
  if (e.message) return e.message
  if (e.code) return e.code
  return err?.message || 'Request failed'
}

/**
 * Every search sends explicit `days` (1–5) so the backend always rebuilds itinerary + price.
 * `tripType` and `vibes` (comma-joined) feed the server-side vibe engine —
 * unknown values are normalised away on the backend so old/new clients are safe.
 * Cache-buster avoids proxy/CDN returning a stale response.
 *
 * Free-tier hosts (Render / Fly / Railway) put idle services to sleep, and the
 * very first request after that takes 30–60 s to wake the dyno. We give the
 * search a generous 60 s timeout AND auto-retry once on network/timeout/5xx
 * errors so the user never sees a spurious failure on a cold boot.
 *
 * `signal` (AbortSignal) lets the UI cancel an in-flight request when the
 * user navigates away or hits "Cancel" on the loader.
 */
export const searchTrip = async (from, to, options = {}) => {
  let days = 5
  if (options.days != null && options.days !== '') {
    const d = Math.round(Number(options.days))
    if (Number.isFinite(d)) days = Math.min(5, Math.max(1, d))
  }
  const params = {
    from: String(from).trim(),
    to: String(to).trim(),
    days,
    _t: String(Date.now()),
  }
  if (options.tripType) params.tripType = String(options.tripType).trim().toLowerCase()
  if (Array.isArray(options.vibes) && options.vibes.length > 0) {
    params.vibes = options.vibes.map((v) => String(v).trim().toLowerCase()).filter(Boolean).join(',')
  }

  const requestConfig = {
    params,
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    timeout: 60000, // 60 s — covers Render free-tier cold starts (~30–55 s)
    signal: options.signal,
  }

  const isRetriableError = (err) => {
    if (!err) return false
    if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return false
    if (err.code === 'ECONNABORTED') return true       // axios timeout
    if (err.code === 'ERR_NETWORK') return true        // dropped TCP / offline
    const status = err.response?.status
    if (status == null) return true                    // pure network error
    return status >= 500 && status < 600               // server-side hiccup
  }

  try {
    const { data } = await api.get('/trips/search', requestConfig)
    return data
  } catch (firstError) {
    if (!isRetriableError(firstError)) throw firstError
    // Brief backoff so we don't hammer a still-warming server.
    await new Promise((r) => setTimeout(r, 1500))
    const { data } = await api.get('/trips/search', {
      ...requestConfig,
      params: { ...params, _t: String(Date.now()) },
    })
    return data
  }
}

/**
 * Returns the logged-in user's last picker selection or null.
 * Skips the request entirely when there's no auth token — avoids a noisy 401
 * in DevTools for guests while still working transparently for logged-in users.
 */
export const getTripPreferences = async () => {
  if (typeof window !== 'undefined' && !window.localStorage?.getItem('jm_token')) {
    return null
  }
  try {
    const { data } = await api.get('/trips/preferences')
    return data?.preferences || null
  } catch {
    return null
  }
}

export { tripErrorMessage }

/** Wikipedia summary (English) for history modal — free API via our backend. */
export const getPlaceArticle = (q) =>
  api.get('/trips/place-article', { params: { q: String(q).trim() } }).then((r) => r.data)

/**
 * Quick-search shortcuts shown on the hero section.
 * Covers the most-searched Indian routes — each triggers
 * a full backend search with curated real data.
 */
export const POPULAR_DESTINATIONS = [
  { from: 'Delhi',     to: 'Goa',       emoji: '🏖️', tag: 'Beach'    },
  { from: 'Mumbai',    to: 'Goa',       emoji: '🌊', tag: 'Weekend'  },
  { from: 'Delhi',     to: 'Manali',    emoji: '🏔️', tag: 'Mountains'},
  { from: 'Delhi',     to: 'Jaipur',    emoji: '🏰', tag: 'Heritage' },
  { from: 'Delhi',     to: 'Rishikesh', emoji: '🧘', tag: 'Adventure'},
  { from: 'Bangalore', to: 'Goa',       emoji: '🌴', tag: 'Beach'    },
  { from: 'Mumbai',    to: 'Udaipur',   emoji: '🏛️', tag: 'Royal'   },
  { from: 'Delhi',     to: 'Amritsar',  emoji: '🕉️', tag: 'Spiritual'},
  { from: 'Hyderabad', to: 'Varanasi',  emoji: '⛵', tag: 'Spiritual'},
  { from: 'Kolkata',   to: 'Darjeeling',emoji: '🍵', tag: 'Hills'   },
]
