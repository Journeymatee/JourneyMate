'use strict'

/**
 * Tiny shared `fetch` helper used by every agent tool.
 *
 *   • Hard timeout via AbortController (`AGENT_LIVE_TIMEOUT_MS` from env).
 *   • Returns `null` on any kind of failure (network, non-2xx, JSON parse) so
 *     callers can write a clean `if (!data) return fallback()` branch.
 *   • Never throws — every tool already handles the "no live data" case, and
 *     a thrown rejection from a flaky third-party API would crash the agent
 *     loop. Errors are logged once at debug level.
 */

const env = require('../../../config/env')
const logger = require('../../../lib/logger')

const DEFAULT_TIMEOUT_MS = env.AGENT_LIVE_TIMEOUT_MS || 9000

async function fetchJson(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (typeof fetch !== 'function') return null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal })
    if (!res.ok) {
      logger.debug?.({ msg: 'agent.http.non2xx', url, status: res.status })
      return null
    }
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('json')) {
      // Some APIs (Nominatim) return JSON without setting the header.
      const text = await res.text()
      try { return JSON.parse(text) } catch { return null }
    }
    return await res.json()
  } catch (err) {
    if (err?.name !== 'AbortError') {
      logger.debug?.({ msg: 'agent.http.fail', url, err: err?.message })
    }
    return null
  } finally {
    clearTimeout(timer)
  }
}

function todayIsoDate() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function ensureFutureDate(dateStr) {
  const today = todayIsoDate()
  const safe = String(dateStr || '').trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safe)) return today
  return safe < today ? today : safe
}

module.exports = {
  fetchJson,
  todayIsoDate,
  ensureFutureDate,
  DEFAULT_TIMEOUT_MS,
}
