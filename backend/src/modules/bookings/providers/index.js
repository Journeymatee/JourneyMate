'use strict'

/**
 * Booking-provider registry — Strategy pattern.
 *
 * Each provider exports the same contract:
 *
 *   {
 *     name: 'mock-train',
 *     fetchInventory({ origin, destination, travelDate, ... }),
 *     priceQuote({ inventoryItem, passengerCount, classCode }),
 *     confirmBooking({ bookingRef, payload }),
 *     cancelBooking({ bookingRef })
 *   }
 *
 * The booking service depends on the **interface**, never on a concrete
 * provider — when we sign with IRCTC / Travelpayouts / Booking.com the
 * matching `mock*Provider.js` file is the only thing that changes.
 *
 * Liskov substitution: every provider returns the same shape, so the
 * service can swap them at runtime keyed only by `type` + `provider`.
 */

const trainProvider  = require('./mockTrainProvider')
const flightProvider = require('./mockFlightProvider')
const hotelProvider  = require('./mockHotelProvider')

const registry = Object.freeze({
  train:  trainProvider,
  flight: flightProvider,
  hotel:  hotelProvider,
})

function resolve(type) {
  const provider = registry[type]
  if (!provider) {
    const known = Object.keys(registry).join(', ')
    const err = new Error(`Unknown booking type "${type}". Expected one of: ${known}.`)
    err.statusCode = 400
    throw err
  }
  return provider
}

module.exports = { resolve, registry }
