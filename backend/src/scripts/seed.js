'use strict'

const bcrypt = require('bcrypt')
const { pool } = require('../config/db')
const logger = require('../lib/logger')
const { rowsForInsert } = require('../data/indian-cities')
const { migrate } = require('./migrate')

const DEMO_USERS = [
  { email: 'demo@journeymate.app',   password: 'demo123',  name: 'Demo Traveler' },
  { email: 'traveler@example.com',   password: 'password', name: 'Priya Sharma' },
]

async function seedUsers() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM users')
  if (rows[0].n > 0) {
    logger.info({ msg: 'users already seeded', count: rows[0].n })
    return
  }
  logger.info('seeding demo users')
  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 10)
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      [u.email.toLowerCase(), hash, u.name]
    )
  }
}

async function seedCities() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM cities')
  const target = rowsForInsert()
  if (rows[0].n >= target.length) {
    logger.info({ msg: 'cities already seeded', count: rows[0].n })
    return
  }

  logger.info({ msg: 'seeding cities', count: target.length })
  const BATCH = 100
  for (let i = 0; i < target.length; i += BATCH) {
    const chunk = target.slice(i, i + BATCH)
    const values = []
    const params = []
    chunk.forEach((c, idx) => {
      const p = idx * 9
      params.push(
        c.name, c.slug, c.state, c.state_code, c.type,
        c.lat, c.lng, c.popularity, c.tags
      )
      values.push(`($${p+1},$${p+2},$${p+3},$${p+4},$${p+5},$${p+6},$${p+7},$${p+8},$${p+9}::text[])`)
    })
    await pool.query(
      `INSERT INTO cities (name, slug, state, state_code, type, lat, lng, popularity, tags)
       VALUES ${values.join(',')}
       ON CONFLICT (slug) DO UPDATE SET
         popularity = GREATEST(cities.popularity, EXCLUDED.popularity),
         tags = EXCLUDED.tags`,
      params
    )
  }
}

async function runAll() {
  await migrate()
  await seedUsers()
  await seedCities()
}

module.exports = { seedUsers, seedCities, runAll }

if (require.main === module) {
  runAll()
    .then(async () => { logger.info('seed complete'); await pool.end(); process.exit(0) })
    .catch(async (e) => { logger.error({ msg: 'seed failed', err: e.message }); try { await pool.end() } catch {} ; process.exit(1) })
}
