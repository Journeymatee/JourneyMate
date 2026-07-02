'use strict'

/**
 * Mock hotel provider — same contract as the train/flight providers.
 *
 * Generates plausible hotel inventory with three room tiers per
 * property. The Booking flow's "RoomPicker" step reads from this.
 */

const ROOM_TIERS = Object.freeze({
  standard: { label: 'Standard',     factor: 1.0, capacity: 2 },
  deluxe:   { label: 'Deluxe',       factor: 1.45, capacity: 3 },
  suite:    { label: 'Suite',        factor: 2.4,  capacity: 4 },
})

const PROPERTIES = Object.freeze([
  { id: 'hotel:taj-1',      name: 'Taj Mahal Palace',          rating: 5, base: 11500 },
  { id: 'hotel:itc-1',      name: 'ITC Maurya',                rating: 5, base: 9800 },
  { id: 'hotel:novotel-1',  name: 'Novotel Imagica',           rating: 4, base: 6400 },
  { id: 'hotel:lemontree-1', name: 'Lemon Tree Premier',       rating: 4, base: 5200 },
  { id: 'hotel:treebo-1',   name: 'Treebo Trend Heritage',     rating: 3, base: 2900 },
  { id: 'hotel:oyo-1',      name: 'OYO Capital Stay',          rating: 3, base: 1800 },
])

function hashStr(s) {
  let h = 5381
  const str = String(s || '')
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0
  return h
}

const provider = Object.freeze({
  name: 'mock-hotel',

  async fetchInventory({ destination, checkIn }) {
    const seed = hashStr(`${destination || ''}|${checkIn || ''}`)
    return PROPERTIES.map((p, idx) => {
      const rooms = Object.fromEntries(
        Object.entries(ROOM_TIERS).map(([code, meta]) => [
          code,
          {
            label: meta.label,
            capacity: meta.capacity,
            pricePerNight: Math.round(p.base * meta.factor + ((seed + idx * 23) % 800)),
            currency: 'INR',
            available: 2 + ((seed + idx * 11) % 18),
          },
        ])
      )
      return {
        id: p.id,
        type: 'hotel',
        provider: 'mock-hotel',
        title: p.name,
        rating: p.rating,
        destination,
        rooms,
        meta: { hotelName: p.name, rating: p.rating },
      }
    })
  },

  async priceQuote({ inventoryItem, classCode = 'standard', passengerCount = 1, nights = 1 }) {
    const room = inventoryItem?.rooms?.[classCode]
    if (!room) {
      const err = new Error(`Room tier ${classCode} not available at this hotel`)
      err.statusCode = 400
      throw err
    }
    const safeNights = Math.max(1, Math.round(nights))
    const subtotal = room.pricePerNight * safeNights * Math.max(1, Math.ceil(passengerCount / room.capacity))
    const fees = Math.round(subtotal * 0.12) // GST 12% on hotel rooms
    return {
      currency: 'INR',
      subtotal,
      fees,
      total: subtotal + fees,
      breakdown: [
        { label: `${room.label} × ${safeNights} night${safeNights === 1 ? '' : 's'}`, value: subtotal },
        { label: 'GST (12%)',                                                          value: fees },
      ],
    }
  },

  async fetchSeatMap({ inventoryItem, classCode = 'standard' }) {
    // Hotels don't have seat maps — return a list of room numbers
    // instead, formatted the same way so the frontend can stay generic.
    const seed = hashStr(`${inventoryItem?.id || 'hotel'}|${classCode}`)
    const rooms = []
    for (let floor = 1; floor <= 5; floor += 1) {
      for (let n = 1; n <= 10; n += 1) {
        const number = floor * 100 + n
        const occupied = ((seed + floor * 13 + n * 7) % 100) < 30
        rooms.push({
          id: `room-${number}`,
          number,
          floor,
          available: !occupied,
        })
      }
    }
    return {
      classCode,
      classLabel: ROOM_TIERS[classCode]?.label || classCode,
      rooms,
    }
  },

  async confirmBooking({ bookingRef }) {
    // Hotels typically issue an alphanumeric voucher number.
    const seed = hashStr(`${bookingRef}|voucher`)
    const ref = `H-${String(seed).slice(0, 7)}`
    return {
      providerRef: ref,
      ticketUrl: null,
      message: 'Confirmed (demo). A real voucher will be issued once Booking.com Affiliate is wired up.',
    }
  },

  async cancelBooking({ bookingRef }) {
    return {
      providerRef: bookingRef,
      refundAmount: null,
      message: 'Cancellation recorded (demo).',
    }
  },
})

module.exports = provider
