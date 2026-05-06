'use strict'

/**
 * Mock train provider.
 *
 * Generates deterministic, plausible train inventory + seat layouts so
 * the UI has something to render today. When IRCTC / RailYatri /
 * RapidAPI is wired up, only this file changes — every call site in
 * `bookings.service.js` keeps working unchanged (Open/Closed).
 */

const CLASSES = Object.freeze({
  SL:  { label: 'Sleeper',          factor: 1.0  },
  '3A': { label: 'AC 3-Tier',       factor: 2.4  },
  '2A': { label: 'AC 2-Tier',       factor: 3.6  },
  '1A': { label: 'AC First',        factor: 5.6  },
  CC:  { label: 'AC Chair Car',     factor: 1.6  },
})

const TRAINS = Object.freeze([
  { number: '12951', name: 'Mumbai Rajdhani Express',     departs: '17:00', arrives: '08:35', durationMins: 925, runsOn: 'Daily',          basePerKm: 1.85 },
  { number: '12309', name: 'New Delhi Rajdhani',          departs: '16:55', arrives: '09:55', durationMins: 1020, runsOn: 'Daily',          basePerKm: 1.80 },
  { number: '12001', name: 'Bhopal Shatabdi',             departs: '06:00', arrives: '14:05', durationMins: 485, runsOn: 'Daily ex Friday', basePerKm: 1.95 },
  { number: '22691', name: 'Rajdhani SBC',                departs: '20:00', arrives: '06:25', durationMins: 1225, runsOn: 'Daily',          basePerKm: 1.78 },
  { number: '12286', name: 'Hazrat Nizamuddin Duronto',   departs: '15:55', arrives: '06:00', durationMins: 845, runsOn: 'Tri-weekly',      basePerKm: 1.70 },
])

function hashStr(s) {
  let h = 5381
  const str = String(s || '')
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  return h
}

function approxKm(origin, destination) {
  // Rough deterministic distance based on the input pair so the same
  // route always produces the same price. ~600-1500 km — typical for
  // long-distance Indian rail journeys.
  const seed = hashStr(`${origin || ''}|${destination || ''}`)
  return 600 + (seed % 900)
}

function buildSeatMap(trainNumber, classCode) {
  // Two coaches × eight bays × six berths = 96 berths per coach.
  // Mark a deterministic 18-22% of berths as already booked so the UI
  // has something to render as "unavailable" right away.
  const seed = hashStr(`${trainNumber}|${classCode}`)
  const coaches = []
  const layout = classCode === 'SL' || classCode === '3A'
    ? ['LB', 'MB', 'UB', 'LB', 'MB', 'UB']
    : ['LB', 'UB', 'LB', 'UB', 'SL', 'SU']

  const coachLetter = classCode === 'SL' ? 'S' : classCode.startsWith('3') ? 'B' : classCode.startsWith('2') ? 'A' : classCode.startsWith('1') ? 'H' : 'C'

  for (let c = 1; c <= 2; c += 1) {
    const seats = []
    for (let bay = 1; bay <= 8; bay += 1) {
      for (let pos = 0; pos < layout.length; pos += 1) {
        const number = (bay - 1) * layout.length + pos + 1
        const occupied = ((seed + c * 53 + number * 17) % 100) < 20
        seats.push({
          id: `${coachLetter}${c}-${number}`,
          number,
          berth: layout[pos],
          available: !occupied,
        })
      }
    }
    coaches.push({ name: `${coachLetter}${c}`, seats })
  }
  return coaches
}

const provider = Object.freeze({
  name: 'mock-train',

  async fetchInventory({ origin, destination, travelDate }) {
    const km = approxKm(origin, destination)
    return TRAINS.map((t) => {
      const base = Math.round(km * t.basePerKm)
      const fares = Object.fromEntries(
        Object.entries(CLASSES).map(([code, meta]) => [
          code,
          {
            label: meta.label,
            price: Math.round(base * meta.factor),
            currency: 'INR',
            available: 18 + (hashStr(`${t.number}|${code}|${travelDate || ''}`) % 50),
          },
        ])
      )
      return {
        id: `train:${t.number}`,
        type: 'train',
        provider: 'mock-train',
        title: `${t.number} · ${t.name}`,
        origin,
        destination,
        departs: t.departs,
        arrives: t.arrives,
        durationMins: t.durationMins,
        runsOn: t.runsOn,
        distanceKm: km,
        fares,
        meta: { number: t.number, name: t.name },
      }
    })
  },

  async priceQuote({ inventoryItem, classCode = 'SL', passengerCount = 1 }) {
    const fare = inventoryItem?.fares?.[classCode]
    if (!fare) {
      const err = new Error(`Class ${classCode} not available on this train`)
      err.statusCode = 400
      throw err
    }
    const subtotal = fare.price * Math.max(1, Math.round(passengerCount))
    const fees = Math.round(subtotal * 0.04) // GST + reservation charge approx
    return {
      currency: 'INR',
      subtotal,
      fees,
      total: subtotal + fees,
      breakdown: [
        { label: `${fare.label} × ${passengerCount}`, value: subtotal },
        { label: 'Reservation + GST',                 value: fees },
      ],
    }
  },

  async fetchSeatMap({ inventoryItem, classCode = 'SL' }) {
    const number = inventoryItem?.meta?.number || 'XXXXX'
    return {
      classCode,
      classLabel: CLASSES[classCode]?.label || classCode,
      coaches: buildSeatMap(number, classCode),
    }
  },

  async confirmBooking({ bookingRef }) {
    // 10-char PNR is the IRCTC standard.
    const seed = hashStr(`${bookingRef}|pnr`)
    const pnr = String(2 * 10 ** 9 + (seed % 8 * 10 ** 9)).slice(0, 10)
    return {
      providerRef: pnr,
      ticketUrl: null,
      message: 'Confirmed (demo). A real PNR will be issued once IRCTC is connected.',
    }
  },

  async cancelBooking({ bookingRef }) {
    return {
      providerRef: bookingRef,
      refundAmount: null,
      message: 'Cancellation recorded (demo). No real refund processed.',
    }
  },
})

module.exports = provider
