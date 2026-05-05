'use strict'

/**
 * Tool: search_trains
 *
 * Live train search between two stations on a date. Uses the IRCTC1 provider
 * on RapidAPI when `RAPIDAPI_KEY` is set; otherwise returns deep-links to the
 * top 4 booking platforms with the route + date already pre-filled.
 *
 *   Provider docs: https://rapidapi.com/IRCTCAPI/api/irctc1
 *
 * The RapidAPI IRCTC1 endpoints used:
 *   GET /api/v3/trainBetweenStations?fromStationCode=A&toStationCode=B&dateOfJourney=YYYY-MM-DD
 *   GET /api/v1/searchTrain?query=<train#>
 *   GET /api/v1/checkSeatAvailability (for confirmed/availability)
 *
 * Stations may be passed as either the 3-4 letter code (e.g. "NDLS") or the
 * full city name. Cities get resolved to a sane code via a small built-in
 * lookup (so the same tool works for end-users typing "Delhi to Mumbai").
 */

const env = require('../../../config/env')
const { fetchJson, ensureFutureDate } = require('./_http')

const NAME = 'search_trains'
const DESCRIPTION =
  'Search live train availability between two stations on a given date. ' +
  'Returns the list of trains on that route with name, number, departure ' +
  'and arrival times, classes, and live seat availability when available. ' +
  'Always returns deep-links to official booking platforms (IRCTC, ixigo, ' +
  'Cleartrip, ConfirmTkt) so the user can finish the booking even if live ' +
  'data is missing.'

const SCHEMA = {
  type: 'function',
  function: {
    name: NAME,
    description: DESCRIPTION,
    parameters: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Origin city or 3-4 letter station code (e.g. "Delhi" or "NDLS").',
        },
        to: {
          type: 'string',
          description: 'Destination city or 3-4 letter station code.',
        },
        date: {
          type: 'string',
          description: 'Journey date in YYYY-MM-DD. Defaults to today.',
        },
        class: {
          type: 'string',
          enum: ['SL', '2S', '3A', '2A', '1A', 'CC', 'EC'],
          description: 'Optional preferred coach class.',
        },
      },
      required: ['from', 'to'],
    },
  },
}

/**
 * Tiny city → IRCTC station code lookup. Only the most-common ~70 stations
 * are baked in — enough for 95% of search queries on this site. Anything
 * else gets passed through to the provider as a code (or used verbatim).
 */
const STATION_CODES = {
  // metros
  delhi: 'NDLS', 'new delhi': 'NDLS',
  'old delhi': 'DLI',
  'hazrat nizamuddin': 'NZM', nizamuddin: 'NZM',
  mumbai: 'CSMT', 'mumbai cst': 'CSMT', 'mumbai central': 'BCT', cst: 'CSMT',
  'bandra terminus': 'BDTS',
  bengaluru: 'SBC', bangalore: 'SBC',
  chennai: 'MAS', 'chennai central': 'MAS',
  kolkata: 'HWH', howrah: 'HWH', sealdah: 'SDAH',
  hyderabad: 'SC', secunderabad: 'SC',
  pune: 'PUNE',
  ahmedabad: 'ADI',
  // common cities
  jaipur: 'JP', udaipur: 'UDZ', jodhpur: 'JU', jaisalmer: 'JSM',
  agra: 'AGC', varanasi: 'BSB', lucknow: 'LKO', kanpur: 'CNB',
  bhopal: 'BPL', indore: 'INDB', nagpur: 'NGP', surat: 'ST', vadodara: 'BRC',
  amritsar: 'ASR', chandigarh: 'CDG', dehradun: 'DDN', haridwar: 'HW',
  patna: 'PNBE', bhubaneswar: 'BBS', puri: 'PURI',
  guwahati: 'GHY', siliguri: 'SGUJ', 'new jalpaiguri': 'NJP',
  goa: 'MAO', madgaon: 'MAO', 'vasco da gama': 'VSG',
  kochi: 'ERS', ernakulam: 'ERS', trivandrum: 'TVC', thiruvananthapuram: 'TVC',
  mysore: 'MYS', mysuru: 'MYS',
  vijayawada: 'BZA', visakhapatnam: 'VSKP', vizag: 'VSKP',
  // hill stations
  shimla: 'SML', kalka: 'KLK', manali: 'CDG', // Manali has no rail — Chandigarh is the railhead.
}

function resolveStation(value) {
  const raw = String(value || '').trim()
  if (!raw) return null
  // Looks like a station code (3-5 uppercase letters, e.g. "NDLS").
  if (/^[A-Z]{2,5}$/.test(raw)) return { code: raw, label: raw, resolved: 'as-code' }
  const lower = raw.toLowerCase()
  if (STATION_CODES[lower]) {
    return { code: STATION_CODES[lower], label: titleCase(raw), resolved: 'lookup' }
  }
  // Last-ditch: pass the city name back as both code & label so the UI
  // can still build deep-links. The live-API call won't work without an
  // IRCTC code though, so we mark the resolved flag.
  return { code: '', label: titleCase(raw), resolved: 'unknown' }
}

