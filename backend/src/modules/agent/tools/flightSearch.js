'use strict'

/**
 * Tool: search_flights
 *
 * Resolves city → IATA airport code (small built-in lookup for common Indian
 * + international cities) and returns booking-platform deep-links pre-filled
 * with the route + date.
 *
 * Live offers come from Amadeus self-service (OAuth client-credentials,
 * `AMADEUS_CLIENT_ID/SECRET` in env). When the keys are missing we still
 * return all the deep-links so the page is useful immediately.
 */

const env = require('../../../config/env')
const { fetchJson, ensureFutureDate } = require('./_http')

const NAME = 'search_flights'
const DESCRIPTION =
  'Search flights between two cities on a given date. Returns up to 8 ' +
  'live offers (when Amadeus is configured) and always returns deep-links ' +
  'to MakeMyTrip / Skyscanner / EaseMyTrip / Google Flights pre-filled with ' +
  'the route and date.'

const SCHEMA = {
  type: 'function',
  function: {
    name: NAME,
    description: DESCRIPTION,
    parameters: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Origin city or IATA code (e.g. "Delhi" or "DEL").' },
        to: { type: 'string', description: 'Destination city or IATA code.' },
        date: { type: 'string', description: 'Departure date YYYY-MM-DD. Defaults to today.' },
        return_date: { type: 'string', description: 'Return date YYYY-MM-DD. Optional.' },
        passengers: { type: 'integer', minimum: 1, maximum: 9, default: 1 },
        cabin: {
          type: 'string',
          enum: ['economy', 'premium_economy', 'business', 'first'],
          default: 'economy',
        },
      },
      required: ['from', 'to'],
    },
  },
}

const IATA = {
  // India
  delhi: 'DEL', 'new delhi': 'DEL',
  mumbai: 'BOM', bombay: 'BOM',
  bengaluru: 'BLR', bangalore: 'BLR',
  kolkata: 'CCU', calcutta: 'CCU',
  chennai: 'MAA', madras: 'MAA',
  hyderabad: 'HYD',
  pune: 'PNQ',
  ahmedabad: 'AMD',
  goa: 'GOI', dabolim: 'GOI',
  jaipur: 'JAI', udaipur: 'UDR', jodhpur: 'JDH',
  kochi: 'COK', cochin: 'COK',
  trivandrum: 'TRV', thiruvananthapuram: 'TRV',
  varanasi: 'VNS', lucknow: 'LKO', patna: 'PAT',
  guwahati: 'GAU', srinagar: 'SXR', leh: 'IXL',
  bhubaneswar: 'BBI', visakhapatnam: 'VTZ', vizag: 'VTZ',
  amritsar: 'ATQ', chandigarh: 'IXC', dehradun: 'DED',
  bagdogra: 'IXB', siliguri: 'IXB', port_blair: 'IXZ', 'port blair': 'IXZ',
  // popular international
  london: 'LHR', paris: 'CDG', dubai: 'DXB', singapore: 'SIN',
  bangkok: 'BKK', kuala_lumpur: 'KUL', 'kuala lumpur': 'KUL',
  'new york': 'JFK', 'los angeles': 'LAX', tokyo: 'HND', sydney: 'SYD',
  hongkong: 'HKG', 'hong kong': 'HKG', toronto: 'YYZ',
}

function resolveAirport(value) {
  const raw = String(value || '').trim()
  if (!raw) return null
  if (/^[A-Z]{3}$/.test(raw)) return { code: raw, label: raw, resolved: 'as-code' }
  const lower = raw.toLowerCase()
  if (IATA[lower]) return { code: IATA[lower], label: titleCase(raw), resolved: 'lookup' }
  return { code: '', label: titleCase(raw), resolved: 'unknown' }
}

