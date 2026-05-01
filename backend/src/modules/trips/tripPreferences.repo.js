'use strict'

/**
 * Repo for `user_trip_preferences`.
 *
 * `upsert` is the only write — single statement, idempotent. `getForUser`
 * returns null when the user has never searched. Both methods swallow
 * connection-level errors at the caller (controller) so the user-facing
 * search path never fails because preferences couldn't be written.
 */

const { pool } = require('../../config/db')

const SAFE_MAX_VIBES = 6
const TRIP_TYPES = new Set(['solo', 'couple', 'family', 'friends'])

/** Coerce arbitrary input into a clean lowercase string array, capped & deduped. */
function sanitizeVibes(input) {
  if (!Array.isArray(input)) return []
  const seen = new Set()
  const out = []
  for (const v of input) {
    const s = String(v || '').trim().toLowerCase()
    if (!s) continue
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= SAFE_MAX_VIBES) break
  }
  return out
}

function clampDays(d) {
  const n = Number(d)
  if (!Number.isFinite(n)) return null
  return Math.min(5, Math.max(1, Math.round(n)))
}

function clampString(s, max) {
  const v = String(s || '').trim()
  if (!v) return null
  return v.length > max ? v.slice(0, max) : v
}

async function upsert(userId, payload = {}) {
  const uid = Number(userId)
  if (!Number.isFinite(uid)) return null
  const tripTypeRaw = String(payload.tripType || '').trim().toLowerCase()
  const tripType = TRIP_TYPES.has(tripTypeRaw) ? tripTypeRaw : null
  const vibes = sanitizeVibes(payload.vibes)
  const lastFrom = clampString(payload.lastFrom, 160)
  const lastTo = clampString(payload.lastTo, 160)
  const lastDays = clampDays(payload.lastDays)

  const sql = `
    INSERT INTO user_trip_preferences
      (user_id, trip_type, vibes, last_from, last_to, last_days, updated_at)
    VALUES
      ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      trip_type  = EXCLUDED.trip_type,
      vibes      = EXCLUDED.vibes,
      last_from  = EXCLUDED.last_from,
      last_to    = EXCLUDED.last_to,
      last_days  = EXCLUDED.last_days,
      updated_at = NOW()
    RETURNING user_id, trip_type, vibes, last_from, last_to, last_days, updated_at
  `
  const { rows } = await pool.query(sql, [uid, tripType, vibes, lastFrom, lastTo, lastDays])
  return rows[0] ? rowToDto(rows[0]) : null
}

async function getForUser(userId) {
  const uid = Number(userId)
  if (!Number.isFinite(uid)) return null
  const sql = `
    SELECT user_id, trip_type, vibes, last_from, last_to, last_days, updated_at
      FROM user_trip_preferences
     WHERE user_id = $1
     LIMIT 1
  `
  const { rows } = await pool.query(sql, [uid])
  return rows[0] ? rowToDto(rows[0]) : null
}

function rowToDto(row) {
  return {
    tripType:  row.trip_type || null,
    vibes:     Array.isArray(row.vibes) ? row.vibes : [],
    lastFrom:  row.last_from || null,
    lastTo:    row.last_to   || null,
    lastDays:  row.last_days != null ? Number(row.last_days) : null,
    updatedAt: row.updated_at,
  }
}

module.exports = {
  upsert,
  getForUser,
}
