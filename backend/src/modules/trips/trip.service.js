'use strict'

const ApiError = require('../../lib/ApiError')
const cityService = require('../cities/city.service')
const { enrichForComparison, getWikipediaSummary } = require('./placeIntel.service')
const {
  CURATED_ROUTES,
  DESTINATION_KNOWLEDGE,
  getDestinationStreetFood,
} = require('./trip.data')
const tripVibeEngine = require('./tripVibe.engine')

const INDIA_CENTER = { lat: 22.5937, lng: 78.9629 }

/* ── In-memory result cache ──────────────────────────────────────
 * Caches the *enriched* response (excluding tripType / vibes overrides,
 * which are applied per-request after the cache hit). Big speed-up for
 * repeat queries on common routes — TTL 10 min keeps weather fresh-ish.
 */
const SEARCH_CACHE = new Map() // key -> { at, response }
const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000
const SEARCH_CACHE_MAX = 200

function cacheGet(key) {
  const hit = SEARCH_CACHE.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > SEARCH_CACHE_TTL_MS) {
    SEARCH_CACHE.delete(key)
    return null
  }
  return hit.response
}

function cacheSet(key, response) {
  if (SEARCH_CACHE.size >= SEARCH_CACHE_MAX) {
    // drop oldest (Map preserves insertion order)
    const firstKey = SEARCH_CACHE.keys().next().value
    if (firstKey != null) SEARCH_CACHE.delete(firstKey)
  }
  SEARCH_CACHE.set(key, { at: Date.now(), response })
}

/* ── helpers ─────────────────────────────────────────────────── */

