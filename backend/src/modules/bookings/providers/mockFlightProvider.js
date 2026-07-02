'use strict'

/**
 * Mock flight provider — same contract as the train provider.
 *
 * Generates deterministic flight options between two cities so the
 * Booking flow has data to render before we sign with a real GDS
 * (Amadeus / Travelpayouts / Skyscanner).
 */

const CABINS = Object.freeze({
  economy:  { label: 'Economy',         factor: 1.0  },
  premium:  { label: 'Premium Economy', factor: 1.7  },
  business: { label: 'Business',        factor: 3.4  },
})

const AIRLINES = Object.freeze([
  { code: '6E', name: 'IndiGo',     baseFare: 4200,  duration: 110 },
  { code: 'AI', name: 'Air India',  baseFare: 5400,  duration: 125 },
  { code: 'UK', name: 'Vistara',    baseFare: 5800,  duration: 115 },
  { code: 'SG', name: 'SpiceJet',   baseFare: 3950,  duration: 130 },
  { code: 'I5', name: 'AirAsia I',  baseFare: 4300,  duration: 120 },
])

function hashStr(s) {
  let h = 5381
  const str = String(s || '')
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  return h
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function mins2hhmm(start, durationMins) {
  const total = start + durationMins
  return `${pad2(Math.floor((total / 60) % 24))}:${pad2(total % 60)}`
}

function buildSeatGrid(flightId, cabin) {
  // Single 30-row × 6-seat (A-F) cabin map. ~25% pre-booked, deterministic.
  const seed = hashStr(`${flightId}|${cabin}`)
  const rows = cabin === 'business' ? 6 : cabin === 'premium' ? 4 : 30
  const layout = cabin === 'business' ? ['A', 'C', 'D', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F']
  const grid = []
  for (let r = 1; r <= rows; r += 1) {
    grid.push({
      row: r,
      seats: layout.map((letter, idx) => ({
        id: `${r}${letter}`,
        label: `${r}${letter}`,
        kind: idx === 0 || idx === layout.length - 1
          ? 'window'
          : (cabin === 'business' && (idx === 1 || idx === 2)) || (cabin !== 'business' && (idx === 2 || idx === 3))
            ? 'aisle'
            : 'middle',
        available: ((seed + r * 31 + letter.charCodeAt(0)) % 100) >= 25,
      })),
    })
  }
  return { cabin, rows: grid }
}

const provider = Object.freeze({
  name: 'mock-flight',

  async fetchInventory({ origin, destination, travelDate }) {
    const seed = hashStr(`${origin || ''}|${destination || ''}|${travelDate || ''}`)
    return AIRLINES.map((airline, idx) => {
      const departHourBase = 6 + ((seed + idx * 7) % 14) // 06:00-19:00 spread
      const departMins = departHourBase * 60 + ((seed + idx * 13) % 4) * 15
      const arriveHHMM = mins2hhmm(departMins, airline.duration)
      const fares = Object.fromEntries(
        Object.entries(CABINS).map(([code, meta]) => [
          code,
          {
            label: meta.label,
            price: Math.round(airline.baseFare * meta.factor + ((seed + idx * 17) % 600)),
            currency: 'INR',
            available: 6 + ((seed + idx * 19) % 30),
          },
        ])
      )
      return {
        id: `flight:${airline.code}-${100 + idx}`,
        type: 'flight',
        provider: 'mock-flight',
        title: `${airline.name} · ${airline.code}-${100 + idx}`,
        origin,
        destination,
        departs: `${pad2(Math.floor(departMins / 60))}:${pad2(departMins % 60)}`,
        arrives: arriveHHMM,
        durationMins: airline.duration,
        stops: idx === 4 ? 1 : 0,
        fares,
        meta: { airlineCode: airline.code, airlineName: airline.name, flightNo: `${airline.code}-${100 + idx}` },
      }
    })
  },

  async priceQuote({ inventoryItem, classCode = 'economy', passengerCount = 1 }) {
    const fare = inventoryItem?.fares?.[classCode]
    if (!fare) {
      const err = new Error(`Cabin ${classCode} not available on this flight`)
      err.statusCode = 400
      throw err
    }
    const subtotal = fare.price * Math.max(1, Math.round(passengerCount))
    const fees = Math.round(subtotal * 0.07) // 5% GST + 2% airport fees approx
    return {
      currency: 'INR',
      subtotal,
      fees,
      total: subtotal + fees,
      breakdown: [
        { label: `${fare.label} × ${passengerCount}`, value: subtotal },
        { label: 'Taxes & airport fees',              value: fees },
      ],
    }
  },

  async fetchSeatMap({ inventoryItem, classCode = 'economy' }) {
    return {
      classCode,
      classLabel: CABINS[classCode]?.label || classCode,
      ...buildSeatGrid(inventoryItem?.id || 'flight', classCode),
    }
  },

  async confirmBooking({ bookingRef }) {
    // Six-letter PNR — IATA standard.
    const seed = hashStr(`${bookingRef}|pnr`)
    const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    let pnr = ''
    for (let i = 0; i < 6; i += 1) pnr += alpha[(seed + i * 41) % alpha.length]
    return {
      providerRef: pnr,
      ticketUrl: null,
      message: 'Confirmed (demo). A real PNR will be issued once a GDS is connected.',
    }
  },

  async cancelBooking({ bookingRef }) {
    return {
      providerRef: bookingRef,
      refundAmount: null,
      message: 'Cancellation recorded (demo). Refund will reflect once payments are wired up.',
    }
  },
})

module.exports = provider
