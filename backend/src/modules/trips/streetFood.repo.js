'use strict'

/**
 * Street-food repository — read-only DB access for the curated catalog.
 *
 * The data is loaded into Postgres at boot by `seedStreetFood()` (which reads
 * the in-memory `DESTINATION_STREET_FOOD` map as the source of truth and
 * upserts every row). Repository callers should use this module instead of
 * touching the JS map directly so future content edits go through the DB.
 */

const { pool } = require('../../config/db')

function rowToItem(row) {
  if (!row) return null
  return {
    name: row.name,
    emoji: row.emoji || null,
    description: row.description || null,
    where: row.where_to_eat || null,
    tier: row.tier === 'fine' ? 'fine' : 'street',
    mapsUrl: row.maps_url || null,
    affiliateUrl: row.affiliate_url || null,
    affiliatePartner: row.affiliate_partner || null,
  }
}

/**
 * @returns {Promise<Array<{name,emoji?,description?,where?,tier,mapsUrl?,affiliateUrl?,affiliatePartner?}>>}
 */
async function getByCitySlug(citySlug, { tier = 'all', limit = 100 } = {}) {
  if (!citySlug) return []
  const params = [citySlug]
  let where = `city_slug = $1 AND is_published = true`
  if (tier === 'street' || tier === 'fine') {
    params.push(tier)
    where += ` AND tier = $${params.length}`
  }
  params.push(Math.min(200, Math.max(1, Number(limit) || 100)))
  const { rows } = await pool.query(
    `SELECT name, emoji, description, where_to_eat, tier, maps_url, affiliate_url, affiliate_partner
     FROM street_food_items
     WHERE ${where}
     ORDER BY position ASC, id ASC
     LIMIT $${params.length}`,
    params
  )
  return rows.map(rowToItem)
}

/**
 * Resolve a free-text destination name to a known city_slug.
 * Order of preference:
 *   1) Exact slug match.
 *   2) Longest city_slug that is contained in the input (so "visakhapatnam"
 *      beats "patna").
 *   3) Longest city_slug that contains the input (so "delhi" matches when
 *      the user typed "del").
 */
async function matchCitySlug(name) {
  const key = String(name || '').toLowerCase().trim().replace(/\s+/g, '')
  if (!key) return null

  const exact = await pool
    .query(`SELECT city_slug FROM street_food_items WHERE city_slug = $1 LIMIT 1`, [key])
    .catch(() => ({ rows: [] }))
  if (exact.rows[0]?.city_slug) return exact.rows[0].city_slug

  // Longest city_slug that is a substring of the input.
  const contained = await pool
    .query(
      `SELECT DISTINCT city_slug FROM street_food_items
       WHERE $1 LIKE '%' || city_slug || '%' AND city_slug <> 'default'
       ORDER BY LENGTH(city_slug) DESC
       LIMIT 1`,
      [key]
    )
    .catch(() => ({ rows: [] }))
  if (contained.rows[0]?.city_slug) return contained.rows[0].city_slug

  // Longest city_slug that contains the input (prefix-style fallback).
  const contains = await pool
    .query(
      `SELECT DISTINCT city_slug FROM street_food_items
       WHERE city_slug LIKE $1 AND city_slug <> 'default'
       ORDER BY LENGTH(city_slug) DESC
       LIMIT 1`,
      [`%${key}%`]
    )
    .catch(() => ({ rows: [] }))
  return contains.rows[0]?.city_slug || null
}

/** Aggregate index for analytics / admin agent. */
async function index() {
  const { rows } = await pool.query(
    `SELECT city_slug AS city,
            COUNT(*)::int AS count,
            SUM((tier = 'street')::int)::int AS street,
            SUM((tier = 'fine')::int)::int   AS fine
     FROM street_food_items
     WHERE is_published = true AND city_slug <> 'default'
     GROUP BY city_slug
     ORDER BY count DESC`
  )
  const total = rows.reduce((acc, r) => acc + r.count, 0)
  return { cities: rows.length, total, byCity: rows }
}

async function totalRowCount() {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM street_food_items`)
  return rows[0]?.c || 0
}

module.exports = {
  getByCitySlug,
  matchCitySlug,
  index,
  totalRowCount,
}
