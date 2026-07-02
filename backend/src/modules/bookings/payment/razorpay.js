'use strict'

/**
 * Razorpay (test-mode) payment helper.
 *
 * Why hand-rolled instead of `razorpay` SDK? Two reasons:
 *
 *  1. The SDK has no test-mode guard — calls fail loudly when keys are
 *     missing. We want a graceful "demo mode" fallback so the booking
 *     flow boots out of the box without any env vars (perfect for
 *     reviewers, CI, and the first ten minutes of local dev).
 *
 *  2. We only use two endpoints (Orders create + signature verify).
 *     A 60-line wrapper is simpler than another dep on a Render free
 *     dyno that already cold-starts in 30s.
 *
 * Public surface:
 *
 *   isLiveMode()                     — `true` when both keys are set
 *   createOrder({ amountInr, ref })  — { orderId, demo? }
 *   verifySignature({ orderId, paymentId, signature }) — boolean
 */

const crypto = require('crypto')
const env = require('../../../config/env')
const logger = require('../../../lib/logger')

const RAZORPAY_BASE = 'https://api.razorpay.com/v1'

function isLiveMode() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET)
}

function basicAuth() {
  const token = Buffer.from(
    `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`,
  ).toString('base64')
  return `Basic ${token}`
}

/**
 * Create a Razorpay order. Falls back to a deterministic demo order id
 * when keys are missing — the frontend treats these the same way and
 * skips Razorpay Checkout altogether.
 */
async function createOrder({ amountInr, ref }) {
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    const err = new Error('amountInr must be a positive number')
    err.statusCode = 400
    throw err
  }

  if (!isLiveMode()) {
    return {
      orderId: `demo_${ref || crypto.randomBytes(6).toString('hex')}`,
      keyId: null,
      currency: 'INR',
      amount: Math.round(amountInr * 100),
      demo: true,
    }
  }

  const body = JSON.stringify({
    amount:   Math.round(amountInr * 100), // paise
    currency: 'INR',
    receipt:  ref || `jm-${Date.now()}`,
    notes:    { source: 'journeymate' },
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 9000)
  let res
  try {
    res = await fetch(`${RAZORPAY_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': basicAuth(),
        'Content-Type':  'application/json',
      },
      body,
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    logger.error?.({ msg: 'razorpay.order.network', err: err?.message })
    const e = new Error('Could not reach Razorpay. Try again in a moment.')
    e.statusCode = 502
    throw e
  }
  clearTimeout(timer)

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    logger.warn?.({
      msg:    'razorpay.order.failed',
      status: res.status,
      body:   json,
    })
    const e = new Error(json?.error?.description || 'Razorpay order failed')
    e.statusCode = res.status === 401 ? 500 : 502
    throw e
  }

  return {
    orderId:  json.id,
    keyId:    env.RAZORPAY_KEY_ID,
    currency: json.currency || 'INR',
    amount:   json.amount,
    demo:     false,
  }
}

/**
 * Verify a Razorpay Checkout callback signature.
 *
 * Razorpay docs:
 *   signature = HMAC_SHA256(`${orderId}|${paymentId}`, key_secret)
 *
 * In demo mode (no keys configured) we accept any signature that
 * matches the deterministic demo format we generate ourselves.
 */
function verifySignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId) return false

  if (!isLiveMode()) {
    // Demo orders never round-trip through Razorpay; the frontend posts
    // back a synthetic `demo_signature` string that we accept verbatim.
    return signature === 'demo_signature'
  }

  if (!signature) return false
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'utf8'),
    Buffer.from(String(signature), 'utf8'),
  )
}

module.exports = { isLiveMode, createOrder, verifySignature }
