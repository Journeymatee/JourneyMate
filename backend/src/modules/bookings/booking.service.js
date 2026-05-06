'use strict'

/**
 * Booking service — the orchestrator.
 *
 *   POST /bookings/quote         → priceQuote via provider
 *   POST /bookings/inventory     → fetchInventory via provider
 *   POST /bookings/seat-map      → fetchSeatMap via provider
 *   POST /bookings               → create draft + Razorpay order
 *   POST /bookings/:id/verify    → verify payment, mark confirmed, email
 *   GET  /bookings               → list user bookings
 *   GET  /bookings/:id           → fetch single booking
 *   POST /bookings/:id/cancel    → mark cancelled (stub refund)
 *
 * The service depends only on the **provider interface** (see
 * `providers/index.js`), the Razorpay helper, and the mailer. Swapping
 * any of those out doesn't touch the route layer (Dependency Inversion).
 */

const crypto = require('crypto')
const { pool } = require('../../config/db')
const ApiError = require('../../lib/ApiError')
const logger = require('../../lib/logger')

const providers = require('./providers')
const razorpay  = require('./payment/razorpay')
const { sendBookingConfirmation } = require('./booking.email')

const SUPPORTED_TYPES = Object.freeze(['train', 'flight', 'hotel'])

/* ─── helpers ────────────────────────────────────────────────────── */

function generateRef(typeCode = 'train') {
  // JM-XXXX-T  (where T = first letter of type). Short, easy to read
  // aloud, deterministic enough to be unique with 16M permutations.
  const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const buf = crypto.randomBytes(4)
  let s = ''
  for (let i = 0; i < buf.length; i += 1) s += alpha[buf[i] % alpha.length]
  return `JM-${s}-${(typeCode[0] || 'X').toUpperCase()}`
}

function assertType(type) {
  if (!SUPPORTED_TYPES.includes(type)) {
    throw ApiError.badRequest(
      `type must be one of: ${SUPPORTED_TYPES.join(', ')}`,
    )
  }
}

function rowToBooking(row) {
  if (!row) return null
  return {
    id:                row.id,
    bookingRef:        row.booking_ref,
    type:              row.type,
    provider:          row.provider,
    origin:            row.origin,
    destination:       row.destination,
    plan:              row.plan,
    priceInr:          row.price_inr,
    travelDate:        row.travel_date,
    status:            row.status,
    paymentStatus:     row.payment_status,
    razorpayOrderId:   row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    payload:           row.payload || {},
    createdAt:         row.created_at,
    updatedAt:         row.updated_at,
  }
}

/* ─── Public API ─────────────────────────────────────────────────── */

