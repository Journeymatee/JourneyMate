'use strict'

/**
 * Vercel Serverless entry point.
 * Wraps the Express app so it works as a Vercel Function.
 * Migrations run once per cold-start (idempotent — safe to call every time).
 */

let app = null

async function bootstrap() {
  if (app) return app
  try {
    const { runAll } = require('../src/scripts/seed')
    await runAll()
  } catch (e) {
    // Migrations failed — log but continue (tables may already exist)
    console.error('[vercel] migrate/seed error:', e.message)
  }
  const { buildApp } = require('../src/app')
  app = buildApp()
  return app
}

module.exports = async (req, res) => {
  const handler = await bootstrap()
  handler(req, res)
}
