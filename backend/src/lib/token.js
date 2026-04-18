'use strict'

const crypto = require('crypto')
const env = require('../config/env')

/**
 * Tiny HMAC-SHA256 token (stateless, signed, time-limited).
 * Not full JWT — good enough for this app and has zero extra deps.
 * Format: base64url(payloadJson).base64url(hmac)
 */
function sign(payload, ttlMs = env.TOKEN_TTL_MS) {
  const body = { ...payload, iat: Date.now(), exp: Date.now() + ttlMs }
  const b64 = Buffer.from(JSON.stringify(body), 'utf8').toString('base64url')
  const sig = crypto.createHmac('sha256', env.AUTH_SECRET).update(b64).digest('base64url')
  return `${b64}.${sig}`
}

function verify(token) {
  if (!token || typeof token !== 'string') return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', env.AUTH_SECRET).update(body).digest('base64url')
  const a = Buffer.from(expected), b = Buffer.from(sig)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!data.exp || data.exp < Date.now()) return null
    return data
  } catch { return null }
}

module.exports = { sign, verify }
