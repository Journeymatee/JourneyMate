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

  // Comma-separated list of emails that may use the Admin Agent.
  // e.g. ADMIN_EMAILS=harsh@example.com,owner@journeymate.app
  ADMIN_EMAILS: String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),

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
  AI_REALTIME_ENABLED: bool(process.env.AI_REALTIME_ENABLED, true),
  AI_LIVE_TIMEOUT_MS: Number(process.env.AI_LIVE_TIMEOUT_MS || 8000),
  // Optional: Insights BFF microservice base URL, e.g. http://127.0.0.1:4100
  INSIGHTS_BFF_URL: process.env.INSIGHTS_BFF_URL || '',
  INSIGHTS_BFF_TIMEOUT_MS: Number(process.env.INSIGHTS_BFF_TIMEOUT_MS || 2500),

  SEED_ON_BOOT: bool(process.env.SEED_ON_BOOT, true),
  TRUST_PROXY: bool(process.env.TRUST_PROXY, true),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 300),

  // ─── Contact form / outbound email (nodemailer) ─────────────────────────
  // Where the inbound contact-form notification gets sent. Defaults to the
  // first ADMIN_EMAILS entry so the same person who manages the site also
  // receives messages.
  OWNER_EMAIL:
    process.env.OWNER_EMAIL ||
    process.env.CONTACT_EMAIL ||
    String(process.env.ADMIN_EMAILS || '').split(',')[0].trim() ||
    '',
  // SMTP transport. Use a Gmail App Password (https://myaccount.google.com/apppasswords)
  // for SMTP_USER/SMTP_PASS — regular passwords won't work.
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number(process.env.SMTP_PORT || 465),
  SMTP_SECURE: bool(process.env.SMTP_SECURE, true),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  // Optional pretty "From: JourneyMate <hello@example.com>" header. Falls
  // back to SMTP_USER when not set.
  MAIL_FROM: process.env.MAIL_FROM || '',
  // Toggle: when false, the API still records messages but never tries to
  // send mail (handy in CI / preview deploys without SMTP creds).
  MAIL_ENABLED: bool(process.env.MAIL_ENABLED, true),

  // ─── Live booking agent (real-time train / flight / hotel / web data) ───
  // All optional — every tool ships a graceful fallback when its key is
  // absent (deterministic deep-links + heuristic answers). Missing keys are
  // logged once at boot and surfaced to the UI as "API key not configured".
  //
  // Tavily — AI-friendly web search. Free tier ~1k queries/month.
  //   https://app.tavily.com/  → API Keys.
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',

  // RapidAPI key used by the IRCTC1 train provider on RapidAPI marketplace.
  // Free tier is generally enough for personal use.
  //   https://rapidapi.com/IRCTCAPI/api/irctc1
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY || '',
  RAPIDAPI_TRAIN_HOST: process.env.RAPIDAPI_TRAIN_HOST || 'irctc1.p.rapidapi.com',

  // Amadeus self-service (optional) — flight & hotel offers.
  //   https://developers.amadeus.com/  → free Self-Service plan.
  AMADEUS_CLIENT_ID: process.env.AMADEUS_CLIENT_ID || '',
  AMADEUS_CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET || '',

  // Aviationstack (optional) — flight schedule fallback.
  AVIATIONSTACK_KEY: process.env.AVIATIONSTACK_KEY || '',

  // Per-call timeout for any external lookup spawned by the live agent.
  AGENT_LIVE_TIMEOUT_MS: Number(process.env.AGENT_LIVE_TIMEOUT_MS || 9000),

  // ─── Razorpay (test mode) ────────────────────────────────────────────────
  // The booking flow ALWAYS works without these — when keys are absent we
  // skip the Razorpay round-trip and confirm bookings with a deterministic
  // demo signature. Set both keys to enable the real Checkout widget.
  //
  // Get test keys at https://dashboard.razorpay.com/  → Account & Settings
  // → API Keys (use the "Test mode" toggle in the top nav). Test cards:
  // 4111 1111 1111 1111  · any future expiry  · any 3-digit CVV.
  RAZORPAY_KEY_ID:     process.env.RAZORPAY_KEY_ID     || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
}

module.exports = env
