'use strict'

require('dotenv').config()

const bool = (v, d = false) => {
  if (v === undefined || v === null || v === '') return d
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase())
}

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
    max: Number(process.env.PGPOOL_MAX || 10),
  },

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',

  SEED_ON_BOOT: bool(process.env.SEED_ON_BOOT, true),
  TRUST_PROXY: bool(process.env.TRUST_PROXY, true),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 300),
}

module.exports = env
