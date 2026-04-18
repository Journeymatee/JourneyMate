'use strict'

const ApiError = require('../lib/ApiError')
const logger = require('../lib/logger')
const env = require('../config/env')

const NODE_NETWORK_CODES = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ENETUNREACH',
  'EAI_AGAIN',
  'ECONNRESET',
  'EPIPE',
])

function mapConnectivityError(raw) {
  if (!raw) return null
  const code = raw.code
  if (typeof code === 'string' && NODE_NETWORK_CODES.has(code)) {
    return ApiError.unavailable('Database unreachable')
  }
  return null
}

/**
 * Global exception handler.
 *  - ApiError  → exact status, code, message, details
 *  - pg errors → mapped to 409/400/503 as appropriate
 *  - Everything else → 500 + log (never leak internals to client)
 */
function errorHandler(err, req, res, _next) {
  let e = err

  if (e?.name === 'AggregateError' && Array.isArray(e.errors)) {
    for (const sub of e.errors) {
      const mapped = mapConnectivityError(sub)
      if (mapped) {
        e = mapped
        break
      }
    }
  } else {
    const mapped = mapConnectivityError(e)
    if (mapped) e = mapped
  }

  // Map common Postgres errors to user-friendly ApiErrors
  if (e && e.code && typeof e.code === 'string' && /^[0-9A-Z]{5}$/.test(e.code)) {
    switch (e.code) {
      case '23505': e = ApiError.conflict('Resource already exists', { constraint: e.constraint }); break
      case '23503': e = ApiError.badRequest('Invalid reference', { constraint: e.constraint });      break
      case '23502': e = ApiError.badRequest('Missing required field', { column: e.column });         break
      case '22P02': e = ApiError.badRequest('Invalid input syntax');                                 break
      case '42P01': e = ApiError.unavailable('Database schema not ready');                           break
      case '3D000': e = ApiError.unavailable('Database does not exist. Check PGDATABASE or DATABASE_URL.'); break
      case '28P01': e = ApiError.unavailable('Database rejected the API credentials. Fix PGUSER/PGPASSWORD or DATABASE_URL in .env.'); break
      case '53300': e = ApiError.unavailable('Database is at capacity. Try again in a moment.');   break
      case '08006':
      case '08001': e = ApiError.unavailable('Database unreachable');                                break
    }
  }

  if (!(e instanceof ApiError)) {
    logger.error({
      msg: 'unhandled error',
      path: req.originalUrl,
      method: req.method,
      err: err?.message,
      stack: env.NODE_ENV === 'production' ? undefined : err?.stack,
    })
    e = ApiError.internal('Something went wrong')
  } else if (e.status >= 500) {
    logger.error({ msg: 'api error', code: e.code, path: req.originalUrl, err: e.message })
  } else {
    logger.info({ msg: 'client error', status: e.status, code: e.code, path: req.originalUrl })
  }

  res.status(e.status).json({
    error: {
      code: e.code,
      message: e.message,
      ...(e.details ? { details: e.details } : {}),
    },
  })
}

module.exports = errorHandler