function slugKey(from, to) {
  const norm = (s) =>
    String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${norm(from)}__${norm(to)}`
}

async function resolveCoords(name) {
  // Fuzzy DB lookup first — recovers from common typos like "Banglore",
  // "Varansi", "Mumbi" before we pay for a Nominatim round-trip.
  const row = await cityService.byNameFuzzy(name)
  if (row) return { lat: Number(row.lat), lng: Number(row.lng), label: row.name, slug: row.slug }
  const apiRes = await cityService.searchNominatim(name, { limit: 1 })
  if (apiRes[0]) return { lat: apiRes[0].lat, lng: apiRes[0].lng, label: apiRes[0].name, slug: null }
  return { ...INDIA_CENTER, label: name, slug: null }
}

/**
 * Deterministic hash so the same route always gets the same price.
 * No more random() — prices are stable across sessions.
 */
function djb2(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function deterministicPrices(from, to) {
  const key = `${from.toLowerCase().trim()}-${to.toLowerCase().trim()}`
  const h = djb2(key)
  // Silver: ₹5,000–₹22,000 based on route hash
  const silverPrice = 5000 + (h % 17001)
  // Gold: 1.8× to 2.8× silver
  const multiplier = 1.8 + ((h >> 8) % 11) * 0.1
  const goldPrice = Math.round(silverPrice * multiplier / 100) * 100
  return { silverPrice, goldPrice }
}

/** Pick destination-specific knowledge, fallback to default */
function getDestKnowledge(to) {
  const key = to.toLowerCase().trim().replace(/\s+/g, '')
  for (const [k, v] of Object.entries(DESTINATION_KNOWLEDGE)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  return DESTINATION_KNOWLEDGE.default
}

/**
 * @param {object} [opts] startIndex: day offset for this segment; totalDays: last day of full trip (for Arrival/Departure titles)
 */
function makeItinerary(city, activities, days, prefix, opts = {}) {
  const { startIndex = 0, totalDays = startIndex + days } = opts
  const acts = [...activities]
  const itineraryDays = []
  for (let i = 0; i < days; i += 1) {
    const abs = startIndex + i
    const dayNo = abs + 1
    const dayActs = acts.slice(abs * 2, abs * 2 + 3)
    if (dayActs.length === 0) dayActs.push(...activities.slice(0, 2))
    const title = (() => {
      if (totalDays === 1) {
        return `Key sights in one day — ${city} (arrival, visit & return)`
      }
      if (abs === 0) return `Arrival & First Impressions of ${city}`
      if (abs === totalDays - 1) return `Departure from ${city}`
      return `${prefix} Day ${dayNo} — ${city}`
    })()
    itineraryDays.push({ day: dayNo, title, activities: dayActs })
  }
  return itineraryDays
}

/** User-selected itinerary length: 1–5 days (visit places by day; max 5 in UI). */
function parseRequestedDays(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return 5
  const n = parseInt(String(raw).trim(), 10)
  if (Number.isNaN(n) || n < 1) return 5
  return Math.min(5, n)
}

function formatDurationFromDays(n) {
  if (n <= 1) return '1 Day'
  const ni = n - 1
  return `${n} Day${n > 1 ? 's' : ''} / ${ni} Night${ni > 1 ? 's' : ''}`
}

function renumberItinerary(arr) {
  return (arr || []).map((d, i) => ({ ...d, day: i + 1 }))
}

/**
 * Reference days the list price is “for” (1–5). Shorter user picks → lower price.
 * Curated routes: use the longer of silver/gold itinerary length, capped at 5.
 * Generic: both plans start at 5 days.
 */
function referenceListDays(trip) {
  const a = trip.silver?.itinerary?.length || 0
  const b = trip.gold?.itinerary?.length || 0
  const m = Math.max(a, b, 1)
  return Math.min(5, m)
}

function scalePlanPriceForDays(plan, nDays, refDays) {
  const ref = Math.min(5, Math.max(1, refDays))
  const n = Math.min(5, Math.max(1, nDays))
  const base = Number(plan.price)
  if (!Number.isFinite(base) || base <= 0) return { ...plan, price: plan.price }
  const raw = (base * n) / ref
  const rounded = Math.round(raw / 100) * 100
  const min = plan.price >= 15000 ? 4000 : 2000
  return { ...plan, price: Math.max(min, rounded) }
}

function regenGenericPlan(destLabel, isGold, plan, nDays) {
  const dest = getDestKnowledge(destLabel)
  const act = isGold ? dest.activities.slice(2, 10) : dest.activities.slice(0, 8)
  const prefix = isGold ? 'Premium' : 'Explore'
  return {
    ...plan,
    itinerary: makeItinerary(destLabel, act, nDays, prefix),
  }
}

function reshapeCuratedPlan(plan, nDays, destLabel, prefix) {
  const it0 = plan.itinerary || []
  const dest = getDestKnowledge(destLabel)
  const pool = dest.activities
  if (it0.length === 0) {
    return { ...plan, itinerary: makeItinerary(destLabel, pool, nDays, prefix) }
  }
  if (nDays <= it0.length) {
    return { ...plan, itinerary: renumberItinerary(it0.slice(0, nDays)) }
  }
  const base = renumberItinerary(it0)
  const more = nDays - it0.length
  return {
    ...plan,
    itinerary: [
      ...base,
      ...makeItinerary(destLabel, pool, more, prefix, { startIndex: it0.length, totalDays: nDays }),
    ],
  }
}

function applyRequestedDaysToTrip(trip, nDays, destLabel, isCurated) {
  const d = formatDurationFromDays(nDays)
  const refDays = referenceListDays(trip)
  if (!isCurated) {
    const silver = regenGenericPlan(destLabel, false, trip.silver, nDays)
    const gold = regenGenericPlan(destLabel, true, trip.gold, nDays)
    return {
      ...trip,
      duration: d,
      silver: scalePlanPriceForDays(silver, nDays, refDays),
      gold: scalePlanPriceForDays(gold, nDays, refDays),
    }
  }
  const silver = reshapeCuratedPlan(trip.silver, nDays, destLabel, 'Explore')
  const gold = reshapeCuratedPlan(trip.gold, nDays, destLabel, 'Premium')
  return {
    ...trip,
    duration: d,
    silver: scalePlanPriceForDays(silver, nDays, refDays),
    gold: scalePlanPriceForDays(gold, nDays, refDays),
  }
}

function generateGeneric(from, to) {
  const { silverPrice, goldPrice } = deterministicPrices(from, to)
  const dest = getDestKnowledge(to)

  const silverActivities = dest.activities.slice(0, 8)
  const goldActivities = dest.activities.slice(2, 10)

  return {
    duration: '5 Days / 4 Nights',
    tag: dest.tag,
    silver: {
      price: silverPrice,
      transport: 'Train (AC 3-Tier / Sleeper)',
      accommodation: 'Budget Hostel / OYO Rooms',
      dining: 'Local Restaurants & Street Food',
      transport_detail: 'Indian Railways — book on IRCTC.co.in; travel time varies by route',
      accommodation_detail: 'OYO Rooms / Zostel / local guesthouse — ₹500–1,200/night',
      dining_detail: 'Local dhabas, street food stalls, budget restaurants near sights',
      perks: ['WiFi at guesthouse', 'City orientation map', 'Activity booking desk', 'Common lounge'],
      itinerary: makeItinerary(to, silverActivities, 5, 'Explore'),
    },
    gold: {
      price: goldPrice,
      transport: 'Flight (Direct / 1-stop)',
      accommodation: 'Premium Hotel (4–5 Star)',
      dining: 'Fine Dining & Curated Experiences',
      transport_detail: 'Direct flight — book on Google Flights / ixigo for best prices',
      accommodation_detail: 'Taj / Marriott / ITC / Oberoi — Deluxe or Suite room',
      dining_detail: 'Hotel signature restaurant, curated local dining experiences',
      perks: ['Airport transfers both ways', 'Daily breakfast included', 'Concierge on call', 'Spa access', 'Late checkout'],
      itinerary: makeItinerary(to, goldActivities, 5, 'Premium'),
    },
  }
}

/** Spread itinerary pins around destination */
function attachMaps(trip, fromC, toC) {
  const enrich = (plan) => ({
    ...plan,
    itinerary: plan.itinerary.map((d, i) => {
      const angle = (i / Math.max(plan.itinerary.length, 1)) * 2 * Math.PI
      const r = 0.035
      return {
        ...d,
        map: {
          lat: toC.lat + r * Math.sin(angle),
          lng: toC.lng + r * Math.cos(angle),
          label: `${toC.label} · ${d.title}`,
        },
      }
    }),
  })
  return {
    ...trip,
    origin: fromC.label,
    destination: toC.label,
    maps: {
      origin:      { lat: fromC.lat, lng: fromC.lng, label: fromC.label },
      destination: { lat: toC.lat,   lng: toC.lng,   label: toC.label  },
    },
    silver: enrich(trip.silver),
    gold: enrich(trip.gold),
  }
}

/* ── service ─────────────────────────────────────────────────── */

const tripService = {
  /**
   * @param {{ days?: string|number, tripType?: string, vibes?: string|string[] }} [options]
   *   - `days`     Requested trip length 1–5 days (itinerary days per UI).
   *   - `tripType` solo | couple | family | friends (or absent).
   *   - `vibes`    Comma-separated list (or array) of vibe ids — see tripVibe.engine.
   */
  async search(fromRaw, toRaw, options = {}) {
    if (!fromRaw || !toRaw) throw ApiError.badRequest('from and to are required')
    const nDays = parseRequestedDays(options.days)
    const { tripType, vibes } = tripVibeEngine.normalizeSelection(options.tripType, options.vibes)

    // Cache key intentionally excludes tripType/vibes (applied below) but
    // includes nDays since itinerary shape depends on it.
    const cacheKey = `${slugKey(fromRaw, toRaw)}|d=${nDays}`
    let base = cacheGet(cacheKey)

    if (!base) {
      const [fromC, toC] = await Promise.all([resolveCoords(fromRaw), resolveCoords(toRaw)])
      const key = slugKey(fromRaw, toRaw)
      const isCurated = Boolean(CURATED_ROUTES[key])
      const raw0 = CURATED_ROUTES[key] || generateGeneric(fromRaw, toRaw)
      const raw = applyRequestedDaysToTrip(raw0, nDays, toC.label, isCurated)
      const withMaps = attachMaps(raw, fromC, toC)
      const emptyIntel = { osrm: null, wikipedia: null, topSights: [], weather: null, attributions: [] }

      // enrichForComparison is already bounded to ~9 s max via withSoftTimeout
      // inside placeIntel.service. We still wrap in try/catch in case any
      // future change throws synchronously.
      let placeIntel = null
      try {
        placeIntel = await enrichForComparison(fromC, toC)
      } catch {
        placeIntel = emptyIntel
      }
      const streetFood = await getDestinationStreetFood(toC.label, { tier: 'all' })
        .catch(() => [])

      base = { ...withMaps, placeIntel: placeIntel || emptyIntel, requestedDays: nDays, streetFood }
      cacheSet(cacheKey, base)
    }

    // Apply trip type & vibe overrides last so they affect the final price.
    return tripVibeEngine.applyToTrip(base, tripType, vibes)
  },

  async placeArticle(qRaw) {
    const q = String(qRaw || '').trim()
    if (q.length < 2) throw ApiError.badRequest('query too short')
    const article = await getWikipediaSummary(q)
    if (!article) throw ApiError.notFound('No Wikipedia article found for that search')
    return { article }
  },

  listPopular() {
    return Object.values(CURATED_ROUTES).map((r) => ({
      from:         r.from,
      to:           r.to,
      duration:     r.duration,
      tag:          r.tag,
      silverPrice:  r.silver.price,
      goldPrice:    r.gold.price,
      highlights:   (r.silver.itinerary?.[0]?.activities || []).slice(0, 3),
      transport:    r.silver.transport,
      accommodation: r.silver.accommodation,
    }))
  },
}

module.exports = tripService
