import api from '../api/client'

/**
 * Booking service — thin wrapper around `/api/bookings/*`.
 *
 * The backend is the source of truth for prices, seat availability, and
 * payment status. The frontend only stores the user's selections and
 * forwards them, never trusts a price the user could tamper with.
 */

export function bookingErrorMessage(err) {
  const e = err?.response?.data?.error
  if (typeof e === 'string') return e
  if (e?.message) return e.message
  return err?.message || 'Booking request failed'
}

export async function fetchInventory({ type, origin, destination, travelDate, checkIn, signal }) {
  const { data } = await api.post(
    '/bookings/inventory',
    { type, origin, destination, travelDate, checkIn },
    { signal },
  )
  return data?.items || []
}

export async function fetchQuote({ type, offer, classCode, passengerCount, nights, signal }) {
  const { data } = await api.post(
    '/bookings/quote',
    { type, offer, classCode, passengerCount, nights },
    { signal },
  )
  return data?.quote || null
}

export async function fetchSeatMap({ type, offer, classCode, signal }) {
  const { data } = await api.post(
    '/bookings/seat-map',
    { type, offer, classCode },
    { signal },
  )
  return data?.map || null
}

export async function fetchPaymentMode({ signal } = {}) {
  const { data } = await api.get('/bookings/payment-mode', { signal })
  return data || { provider: 'razorpay', live: false, keyId: null }
}

export async function createDraftBooking(payload, { signal } = {}) {
  const { data } = await api.post('/bookings/draft', payload, { signal })
  return data
}

export async function verifyPayment(bookingId, payload, { signal } = {}) {
  const { data } = await api.post(`/bookings/${bookingId}/verify`, payload, { signal })
  return data
}

export async function listMyBookings({ signal } = {}) {
  const { data } = await api.get('/bookings', { signal })
  return data?.bookings || []
}

export async function getBooking(id, { signal } = {}) {
  const { data } = await api.get(`/bookings/${id}`, { signal })
  return data?.booking || null
}

export async function cancelBooking(id, { signal } = {}) {
  const { data } = await api.post(`/bookings/${id}/cancel`, {}, { signal })
  return data
}

/* ─── Razorpay Checkout integration ─────────────────────────────── */

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
let scriptPromise = null

function loadRazorpayScript() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve) => {
    const tag = document.createElement('script')
    tag.src = RAZORPAY_SCRIPT_URL
    tag.async = true
    tag.onload = () => resolve(true)
    tag.onerror = () => { scriptPromise = null; resolve(false) }
    document.body.appendChild(tag)
  })
  return scriptPromise
}

/**
 * Open the Razorpay Checkout widget.
 *
 * In demo mode (when the backend reports `payment.demo === true`) we
 * skip the widget entirely and resolve with a synthetic
 * `demo_signature` — the backend accepts that value as a valid demo
 * payment so the rest of the flow stays identical.
 *
 *   await openCheckout({ payment, booking, prefill, onClose })
 *     → { paymentId, signature }
 *
 * Throws `'cancelled'` if the user dismisses the widget.
 */
export async function openCheckout({ payment, booking, prefill = {}, onClose }) {
  if (!payment) throw new Error('payment object missing')

  if (payment.demo) {
    return {
      paymentId:  `demo_pay_${booking?.bookingRef || Date.now()}`,
      signature:  'demo_signature',
      demo:       true,
    }
  }

  const ok = await loadRazorpayScript()
  if (!ok || typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Could not load Razorpay Checkout. Check your connection and try again.')
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key:      payment.keyId,
      order_id: payment.orderId,
      amount:   payment.amountPaise,
      currency: payment.currency || 'INR',
      name:     'JourneyMate',
      description: booking?.bookingRef
        ? `Booking ${booking.bookingRef}`
        : 'Booking',
      prefill: {
        name:    prefill.name  || '',
        email:   prefill.email || '',
        contact: prefill.phone || '',
      },
      theme:    { color: '#10b981' },
      handler:  (response) => {
        resolve({
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          demo: false,
        })
      },
      modal: {
        ondismiss: () => {
          if (onClose) onClose()
          reject(Object.assign(new Error('Payment cancelled'), { cancelled: true }))
        },
      },
    })
    rzp.on?.('payment.failed', (resp) => {
      reject(new Error(resp?.error?.description || 'Payment failed'))
    })
    rzp.open()
  })
}
