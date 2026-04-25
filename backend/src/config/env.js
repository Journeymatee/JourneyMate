'use strict'

require('dotenv').config()

const bool = (v, d = false) => {
  if (v === undefined || v === null || v === '') return d
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase())
}

const defaultPgPoolMax =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? 1 : 10

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 8080),

  AUTH_SECRET: process.env.AUTH_SECRET || 'journeymate-dev-secret-change-me',
  TOKEN_TTL_MS: Number(process.env.TOKEN_TTL_MS || 7 * 24 * 60 * 60 * 1000),

  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  PG: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'journeymate',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '1234',
    // Serverless (e.g. Vercel): one connection per invocation avoids exhausting DB limits.
    max: Number(process.env.PGPOOL_MAX || defaultPgPoolMax),
  },

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4o-mini',
  AI_API_URL: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS || 20000),

  SEED_ON_BOOT: bool(process.env.SEED_ON_BOOT, true),
  TRUST_PROXY: bool(process.env.TRUST_PROXY, true),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 300),
}

module.exports = env
