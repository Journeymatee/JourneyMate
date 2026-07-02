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
    hintPostgresDns(e.message)
    hintPostgresMacOS(e.message)
    hintPostgresPassword(e.message)
    hintMissingDatabase(e.message)
    process.exit(1)
  }

  const app = buildApp()
  const pg = getEffectivePgTarget()
  const server = app.listen(env.PORT, () => {
    logger.info({
      msg: 'api listening',
      url: `http://localhost:${env.PORT}`,
      env: env.NODE_ENV,
      db: `${pg.user}@${pg.host}:${pg.port}/${pg.database}`,
      dbSource: pg.source,
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

function getEffectivePgTarget() {
  if (!env.PG.connectionString) {
    return {
      source: 'PGHOST',
      host: env.PG.host,
      port: env.PG.port,
      database: env.PG.database,
      user: env.PG.user,
      parseError: false,
    }
  }

  try {
    const parsed = new URL(env.PG.connectionString)
    return {
      source: 'DATABASE_URL',
      host: parsed.hostname || env.PG.host,
      port: Number(parsed.port || env.PG.port),
      database: decodeURIComponent((parsed.pathname || '').replace(/^\//, '')) || env.PG.database,
      user: decodeURIComponent(parsed.username || env.PG.user),
      parseError: false,
    }
  } catch {
    return {
      source: 'DATABASE_URL',
      host: env.PG.host,
      port: env.PG.port,
      database: env.PG.database,
      user: env.PG.user,
      parseError: true,
    }
  }
}

function hintPostgresDns(msg) {
  if (!msg || !msg.includes('ENOTFOUND')) return
  const { source, host, port, database, user, parseError } = getEffectivePgTarget()
  const renderHostHint =
    host.startsWith('dpg-') && !host.includes('.')
      ? '\nIf that host came from Render, double-check that DATABASE_URL is the full connection string and that the service is using a Render internal URL only from the same account and region. Otherwise switch to the external database URL.'
      : ''

  // eslint-disable-next-line no-console
  console.error(`
PostgreSQL host "${host}" could not be resolved (DNS ENOTFOUND).

The API is currently using ${source} and targeting ${user}@${host}:${port}/${database}.

Common fixes:
  1) If DATABASE_URL is set, it overrides PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD.
  2) Copy the full database URL from your provider without quotes or truncation.
  3) Verify the hostname still exists and is reachable from the service environment.${renderHostHint}
${parseError ? '\nDATABASE_URL is set but could not be parsed cleanly; re-check the exact value in your deployment env vars.' : ''}
`)
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
`)
  }
}

function hintPostgresPassword(msg) {
  if (!msg || !msg.includes('password authentication failed')) return
  const { user, host, port, database } = getEffectivePgTarget()
  // eslint-disable-next-line no-console
  console.error(`
PostgreSQL rejected the password for user "${user}" (${host}:${port}, db "${database}").

Fix: In pgAdmin (or psql as superuser): Login/Group Roles → ${user} → Definition → set Password,
then update the same credentials in ${env.PG.connectionString ? 'DATABASE_URL' : 'PGPASSWORD / PGHOST / PGPORT / PGDATABASE'}.
`)
}

function hintMissingDatabase(msg) {
  if (!msg || !msg.includes('does not exist')) return
  const { user, host, port, database } = getEffectivePgTarget()
  // eslint-disable-next-line no-console
  console.error(`
Database "${database}" is missing on ${host}:${port}.

Create it (use your real password), then restart the API:
  PGPASSWORD='your-postgres-password' psql -h ${host} -p ${port} -U ${user} -d postgres -c "CREATE DATABASE ${database};"

Or in pgAdmin: Databases → Create → Database… → name: ${database}
`)
}

main()
