'use strict'

const { Pool } = require('pg')
const env = require('./env')
const logger = require('../lib/logger')

const pool = env.PG.connectionString
  ? new Pool({ connectionString: env.PG.connectionString, max: env.PG.max })
  : new Pool({
      host: env.PG.host,
      port: env.PG.port,
      database: env.PG.database,
      user: env.PG.user,
      password: env.PG.password,
      max: env.PG.max,
      idleTimeoutMillis: 30000,
    })

pool.on('error', (err) => {
  logger.error({ msg: 'unexpected pg pool error', err: err.message })
})

async function ping() {
  const r = await pool.query('SELECT 1 AS ok')
  return r.rows[0].ok === 1
}

async function tx(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    try { await client.query('ROLLBACK') } catch { /* noop */ }
    throw e
  } finally {
    client.release()
  }
}

module.exports = { pool, ping, tx }
