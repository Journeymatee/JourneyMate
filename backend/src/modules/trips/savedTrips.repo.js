'use strict'

/**
 * Repo for `saved_trips` (Wishlist + private link sharing).
 *
 * Pure SQL — no business rules. Slug + share token come pre-computed from
 * the service layer so this module is trivially mockable in tests.
 *
 * Conventions follow tripPreferences.repo.js: pool query, rowToDto on the
 * way out, no exceptions surfaced unless we got nothing back.
 */

const { pool } = require('../../config/db')

const MAX_PAYLOAD_BYTES = 250 * 1024 // ~250kb hard ceiling on a single saved trip

function rowToDto(row) {
  if (!row) return null
  return {
    id:           Number(row.id),
    slug:         row.slug,
    name:         row.name,
    origin:       row.origin,
    destination:  row.destination,
    days:         Number(row.days),
    tripType:     row.trip_type || null,
    vibes:        Array.isArray(row.vibes) ? row.vibes : [],
    silverPrice:  row.silver_price != null ? Number(row.silver_price) : null,
    goldPrice:    row.gold_price   != null ? Number(row.gold_price)   : null,
    notes:        row.notes || '',
    shareToken:   row.share_token,
    isPublic:     row.is_public !== false,
    payload:      row.payload || null,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  }
}

function checkPayloadSize(payload) {
  try {
    const bytes = Buffer.byteLength(JSON.stringify(payload || {}))
    if (bytes > MAX_PAYLOAD_BYTES) {
      const e = new Error('Trip payload too large to save')
      e.code = 'PAYLOAD_TOO_LARGE'
      throw e
    }
  } catch (err) {
    if (err.code === 'PAYLOAD_TOO_LARGE') throw err
    // JSON.stringify failed (cyclic etc.) — treat as bad input
    const e = new Error('Trip payload is not serialisable')
    e.code = 'PAYLOAD_INVALID'
    throw e
  }
}

async function create(userId, fields) {
  checkPayloadSize(fields.payload)
  const sql = `
    INSERT INTO saved_trips
      (user_id, slug, name, origin, destination, days, trip_type, vibes,
       silver_price, gold_price, payload, notes, share_token, is_public)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `
  const params = [
    Number(userId),
    fields.slug,
    fields.name,
    fields.origin,
    fields.destination,
    Number(fields.days),
    fields.tripType || null,
    Array.isArray(fields.vibes) ? fields.vibes : [],
    fields.silverPrice ?? null,
    fields.goldPrice ?? null,
    fields.payload,
    fields.notes || '',
    fields.shareToken,
    fields.isPublic !== false,
  ]
  const { rows } = await pool.query(sql, params)
  return rowToDto(rows[0])
}

async function listForUser(userId, { limit = 50, offset = 0 } = {}) {
  const sql = `
    SELECT id, slug, name, origin, destination, days, trip_type, vibes,
           silver_price, gold_price, notes, share_token, is_public,
           created_at, updated_at
      FROM saved_trips
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3
  `
  const { rows } = await pool.query(sql, [Number(userId), Math.min(200, Math.max(1, limit)), Math.max(0, offset)])
  return rows.map((r) => rowToDto({ ...r, payload: null }))
}

async function getOwnedById(userId, id) {
  const { rows } = await pool.query(
    `SELECT * FROM saved_trips WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [Number(id), Number(userId)]
  )
  return rowToDto(rows[0])
}

async function getByShareToken(token) {
  const { rows } = await pool.query(
    `SELECT * FROM saved_trips
       WHERE share_token = $1 AND is_public = TRUE
       LIMIT 1`,
    [String(token)]
  )
  return rowToDto(rows[0])
}

async function update(userId, id, patch) {
  if (patch.payload !== undefined) checkPayloadSize(patch.payload)
  const fields = []
  const params = []
  let i = 1
  const set = (col, val) => { fields.push(`${col} = $${i++}`); params.push(val) }

  if (patch.name        !== undefined) set('name',        patch.name)
  if (patch.notes       !== undefined) set('notes',       patch.notes || '')
  if (patch.isPublic    !== undefined) set('is_public',   Boolean(patch.isPublic))
  if (patch.payload     !== undefined) set('payload',     patch.payload)
  if (patch.silverPrice !== undefined) set('silver_price', patch.silverPrice ?? null)
  if (patch.goldPrice   !== undefined) set('gold_price',   patch.goldPrice ?? null)
  if (patch.tripType    !== undefined) set('trip_type',    patch.tripType || null)
  if (patch.vibes       !== undefined) set('vibes',        Array.isArray(patch.vibes) ? patch.vibes : [])
  if (patch.days        !== undefined) set('days',         Number(patch.days))

  if (fields.length === 0) {
    return getOwnedById(userId, id)
  }
  fields.push(`updated_at = NOW()`)
  params.push(Number(id), Number(userId))
  const sql = `
    UPDATE saved_trips
       SET ${fields.join(', ')}
     WHERE id = $${i++} AND user_id = $${i}
     RETURNING *
  `
  const { rows } = await pool.query(sql, params)
  return rowToDto(rows[0])
}

async function remove(userId, id) {
  const { rowCount } = await pool.query(
    `DELETE FROM saved_trips WHERE id = $1 AND user_id = $2`,
    [Number(id), Number(userId)]
  )
  return rowCount > 0
}

async function rotateShareToken(userId, id, newToken) {
  const { rows } = await pool.query(
    `UPDATE saved_trips
        SET share_token = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *`,
    [String(newToken), Number(id), Number(userId)]
  )
  return rowToDto(rows[0])
}

module.exports = {
  create,
  listForUser,
  getOwnedById,
  getByShareToken,
  update,
  remove,
  rotateShareToken,
  MAX_PAYLOAD_BYTES,
}
