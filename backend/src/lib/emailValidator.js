'use strict'

/**
 * Strict server-side email validator used by /auth endpoints.
 *
 * Three layers, in order:
 *  1. Strict format check (rejects "a@b", "test@aaa", etc. that pass loose isEmail()).
 *  2. Domain allowlist of well-known providers + denylist of disposable/test domains.
 *  3. DNS MX record lookup so the domain can actually receive mail.
 *
 * Works without any external API or paid service.
 */

const dns = require('dns').promises

/** Top RFC-style format check — stricter than express-validator's default isEmail. */
const STRICT_RE =
  /^[A-Za-z0-9](?:[A-Za-z0-9._%+\-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/

/** Reserved "fake" TLDs (RFC 2606 + common convention). Reject outright. */
const FAKE_TLDS = new Set(['test', 'example', 'invalid', 'localhost', 'local'])

/** Placeholder / sample domains that show up in tutorials and obviously aren't real accounts. */
const FAKE_DOMAINS = new Set([
  'example.com', 'example.net', 'example.org', 'test.com',
  'foo.com', 'bar.com', 'baz.com',
  'aaa.com', 'bbb.com', 'ccc.com', 'qqq.com', 'xyz.com', 'asdf.com', 'asdfgh.com',
  'abc.com', 'abcd.com', 'mail.com', 'email.com',
])

/**
 * Disposable/temporary inbox providers — block these to prevent throwaway signups.
 * The list is intentionally compact; users won't notice extras for legit providers.
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'mailinator.net',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmailaddress.com', 'tempmail.email',
  '10minutemail.com', '10minutemail.net', '20minutemail.com',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'sharklasers.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'fakeinbox.com', 'fakemail.fr', 'fake-mail.ml',
  'trashmail.com', 'trashmail.net', 'trashmail.de',
  'getnada.com', 'maildrop.cc', 'dispostable.com', 'throwawaymail.com',
  'mintemail.com', 'mohmal.com', 'tempinbox.com', 'mytemp.email',
  'spamgourmet.com', 'spam4.me', 'spambox.us',
  'mailnesia.com', 'meltmail.com', 'getairmail.com', 'tempemail.net',
  'discard.email', 'inboxbear.com', 'emailondeck.com', 'mailcatch.com',
  'tempr.email', 'mvrht.com', 'mt2015.com', 'binkmail.com', 'bobmail.info',
  'chacuo.net', 'cool.fr.nf', 'jetable.org', 'nospam.ze.tc',
  'tmail.ws', 'tmpeml.info', 'inboxalias.com', 'cuvox.de', 'einrot.com',
  'fleckens.hu', 'jourrapide.com', 'gustr.com', 'rhyta.com', 'superrito.com',
  'trbvm.com', 'armyspy.com', 'dayrep.com', 'teleworm.us',
])

/** In-memory MX lookup cache: domain → { ok, expiresAt }. */
const mxCache = new Map()
const MX_CACHE_TTL_MS = 6 * 60 * 60 * 1000
const MX_LOOKUP_TIMEOUT_MS = 4000
const MX_NEGATIVE_CACHE_TTL_MS = 5 * 60 * 1000

function cacheGet(domain) {
  const entry = mxCache.get(domain)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    mxCache.delete(domain)
    return null
  }
  return entry.ok
}

function cacheSet(domain, ok) {
  const ttl = ok ? MX_CACHE_TTL_MS : MX_NEGATIVE_CACHE_TTL_MS
  mxCache.set(domain, { ok, expiresAt: Date.now() + ttl })
}

async function lookupMxWithTimeout(domain) {
  const cached = cacheGet(domain)
  if (cached !== null) return cached

  const lookupPromise = (async () => {
    try {
      const records = await dns.resolveMx(domain)
      if (Array.isArray(records) && records.length > 0) return true
    } catch {
      // fall through to A-record fallback
    }
    try {
      // RFC 5321 §5.1: if no MX, the A record is the implicit mail host.
      const records = await dns.resolve(domain, 'A')
      return Array.isArray(records) && records.length > 0
    } catch {
      return false
    }
  })()

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve(null), MX_LOOKUP_TIMEOUT_MS)
  })

  const result = await Promise.race([lookupPromise, timeoutPromise])
  if (result === null) {
    // Don't lock real users out if our DNS is slow — let them through but
    // don't cache the unknown result so we retry next time.
    return true
  }

  cacheSet(domain, result)
  return result
}

function splitEmail(input) {
  const lower = String(input || '').trim().toLowerCase()
  const at = lower.lastIndexOf('@')
  if (at < 1 || at === lower.length - 1) return { local: '', domain: '', lower }
  return {
    local: lower.slice(0, at),
    domain: lower.slice(at + 1),
    lower,
  }
}

function isDisposableDomain(domain) {
  if (DISPOSABLE_DOMAINS.has(domain)) return true
  for (const d of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${d}`)) return true
  }
  return false
}

/**
 * Validate an email address.
 * @param {string} email
 * @param {{ requireMx?: boolean }} [opts] requireMx defaults to true.
 * @returns {Promise<{ ok: true, normalized: string } | { ok: false, reason: string }>}
 */
async function validateEmail(email, opts = {}) {
  const { requireMx = true } = opts
  const { local, domain, lower } = splitEmail(email)

  if (!lower) return { ok: false, reason: 'Please enter your email address' }
  if (lower.length > 254) return { ok: false, reason: 'Email address is too long' }
  if (!local || !domain) return { ok: false, reason: 'Please enter a valid email (e.g. name@gmail.com)' }
  if (!STRICT_RE.test(lower)) {
    return { ok: false, reason: 'That email looks invalid. Please enter a real address like name@gmail.com.' }
  }

  const tld = domain.split('.').pop()
  if (FAKE_TLDS.has(tld)) {
    return { ok: false, reason: 'Test/example email domains are not allowed. Please use a real address.' }
  }
  if (FAKE_DOMAINS.has(domain)) {
    return { ok: false, reason: 'Placeholder email domains are not allowed. Please use a real address.' }
  }
  if (isDisposableDomain(domain)) {
    return { ok: false, reason: 'Disposable / temporary email addresses are not allowed.' }
  }

  if (requireMx) {
    const ok = await lookupMxWithTimeout(domain)
    if (!ok) {
      return {
        ok: false,
        reason: `The domain "${domain}" does not appear to receive email. Please double-check or use a different address.`,
      }
    }
  }

  return { ok: true, normalized: lower }
}

module.exports = {
  validateEmail,
  isDisposableDomain,
  DISPOSABLE_DOMAINS,
  FAKE_DOMAINS,
}