function titleCase(s) {
  return String(s || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function buildDeepLinks({ from, to, date, return_date, passengers, cabin }) {
  const enc = encodeURIComponent
  const fromCode = from.code || from.label
  const toCode = to.code || to.label
  const links = [
    {
      name: 'Google Flights',
      tag: 'Compare',
      url:
        `https://www.google.com/travel/flights?q=` +
        enc(`flights from ${from.label} to ${to.label} on ${date}` + (return_date ? ` returning ${return_date}` : '')),
    },
    {
      name: 'Skyscanner',
      tag: 'Cheap',
      url:
        `https://www.skyscanner.co.in/transport/flights/${fromCode}/${toCode}/` +
        `${date.replace(/-/g, '').slice(2)}/` +
        (return_date ? `${return_date.replace(/-/g, '').slice(2)}/` : '') +
        `?adults=${passengers}&cabinclass=${cabin}`,
    },
    {
      name: 'MakeMyTrip',
      tag: 'India',
      url:
        `https://www.makemytrip.com/flight/search?itinerary=${enc(fromCode)}-${enc(toCode)}-${enc(date)}` +
        (return_date ? `_${enc(toCode)}-${enc(fromCode)}-${enc(return_date)}` : '') +
        `&tripType=${return_date ? 'R' : 'O'}&paxType=A-${passengers}_C-0_I-0&cabinClass=${cabin === 'economy' ? 'E' : cabin === 'business' ? 'B' : cabin === 'first' ? 'F' : 'PE'}`,
    },
    {
      name: 'EaseMyTrip',
      tag: 'Discounts',
      url:
        `https://flight.easemytrip.com/FlightList/Index?` +
        `srccity1=${enc(fromCode)}&deptdt_1=${enc(date)}&desticity1=${enc(toCode)}` +
        (return_date ? `&rtndt=${enc(return_date)}` : '') +
        `&adt=${passengers}&chd=0&inf=0&class=${cabin === 'economy' ? 'Economy' : cabin === 'business' ? 'Business' : 'PremiumEconomy'}`,
    },
    {
      name: 'Cleartrip',
      tag: 'Pre-filled',
      url:
        `https://www.cleartrip.com/flights/results?from=${enc(fromCode)}&to=${enc(toCode)}` +
        `&depart_date=${enc(date)}` +
        (return_date ? `&return_date=${enc(return_date)}` : '') +
        `&adults=${passengers}&childs=0&infants=0&class=${cabin === 'economy' ? 'Economy' : cabin}` +
        `&intl=${from.code && to.code ? 'n' : 'y'}`,
    },
  ]
  return links
}

let amadeusToken = null
let amadeusTokenExpiresAt = 0

async function getAmadeusToken() {
  if (!env.AMADEUS_CLIENT_ID || !env.AMADEUS_CLIENT_SECRET) return null
  if (amadeusToken && Date.now() < amadeusTokenExpiresAt - 60_000) return amadeusToken

  const data = await fetchJson('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:
      `grant_type=client_credentials&client_id=${encodeURIComponent(env.AMADEUS_CLIENT_ID)}` +
      `&client_secret=${encodeURIComponent(env.AMADEUS_CLIENT_SECRET)}`,
  })
  if (!data?.access_token) return null
  amadeusToken = data.access_token
  amadeusTokenExpiresAt = Date.now() + (Number(data.expires_in) || 1700) * 1000
  return amadeusToken
}

async function fetchAmadeusOffers({ from, to, date, return_date, passengers, cabin }) {
  if (!from.code || !to.code) return null
  const token = await getAmadeusToken()
  if (!token) return null
  const params = new URLSearchParams({
    originLocationCode: from.code,
    destinationLocationCode: to.code,
    departureDate: date,
    adults: String(passengers),
    currencyCode: 'INR',
    max: '8',
    travelClass:
      cabin === 'business' ? 'BUSINESS'
        : cabin === 'first' ? 'FIRST'
          : cabin === 'premium_economy' ? 'PREMIUM_ECONOMY'
            : 'ECONOMY',
  })
  if (return_date) params.append('returnDate', return_date)

  const data = await fetchJson(
    `https://test.api.amadeus.com/v2/shopping/flight-offers?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!data?.data || !Array.isArray(data.data)) return null
  return data.data
    .map((offer) => {
      const itin = offer.itineraries?.[0]
      const seg = itin?.segments?.[0]
      const lastSeg = itin?.segments?.[itin.segments.length - 1]
      return {
        airline: seg?.carrierCode || null,
        flight_number: seg?.number ? `${seg.carrierCode}${seg.number}` : null,
        departure: seg?.departure?.at || null,
        arrival: lastSeg?.arrival?.at || null,
        duration: itin?.duration || null,
        stops: Math.max(0, (itin?.segments?.length || 1) - 1),
        price: offer.price?.grandTotal ? Number(offer.price.grandTotal) : null,
        currency: offer.price?.currency || 'INR',
        seats_left: offer.numberOfBookableSeats || null,
        class: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || null,
      }
    })
    .slice(0, 8)
}

async function run(args = {}) {
  const fromAp = resolveAirport(args.from)
  const toAp = resolveAirport(args.to)
  const date = ensureFutureDate(args.date)
  const return_date = args.return_date && /^\d{4}-\d{2}-\d{2}$/.test(args.return_date)
    ? ensureFutureDate(args.return_date)
    : null
  const passengers = Math.min(9, Math.max(1, Number(args.passengers) || 1))
  const cabin = ['economy', 'premium_economy', 'business', 'first'].includes(args.cabin) ? args.cabin : 'economy'

  if (!fromAp || !toAp) {
    return { ok: false, error: 'Both "from" and "to" are required.' }
  }

  const offers = await fetchAmadeusOffers({
    from: fromAp, to: toAp, date, return_date, passengers, cabin,
  }).catch(() => null)

  return {
    ok: true,
    provider: offers ? 'amadeus.test' : 'fallback',
    from: { input: args.from, code: fromAp.code, label: fromAp.label, resolved: fromAp.resolved },
    to: { input: args.to, code: toAp.code, label: toAp.label, resolved: toAp.resolved },
    date,
    return_date,
    passengers,
    cabin,
    offers: offers || [],
    deep_links: buildDeepLinks({ from: fromAp, to: toAp, date, return_date, passengers, cabin }),
    note: offers
      ? 'Live fares from Amadeus (test environment) — book on the platforms below for confirmed seats.'
      : 'Live fares unavailable. Tap any platform link below — the search is pre-filled with your route and date.',
  }
}

module.exports = { name: NAME, description: DESCRIPTION, schema: SCHEMA, run, resolveAirport }
