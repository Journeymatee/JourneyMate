/**
 * Static content + lookup tables for the booking flow.
 *
 * Centralised here so the BookingFlow wizard stays declarative — every
 * label, accent colour, and copy block is `Object.freeze()`'d for
 * immutability (matches the architecture of the rest of the data layer).
 */

export const BOOKING_TYPES = Object.freeze(['train', 'flight', 'hotel'])

export const BOOKING_TYPE_META = Object.freeze({
  train: {
    label:        'Train',
    short:        'Train',
    icon:         'train',
    eyebrow:      'Indian Railways · IRCTC',
    accent:       'from-emerald-400 to-cyan-400',
    inventoryNote: 'Live IRCTC inventory will replace these mock trains once we go live.',
    classKey:     'fares',
    seatLabel:    'Berth',
    pickerCopy:   'Pick a berth in any coach. Grey berths are already booked.',
  },
  flight: {
    label:        'Flight',
    short:        'Flight',
    icon:         'plane',
    eyebrow:      'IATA-direct flights',
    accent:       'from-sky-400 to-violet-400',
    inventoryNote: 'Live GDS inventory will replace these mock flights once we go live.',
    classKey:     'fares',
    seatLabel:    'Seat',
    pickerCopy:   'Pick a seat. Window / aisle preference is shown by colour.',
  },
  hotel: {
    label:        'Hotel',
    short:        'Hotel',
    icon:         'bed',
    eyebrow:      'Hotels & resorts',
    accent:       'from-amber-400 to-rose-400',
    inventoryNote: 'Live Booking.com / HotelBeds inventory will replace these soon.',
    classKey:     'rooms',
    seatLabel:    'Room',
    pickerCopy:   'Pick a room number. Occupied rooms are greyed out.',
  },
})

export const TRAIN_CLASSES = Object.freeze([
  { code: 'SL', label: 'Sleeper' },
  { code: '3A', label: 'AC 3-Tier' },
  { code: '2A', label: 'AC 2-Tier' },
  { code: '1A', label: 'AC First' },
  { code: 'CC', label: 'Chair Car' },
])

export const FLIGHT_CABINS = Object.freeze([
  { code: 'economy',  label: 'Economy' },
  { code: 'premium',  label: 'Premium Economy' },
  { code: 'business', label: 'Business' },
])

export const HOTEL_TIERS = Object.freeze([
  { code: 'standard', label: 'Standard' },
  { code: 'deluxe',   label: 'Deluxe' },
  { code: 'suite',    label: 'Suite' },
])

export const STEPS = Object.freeze([
  { id: 'inventory',  label: 'Choose' },
  { id: 'select',     label: 'Select seat / room' },
  { id: 'passenger',  label: 'Passenger details' },
  { id: 'payment',    label: 'Pay' },
  { id: 'confirmed',  label: 'Confirmation' },
])

export const REFUND_POLICY = Object.freeze({
  train:  '100% refund up to 24 h before departure. 50% within 24 h.',
  flight: 'Refund per airline rules. Most flexi fares are fully refundable up to 1 h before departure.',
  hotel:  'Free cancellation up to 48 h before check-in. After that, the first night is non-refundable.',
})

export const DEMO_BANNER_COPY = Object.freeze({
  title:   'Demo booking',
  body:    'JourneyMate is not yet an authorised IRCTC / IATA / hotel booking partner, so this is a UX demo. No real seat is held and no money will be charged.',
  payment: 'Razorpay test mode — use card 4111 1111 1111 1111, any future expiry, any 3-digit CVV.',
})

/** Currency formatter used across the flow. Indian grouping (1,23,456). */
export function fmtInr(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `\u20B9${n.toLocaleString('en-IN')}`
}

/** Title-case a class/cabin/tier code for display. */
export function classLabel(type, code) {
  if (!code) return ''
  const list = type === 'train' ? TRAIN_CLASSES
             : type === 'flight' ? FLIGHT_CABINS
             : type === 'hotel' ? HOTEL_TIERS
             : []
  const hit = list.find((c) => c.code === code)
  return hit?.label || code
}
