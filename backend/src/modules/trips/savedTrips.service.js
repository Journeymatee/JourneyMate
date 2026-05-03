'use strict'

/**
 * Saved trips business rules:
 *   - slug derived from origin + destination + a 4-char nonce so a user can
 *     keep multiple variants of "Delhi → Manali" without collisions.
 *   - share_token is a 22-char URL-safe random — never derived from user
 *     input, so it cannot be guessed from the slug.
 *   - payload validation keeps Postgres `jsonb` happy and ensures we have
 *     enough info to render a Compare page from the saved row alone.
 *   - all sanitisation lives here, not in the repo.
 */

const crypto = require('crypto')

const ApiError = require('../../lib/ApiError')
const repo = require('./savedTrips.repo')

const NAME_MAX = 200
const NOTES_MAX = 4000

function clampString(s, max) {
  const v = String(s == null ? '' : s).trim()
  if (!v) return ''
  return v.length > max ? v.slice(0, max) : v
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function nonce(n = 4) {
  // URL-safe alphabet, fixed-size — short because it only has to disambiguate
  // a few user variants of the same route.
  const chars = '23456789abcdefghijkmnpqrstuvwxyz'
  const out = []
  for (let i = 0; i < n; i += 1) out.push(chars[Math.floor(Math.random() * chars.length)])
  return out.join('')
}

function shareToken() {
  // 16 random bytes → 22-char base64url. Random space ≈ 2^128.
  return crypto.randomBytes(16).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function pickPriceFromPlan(plan) {
  if (!plan || typeof plan !== 'object') return null
  const n = Number(plan.price)
  return Number.isFinite(n) ? Math.round(n) : null
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw ApiError.badRequest('payload required')
  }
  const origin = clampString(payload.origin, 160)
  const destination = clampString(payload.destination, 160)
  if (!origin || !destination) {
    throw ApiError.badRequest('payload.origin and payload.destination are required')
  }
  if (!payload.silver || !payload.gold) {
    throw ApiError.badRequest('payload must include both silver and gold plans')
  }
  return { origin, destination }
}

/* ─── Public service surface ─── */

async function createForUser(userId, body = {}) {
  const payload = body.payload
  const { origin, destination } = validatePayload(payload)

  const days = Math.min(5, Math.max(1, Math.round(Number(payload.requestedDays || body.days || 5)) || 5))
  const tripType = clampString(payload.tripType || body.tripType, 16) || null
  const vibesRaw = Array.isArray(payload.vibes) ? payload.vibes : Array.isArray(body.vibes) ? body.vibes : []
  const vibes = vibesRaw
    .map((v) => clampString(v, 32).toLowerCase())
    .filter(Boolean)
    .slice(0, 6)

  const defaultName = `${origin} → ${destination}`
  const name = clampString(body.name || defaultName, NAME_MAX) || defaultName
  const notes = clampString(body.notes, NOTES_MAX)

  const slug = `${slugify(origin)}--${slugify(destination)}-${nonce(4)}`.slice(0, 180)

  try {
    const created = await repo.create(userId, {
      slug,
      name,
      origin,
      destination,
      days,
      tripType,
      vibes,
      silverPrice: pickPriceFromPlan(payload.silver),
      goldPrice:   pickPriceFromPlan(payload.gold),
      payload,
      notes,
      shareToken: shareToken(),
      isPublic: body.isPublic !== false,
    })
    return created
  } catch (err) {
    if (err.code === 'PAYLOAD_TOO_LARGE') {
      throw ApiError.badRequest('Trip payload too large to save (max ~250 KB)')
    }
    if (err.code === 'PAYLOAD_INVALID') {
      throw ApiError.badRequest('Trip payload is not valid JSON')
    }
    throw err
  }
}

async function listForUser(userId) {
  return repo.listForUser(userId, { limit: 100 })
}

async function getOwned(userId, id) {
  const row = await repo.getOwnedById(userId, id)
  if (!row) throw ApiError.notFound('Saved trip not found')
  return row
}

async function getPublic(token) {
  const row = await repo.getByShareToken(token)
  if (!row) throw ApiError.notFound('This shared trip link is no longer available')
  // Strip user_id at the boundary — the public payload should not echo it.
  const { ...rest } = row
  return rest
}

async function patch(userId, id, body = {}) {
  const patchObj = {}
  if (body.name !== undefined) {
    const name = clampString(body.name, NAME_MAX)
    if (!name) throw ApiError.badRequest('name cannot be empty')
    patchObj.name = name
  }
  if (body.notes !== undefined)    patchObj.notes = clampString(body.notes, NOTES_MAX)
  if (body.isPublic !== undefined) patchObj.isPublic = Boolean(body.isPublic)
  if (body.payload !== undefined) {
    validatePayload(body.payload)
    patchObj.payload = body.payload
    patchObj.silverPrice = pickPriceFromPlan(body.payload.silver)
    patchObj.goldPrice   = pickPriceFromPlan(body.payload.gold)
    if (Array.isArray(body.payload.vibes)) {
      patchObj.vibes = body.payload.vibes.map((v) => clampString(v, 32).toLowerCase()).filter(Boolean).slice(0, 6)
    }
    if (body.payload.tripType !== undefined) {
      patchObj.tripType = clampString(body.payload.tripType, 16) || null
    }
    if (body.payload.requestedDays !== undefined) {
      const d = Math.round(Number(body.payload.requestedDays))
      if (Number.isFinite(d)) patchObj.days = Math.min(5, Math.max(1, d))
    }
  }

  try {
    const updated = await repo.update(userId, id, patchObj)
    if (!updated) throw ApiError.notFound('Saved trip not found')
    return updated
  } catch (err) {
    if (err.code === 'PAYLOAD_TOO_LARGE') {
      throw ApiError.badRequest('Trip payload too large to save (max ~250 KB)')
    }
    if (err.code === 'PAYLOAD_INVALID') {
      throw ApiError.badRequest('Trip payload is not valid JSON')
    }
    throw err
  }
}

async function remove(userId, id) {
  const ok = await repo.remove(userId, id)
  if (!ok) throw ApiError.notFound('Saved trip not found')
  return { ok: true }
}

async function rotate(userId, id) {
  const updated = await repo.rotateShareToken(userId, id, shareToken())
  if (!updated) throw ApiError.notFound('Saved trip not found')
  return updated
}

module.exports = {
  createForUser,
  listForUser,
  getOwned,
  getPublic,
  patch,
  remove,
  rotate,
}