function titleCase(s) {
  return String(s || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function slug(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, '-')
}

function buildDeepLinks({ from, to, date }) {
  const enc = encodeURIComponent
  return [
    {
      name: 'IRCTC',
      tag: 'Official',
      url: 'https://www.irctc.co.in/nget/train-search',
      note: 'Lowest base price — official Indian Railways portal.',
    },
    {
      name: 'ixigo Trains',
      tag: 'Pre-filled',
      url: `https://www.ixigo.com/trains/${slug(from.label)}-to-${slug(to.label)}/${enc(date)}`,
      note: 'Side-by-side trains + live seat availability.',
    },
    {
      name: 'ConfirmTkt',
      tag: 'Predict',
      url: `https://www.confirmtkt.com/rbooking-train-search?from=${enc(from.code || from.label)}&to=${enc(to.code || to.label)}&date=${enc(date)}`,
      note: 'Best for predicting whether a waitlist will confirm.',
    },
    {
      name: 'Cleartrip',
      tag: 'Pre-filled',
      url: `https://www.cleartrip.com/trains/results/?from=${enc(from.label)}&to=${enc(to.label)}&date=${enc(date)}`,
      note: 'Clean booking flow, easy seat selection.',
    },
  ]
}

function shapeProviderTrain(t) {
  // Defensive shaping — RapidAPI shapes vary across endpoints. We pull the
  // most-likely fields and ignore the rest.
  if (!t || typeof t !== 'object') return null
  return {
    train_number: String(t.train_number || t.trainNumber || t.number || '').trim() || null,
    train_name: String(t.train_name || t.trainName || t.name || '').trim() || null,
    from_station: t.from_station_code || t.from || t.fromStn || null,
    to_station: t.to_station_code || t.to || t.toStn || null,
    departure: t.from_std || t.std || t.departureTime || null,
    arrival: t.to_sta || t.sta || t.arrivalTime || null,
    duration: t.duration || t.travelTime || null,
    distance_km: t.distance ? Number(t.distance) : null,
    classes: Array.isArray(t.class_type)
      ? t.class_type
      : typeof t.classes === 'string'
      ? t.classes.split(',').map((s) => s.trim())
      : null,
    days: t.run_days || t.days || null,
    seat_availability: t.seat_availability || null,
  }
}

/**
 * IRCTC1 (RapidAPI) has tweaked its endpoint path several times — for the
 * "Trains between stations" lookup we've seen `getTrainBetweenStations`,
 * `getTrainsBetweenStations`, `trainBetweenStations` (no `get`), and the
 * v1 alias `searchTrain`. We try them in order until one returns 2xx so
 * the agent keeps working across provider versions.
 */
const TRAIN_BETWEEN_PATHS = [
  '/api/v3/getTrainsBetweenStations',
  '/api/v3/getTrainBetweenStations',
  '/api/v3/trainBetweenStations',
  '/api/v1/trainBetweenStations',
]

async function fetchLiveTrains({ from, to, date }) {
  if (!env.RAPIDAPI_KEY) return null
  if (!from.code || !to.code) return null

  const headers = {
    'X-RapidAPI-Key': env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': env.RAPIDAPI_TRAIN_HOST,
  }
  const qs =
    `?fromStationCode=${encodeURIComponent(from.code)}` +
    `&toStationCode=${encodeURIComponent(to.code)}` +
    `&dateOfJourney=${encodeURIComponent(date)}`

  let data = null
  for (const path of TRAIN_BETWEEN_PATHS) {
    const url = `https://${env.RAPIDAPI_TRAIN_HOST}${path}${qs}`
    data = await fetchJson(url, { headers })
    if (data) break
  }
  if (!data) return null
  const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : null
  if (!list) return null
  return list
    .map(shapeProviderTrain)
    .filter((t) => t && (t.train_number || t.train_name))
    .slice(0, 12)
}

async function run(args = {}) {
  const fromStn = resolveStation(args.from)
  const toStn = resolveStation(args.to)
  const date = ensureFutureDate(args.date)

  if (!fromStn || !toStn) {
    return { ok: false, error: 'Both "from" and "to" are required.' }
  }

  const trains = (await fetchLiveTrains({ from: fromStn, to: toStn, date }).catch(() => null)) || null

  return {
    ok: true,
    provider: trains ? 'irctc1.rapidapi' : 'fallback',
    from: { input: args.from, code: fromStn.code, label: fromStn.label, resolved: fromStn.resolved },
    to: { input: args.to, code: toStn.code, label: toStn.label, resolved: toStn.resolved },
    date,
    class: args.class || null,
    trains: trains || [],
    deep_links: buildDeepLinks({ from: fromStn, to: toStn, date }),
    note: trains
      ? 'Live data via IRCTC1 (RapidAPI). Verify on IRCTC before booking — Tatkal seats sell out within minutes.'
      : 'Live train data unavailable in this environment. The booking links below are pre-filled with your route — open one to see real-time prices and seat availability.',
  }
}

module.exports = { name: NAME, description: DESCRIPTION, schema: SCHEMA, run, resolveStation }
