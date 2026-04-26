'use strict'

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const PORT = Number(process.env.INSIGHTS_PORT || 4100)

const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    ssl: { rejectUnauthorized: false },
  })
  : new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'journeymate',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    max: 5,
  })

const app = express()
app.disable('x-powered-by')
app.use(cors({ origin: true }))
app.use(express.json({ limit: '50kb' }))

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, service: 'journeymate-insights-bff' })
  } catch (e) {
    res.status(503).json({ ok: false, error: 'database_unreachable' })
  }
})

app.get('/v1/trending-cities', async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20)
  try {
    const { rows } = await pool.query(
      `
      SELECT
        c.name  AS name,
        c.state AS state,
        c.popularity::int AS popularity
      FROM cities c
      ORDER BY c.popularity DESC, c.id ASC
      LIMIT $1
    `,
      [limit]
    )

    res.json({
      source: 'insights-bff',
      items: rows.map((r) => ({
        name: r.name,
        state: r.state,
        popularity: r.popularity,
      })),
    })
  } catch (e) {
    res.status(500).json({ error: { message: 'Failed to load insights' } })
  }
})

app.use((_req, res) => {
  res.status(404).json({ error: { message: 'Not found' } })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[insights-bff] listening on :${PORT}`)
})
