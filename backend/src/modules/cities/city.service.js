'use strict'

const { pool } = require('../../config/db')
const logger = require('../../lib/logger')
const { editDistance } = require('../../lib/strings')

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const UA = 'JourneyMate/2.0 (travel search)'

function normalize(q) {
  return String(q || '').trim()
}

/** Escape % / _ in a LIKE pattern. */
function likeEscape(s) {
  return s.replace(/[%_\\]/g, (m) => '\\' + m)
}

const cityService = {
  async searchDb(query, { limit = 10, stateCode = null } = {}) {
    const q = normalize(query)
    const params = []
    let where = ''
    if (q) {
      params.push(likeEscape(q.toLowerCase()))
      where += `WHERE LOWER(name) LIKE $${params.length} || '%'
                   OR LOWER(name) LIKE '%' || $${params.length} || '%' `
    } else {
      where += 'WHERE TRUE '
    }
    if (stateCode) {
      params.push(stateCode.toUpperCase())
      where += ` AND state_code = $${params.length}`
    }
    params.push(limit)
    const sql = `
      SELECT name, slug, state, state_code, type, lat, lng, popularity, tags
      FROM cities
      ${where}
      ORDER BY
        (CASE WHEN LOWER(name) = $1 THEN 0
              WHEN LOWER(name) LIKE $1 || '%' THEN 1
              ELSE 2 END),
        popularity DESC,
        name ASC
      LIMIT $${params.length}
    `
    try {
      const { rows } = await pool.query(sql, params)
      return rows.map((r) => ({
        name: r.name,
        slug: r.slug,
        state: r.state,
        stateCode: r.state_code,
        type: r.type,
        lat: Number(r.lat),
        lng: Number(r.lng),
        popularity: r.popularity,
        tags: r.tags || [],
        source: 'db',
      }))
    } catch (e) {
      logger.warn({ msg: 'cities db search failed', err: e.message })
      return []
    }
  },

  async searchNominatim(query, { limit = 6 } = {}) {
    const q = normalize(query)
    if (q.length < 2) return []
    const url = `${NOMINATIM}?format=json&countrycodes=in&addressdetails=1&limit=${limit}&q=${encodeURIComponent(q)}`
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 3500)
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': UA },
        signal: controller.signal,
      })
      clearTimeout(timer)
      if (!res.ok) return []
      const data = await res.json()
      return (Array.isArray(data) ? data : [])
        .map((d) => {
          const name =
            d.address?.city || d.address?.town || d.address?.village ||
            d.address?.hamlet || d.address?.suburb || d.name || d.display_name?.split(',')[0]
          if (!name) return null
          return {
            name: String(name).trim(),
            slug: null,
            state: d.address?.state || '',
            stateCode: null,
            type: d.type === 'village' ? 'village' : 'city',
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
            popularity: 10,
            tags: [],
            source: 'nominatim',
            display: d.display_name,
          }
        })
        .filter(Boolean)
    } catch (e) {
      logger.warn({ msg: 'nominatim failed', err: e.message })
      return []
    }
  },

  async search(query, opts = {}) {
    const q = normalize(query)
    if (!q) {
      const rows = await cityService.searchDb('', { ...opts, limit: opts.limit || 20 })
      return { query: '', results: rows, total: rows.length }
    }
    const dbRows = await cityService.searchDb(q, opts)
    let apiRows = []
    if (dbRows.length < (opts.limit || 10)) {
      apiRows = await cityService.searchNominatim(q, { limit: 6 })
      // De-dup against DB names
      const seen = new Set(dbRows.map((r) => r.name.toLowerCase()))
      apiRows = apiRows.filter((r) => !seen.has(r.name.toLowerCase()))
    }
    const results = [...dbRows, ...apiRows].slice(0, opts.limit || 12)
    return { query: q, results, total: results.length }
  },

  async bySlug(slug) {
    const { rows } = await pool.query(
      `SELECT name, slug, state, state_code, type, lat, lng, popularity, tags
       FROM cities WHERE slug = $1 LIMIT 1`,
      [slug]
    )
    return rows[0] || null
  },

  async byName(name) {
    const { rows } = await pool.query(
      `SELECT name, slug, state, state_code, type, lat, lng, popularity, tags
       FROM cities WHERE LOWER(name) = LOWER($1)
       ORDER BY popularity DESC LIMIT 1`,
      [name]
    )
    return rows[0] || null
  },

  /**
   * Typo-tolerant city lookup — used by trip search so a user typing
   * "Banglore", "Mumbi", "Varansi" still resolves to the right city.
   *
   * Strategy:
   *   1) Exact case-insensitive match (cheap; covers 99% of clean input).
   *   2) Pull a candidate set sharing the first character, score each by
   *      edit distance (Damerau-Levenshtein), prefer the closest with a
   *      length-aware threshold and popularity tiebreak.
   */
  async byNameFuzzy(name) {
    const trimmed = String(name || '').trim()
    if (!trimmed) return null

    const exact = await cityService.byName(trimmed)
    if (exact) return exact
    if (trimmed.length < 3) return null

    const target = trimmed.toLowerCase()
    const first = target[0]
    if (!/[a-z]/.test(first)) return null

    let rows = []
    try {
      const result = await pool.query(
        `SELECT name, slug, state, state_code, type, lat, lng, popularity, tags
         FROM cities
         WHERE LOWER(name) LIKE $1
         ORDER BY popularity DESC
         LIMIT 250`,
        [first + '%']
      )
      rows = result.rows
    } catch (e) {
      logger.warn({ msg: 'city fuzzy db lookup failed', err: e.message })
      return null
    }

    const threshold = target.length <= 4 ? 1 : target.length <= 7 ? 2 : 3
    let best = null
    let bestScore = Infinity
    for (const r of rows) {
      const candidate = String(r.name || '').toLowerCase()
      if (Math.abs(candidate.length - target.length) > threshold) continue
      const d = editDistance(target, candidate)
      if (d > threshold) continue
      // Lower score = better match. Distance dominates; popularity is a tiebreak.
      const score = d * 1000 - (Number(r.popularity) || 0)
      if (score < bestScore) {
        bestScore = score
        best = r
        if (d === 0) break
      }
    }
    if (best) {
      logger.info({ msg: 'city auto-corrected', input: trimmed, matched: best.name })
    }
    return best || null
  },

  async listStates() {
    const { rows } = await pool.query(
      `SELECT state_code AS code, state AS name, COUNT(*)::int AS city_count
       FROM cities GROUP BY state_code, state ORDER BY state`
    )
    return rows
  },
}

module.exports = cityService
