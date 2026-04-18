'use strict'

const ApiError = require('../../lib/ApiError')
const cityService = require('../cities/city.service')
const { CURATED_ROUTES, DESTINATION_KNOWLEDGE } = require('./trip.data')

const INDIA_CENTER = { lat: 22.5937, lng: 78.9629 }

/* ── helpers ─────────────────────────────────────────────────── */

function slugKey(from, to) {
  const norm = (s) =>
    String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${norm(from)}__${norm(to)}`
}

async function resolveCoords(name) {
  const row = await cityService.byName(name)
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

/** Generate a realistic itinerary using real destination activities */
function makeItinerary(city, activities, days, prefix) {
  const acts = [...activities]
  // Shuffle deterministically (no random)
  const itineraryDays = []
  for (let i = 0; i < days; i++) {
    const dayActs = acts.slice(i * 2, i * 2 + 3)
    if (dayActs.length === 0) dayActs.push(...activities.slice(0, 2))
    itineraryDays.push({
      day: i + 1,
      title: i === 0 ? `Arrival & First Impressions of ${city}`
           : i === days - 1 ? `Departure from ${city}`
           : `${prefix} Day ${i + 1} — ${city}`,
      activities: dayActs,
    })
  }
  return itineraryDays
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
  async search(fromRaw, toRaw) {
    if (!fromRaw || !toRaw) throw ApiError.badRequest('from and to are required')
    const [fromC, toC] = await Promise.all([resolveCoords(fromRaw), resolveCoords(toRaw)])

    const key = slugKey(fromRaw, toRaw)
    const raw = CURATED_ROUTES[key] || generateGeneric(fromRaw, toRaw)
    return attachMaps(raw, fromC, toC)
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
