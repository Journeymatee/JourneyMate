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
 * Cache-buster avoids proxy/CDN returning a stale 5-day response.
 */
export const searchTrip = async (from, to, options = {}) => {
  let days = 5
  if (options.days != null && options.days !== '') {
    const d = Math.round(Number(options.days))
    if (Number.isFinite(d)) days = Math.min(5, Math.max(1, d))
  }
  const { data } = await api.get('/trips/search', {
    params: {
      from: String(from).trim(),
      to: String(to).trim(),
      days,
      _t: String(Date.now()),
    },
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })
  return data
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