const bookingService = {
  /** List the inventory the user can book for a given type + route. */
  async fetchInventory({ type, origin, destination, travelDate, checkIn }) {
    assertType(type)
    const provider = providers.resolve(type)
    return provider.fetchInventory({ origin, destination, travelDate, checkIn })
  },

  /** Server-side price quote — the source of truth for the "Pay" step. */
  async priceQuote({ type, inventoryItem, classCode, passengerCount, nights }) {
    assertType(type)
    const provider = providers.resolve(type)
    return provider.priceQuote({ inventoryItem, classCode, passengerCount, nights })
  },

  /** Provider-specific seat / room map. */
  async fetchSeatMap({ type, inventoryItem, classCode }) {
    assertType(type)
    const provider = providers.resolve(type)
    return provider.fetchSeatMap({ inventoryItem, classCode })
  },

  /**
   * Create a draft booking + Razorpay order.
   *
   * The booking row lands with status='pending', payment_status='pending'.
   * The frontend opens Razorpay Checkout with the returned `orderId`.
   * On success it POSTs the payment_id + signature to /verify which
   * flips the status to 'confirmed' and sends the email.
   */
  async createDraft(userId, body) {
    const {
      type,
      offer,
      classCode,
      passengerCount,
      passengers,
      nights,
      travelDate,
      checkIn,
      checkOut,
      contactEmail,
      contactPhone,
    } = body || {}

    assertType(type)
    if (!offer || typeof offer !== 'object') {
      throw ApiError.badRequest('offer (the inventory item) is required')
    }

    const provider = providers.resolve(type)
    const quote = await provider.priceQuote({
      inventoryItem: offer,
      classCode,
      passengerCount: passengerCount ?? (Array.isArray(passengers) ? passengers.length : 1),
      nights,
    })

    const ref = generateRef(type)
    const order = await razorpay.createOrder({
      amountInr: quote.total,
      ref,
    })

    const payload = {
      offer:           { id: offer.id, title: offer.title, meta: offer.meta || {} },
      classCode:       classCode || null,
      passengerCount:  passengerCount ?? (Array.isArray(passengers) ? passengers.length : 1),
      passengers:      Array.isArray(passengers) ? passengers : [],
      contactEmail:    contactEmail || null,
      contactPhone:    contactPhone || null,
      nights:          nights || null,
      checkIn:         checkIn || null,
      checkOut:        checkOut || null,
      quote,
      razorpay: {
        keyId:   order.keyId,
        orderId: order.orderId,
        demo:    Boolean(order.demo),
      },
    }

    const planValue = type === 'hotel'
      ? (classCode || 'standard')
      : (offer?.fares?.[classCode]?.label || classCode || 'silver')

    const { rows } = await pool.query(
      `INSERT INTO bookings
        (user_id, type, provider, origin, destination, plan, price_inr,
         travel_date, status, payment_status, booking_ref,
         razorpay_order_id, payload, created_at, updated_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8,
         'pending', 'pending', $9, $10, $11::jsonb, NOW(), NOW())
       RETURNING *`,
      [
        userId,
        type,
        provider.name,
        offer.origin || '—',
        offer.destination || offer.origin || '—',
        String(planValue).toLowerCase().slice(0, 16),
        Math.round(quote.total),
        travelDate || checkIn || null,
        ref,
        order.orderId,
        JSON.stringify(payload),
      ],
    )

    return {
      booking: rowToBooking(rows[0]),
      payment: {
        provider:    'razorpay',
        keyId:       order.keyId,
        orderId:     order.orderId,
        amountPaise: Math.round(quote.total * 100),
        currency:    'INR',
        demo:        Boolean(order.demo),
      },
    }
  },

  /**
   * Verify a Razorpay payment and finalise the booking.
   *
   * In demo mode the frontend posts back `signature: 'demo_signature'`;
   * we accept it and treat the booking as paid.
   */
  async verifyPayment(userId, bookingId, body) {
    const { paymentId, signature } = body || {}
    if (!paymentId) throw ApiError.badRequest('paymentId is required')

    const { rows: existingRows } = await pool.query(
      `SELECT * FROM bookings WHERE id = $1 AND user_id = $2`,
      [bookingId, userId],
    )
    const existing = existingRows[0]
    if (!existing) throw ApiError.notFound('Booking not found')
    if (existing.payment_status === 'paid') {
      return { booking: rowToBooking(existing), alreadyConfirmed: true }
    }

    const ok = razorpay.verifySignature({
      orderId:   existing.razorpay_order_id,
      paymentId,
      signature,
    })
    if (!ok) {
      await pool.query(
        `UPDATE bookings
            SET payment_status = 'failed', updated_at = NOW()
          WHERE id = $1 AND user_id = $2`,
        [bookingId, userId],
      )
      throw ApiError.badRequest('Payment signature did not verify')
    }

    // Ask the provider to "confirm" the booking — this is where a real
    // IRCTC / GDS call would happen; mock providers just return a PNR.
    const provider = providers.resolve(existing.type)
    const result = await provider.confirmBooking({
      bookingRef: existing.booking_ref,
      payload:    existing.payload || {},
    })

    const { rows: updatedRows } = await pool.query(
      `UPDATE bookings
          SET status               = 'confirmed',
              payment_status       = 'paid',
              razorpay_payment_id  = $3,
              razorpay_signature   = $4,
              payload              = jsonb_set(
                COALESCE(payload, '{}'::jsonb),
                '{providerRef}',
                to_jsonb($5::text),
                true
              ),
              updated_at           = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
      [bookingId, userId, paymentId, signature, result.providerRef || null],
    )

    const booking = rowToBooking(updatedRows[0])

    // Fire the confirmation email best-effort. If SMTP is disabled in
    // dev, the helper logs and returns { skipped: true }.
    try {
      const recipient = body?.recipientEmail || existing?.payload?.contactEmail
      if (recipient) {
        await sendBookingConfirmation({ booking: updatedRows[0], recipientEmail: recipient })
      }
    } catch (err) {
      logger.warn?.({ msg: 'booking.email.failed', err: err?.message, ref: booking.bookingRef })
    }

    return { booking, providerMessage: result.message || null }
  },

  /** List the signed-in user's bookings (most recent first). */
  async listForUser(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM bookings
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 100`,
      [userId],
    )
    return rows.map(rowToBooking)
  },

  /** Fetch one of the user's bookings (must own it). */
  async getOne(userId, id) {
    const { rows } = await pool.query(
      `SELECT * FROM bookings WHERE id = $1 AND user_id = $2`,
      [id, userId],
    )
    return rowToBooking(rows[0])
  },

  /** Soft-cancel: status='cancelled', payment_status='refunded' (stub). */
  async cancel(userId, id) {
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM bookings WHERE id = $1 AND user_id = $2`,
      [id, userId],
    )
    const existing = existingRows[0]
    if (!existing) throw ApiError.notFound('Booking not found')
    if (existing.status === 'cancelled') return rowToBooking(existing)

    const provider = providers.resolve(existing.type)
    const result = await provider.cancelBooking({ bookingRef: existing.booking_ref })

    const { rows } = await pool.query(
      `UPDATE bookings
          SET status         = 'cancelled',
              payment_status = CASE WHEN payment_status = 'paid'
                                    THEN 'refunded'
                                    ELSE payment_status END,
              updated_at     = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
      [id, userId],
    )
    return { booking: rowToBooking(rows[0]), providerMessage: result.message || null }
  },

  /* Legacy: simple "save the trip I just compared" endpoint kept for
     backwards compatibility with the original booking module. */
  async create(userId, payload) {
    const { origin, destination, plan, price_inr, travel_date, extras } = payload || {}
    if (!origin || !destination) throw ApiError.badRequest('origin and destination required')
    if (!['silver', 'gold'].includes(plan)) throw ApiError.badRequest('plan must be silver or gold')
    if (!Number.isFinite(Number(price_inr)) || Number(price_inr) <= 0) {
      throw ApiError.badRequest('price_inr must be positive')
    }
    const ref = generateRef('train')
    const { rows } = await pool.query(
      `INSERT INTO bookings
        (user_id, type, provider, origin, destination, plan, price_inr,
         travel_date, status, payment_status, booking_ref, payload, created_at, updated_at)
       VALUES
        ($1, 'train', 'legacy', $2, $3, $4, $5, $6, 'pending', 'unpaid', $7, $8::jsonb, NOW(), NOW())
       RETURNING *`,
      [
        userId, origin, destination, plan,
        Math.round(Number(price_inr)),
        travel_date || null,
        ref,
        JSON.stringify(extras || {}),
      ],
    )
    return rowToBooking(rows[0])
  },
}

module.exports = bookingService
