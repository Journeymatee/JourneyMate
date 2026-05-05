'use strict'

/**
 * Outbound mailer — thin wrapper around nodemailer.
 *
 * Why a wrapper?
 *   • The transport is created lazily so the API still boots when SMTP creds
 *     are missing (e.g. local dev or preview deploys).
 *   • All callers go through `sendMail()` so we get one consistent failure
 *     mode + log line + "do nothing if disabled" branch.
 *   • Keeps `nodemailer` as the only place that imports the SMTP module.
 *
 * Required env (production):
 *   SMTP_HOST   — e.g. smtp.gmail.com
 *   SMTP_PORT   — 465 (SSL) or 587 (STARTTLS)
 *   SMTP_SECURE — "true" for 465, "false" for 587
 *   SMTP_USER   — the mailbox username (Gmail address)
 *   SMTP_PASS   — Gmail "App Password" (not your real password)
 *   MAIL_FROM   — "JourneyMate <noreply@yourdomain.com>" (defaults to SMTP_USER)
 *   OWNER_EMAIL — where /api/contact submissions land
 */

const nodemailer = require('nodemailer')
const env = require('../config/env')
const logger = require('./logger')

let transporter = null
let lastInitError = null

function buildTransport() {
  if (!env.MAIL_ENABLED) return null
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    lastInitError = 'SMTP_HOST/SMTP_USER/SMTP_PASS missing — outbound mail disabled'
    return null
  }
  try {
    const t = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE, // true for 465, false for 587
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      // Reasonable timeouts so a hung MTA doesn't block the request thread.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
    lastInitError = null
    return t
  } catch (err) {
    lastInitError = err?.message || 'transport build failed'
    return null
  }
}

function getTransport() {
  if (transporter) return transporter
  transporter = buildTransport()
  return transporter
}

function isMailEnabled() {
  return Boolean(getTransport())
}

function defaultFrom() {
  return env.MAIL_FROM || env.SMTP_USER || ''
}

/**
 * Send a single email.
 *
 *   { to, subject, text?, html?, replyTo?, from? }
 *
 * Resolves to `{ ok, info?, skipped?, error? }`. Never throws — failures are
 * logged and surfaced via the boolean so the caller decides what to do.
 */
async function sendMail(opts) {
  const t = getTransport()
  if (!t) {
    logger.warn?.({
      msg: 'mailer.skipped',
      reason: lastInitError || 'mailer disabled',
      to: opts?.to,
    })
    return { ok: false, skipped: true, reason: lastInitError || 'mailer disabled' }
  }

  const message = {
    from: opts.from || defaultFrom(),
    to: opts.to,
    subject: opts.subject || '(no subject)',
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
  }

  try {
    const info = await t.sendMail(message)
    logger.info?.({
      msg: 'mailer.sent',
      to: opts.to,
      subject: opts.subject,
      messageId: info?.messageId,
    })
    return { ok: true, info }
  } catch (err) {
    logger.error?.({
      msg: 'mailer.failed',
      to: opts.to,
      subject: opts.subject,
      err: err?.message,
    })
    return { ok: false, error: err?.message || 'send failed' }
  }
}

/**
 * Tiny HTML-escaper for user-supplied content rendered into our email
 * templates. We intentionally avoid pulling in `lodash` or similar.
 */
function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

module.exports = {
  sendMail,
  isMailEnabled,
  escapeHtml,
}
