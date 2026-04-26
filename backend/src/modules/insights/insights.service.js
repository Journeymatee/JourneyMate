'use strict'

const { pool } = require('../../config/db')
const env = require('../../config/env')
const { fetch } = global

async function fetchTrendingFromBff() {
  const base = String(env.INSIGHTS_BFF_URL || '').replace(/\/$/, '')
  if (!base) return null

  const url = `${base}/v1/trending-cities?limit=8`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), env.INSIGHTS_BFF_TIMEOUT_MS)

  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function fetchTrendingFromDb() {
  const { rows } = await pool.query(
    `
    SELECT
      c.name  AS name,
      c.state AS state,
      c.popularity::int AS popularity
    FROM cities c
    ORDER BY c.popularity DESC, c.id ASC
    LIMIT 8
  `
  )
  return {
    source: 'monolith-db',
    items: rows.map((r) => ({
      name: r.name,
      state: r.state,
      popularity: r.popularity,
    })),
  }
}

const insightsService = {
  /** Prefer Insights BFF, fall back to monolith database query. */
  async trendingCities() {
    if (env.INSIGHTS_BFF_URL) {
      const bff = await fetchTrendingFromBff()
      if (bff && Array.isArray(bff.items) && bff.items.length) {
        return bff
      }
    }
    return await fetchTrendingFromDb()
  },
}

module.exports = insightsService
