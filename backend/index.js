'use strict'

/**
 * JourneyMate API — entry point.
 * Boot sequence:
 *   1) run SQL migrations
 *   2) (optional) seed cities + demo users
 *   3) start HTTP server
 *   4) graceful shutdown
 */
const env = require('./src/config/env')
const logger = require('./src/lib/logger')
const { pool } = require('./src/config/db')
const { buildApp } = require('./src/app')
const { runAll } = require('./src/scripts/seed')

async function main() {
  try {
    await runAll()
  } catch (e) {
    logger.error({ msg: 'startup: migrate/seed failed', err: e.message })
    hintPostgresMacOS(e.message)
    process.exit(1)
  }

  const app = buildApp()
  const server = app.listen(env.PORT, () => {
    logger.info({
      msg: 'api listening',
      url: `http://localhost:${env.PORT}`,
      env: env.NODE_ENV,
      db: `${env.PG.user}@${env.PG.host}:${env.PG.port}/${env.PG.database}`,
    })
  })

  const shutdown = async (signal) => {
    logger.info({ msg: 'shutting down', signal })
    server.close(async () => {
      try { await pool.end() } catch { /* noop */ }
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('unhandledRejection', (r) => logger.error({ msg: 'unhandledRejection', err: String(r) }))
  process.on('uncaughtException', (e) => logger.error({ msg: 'uncaughtException', err: e.message }))
}

function hintPostgresMacOS(msg) {
  if (!msg) return
  if (msg.includes('auth_permission_dialog') || msg.includes('dialog_executable_path')) {
    // eslint-disable-next-line no-console
    console.error(`
PostgreSQL on macOS threw an auth-dialog error.

Fix (pick one):
  1) Postgres.app → Settings → turn OFF "Ask for permission when apps connect without password", restart servers.
  2) Use Homebrew: brew services restart postgresql@15
  3) Or just use Docker:   docker compose up db   (recommended)
`)
  }
}

main()
