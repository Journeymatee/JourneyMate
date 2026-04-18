'use strict'

const ApiError = require('../lib/ApiError')
const logger = require('../lib/logger')
const env = require('../config/env')

/**
 * Global exception handler.
 *  - ApiError  → exact status, code, message, details
 *  - pg errors → mapped to 409/400/503 as appropriate
 *  - Everything else → 500 + log (never leak internals to client)
 */
function errorHandler(err, req, res, _next) {
  let e = err

  // Map common Postgres errors to user-friendly ApiErrors
  if (e && e.code && typeof e.code === 'string' && /^[0-9A-Z]{5}$/.test(e.code)) {
    switch (e.code) {
      case '23505': e = ApiError.conflict('Resource already exists', { constraint: e.constraint }); break
      case '23503': e = ApiError.badRequest('Invalid reference', { constraint: e.constraint });      break
      case '23502': e = ApiError.badRequest('Missing required field', { column: e.column });         break
      case '22P02': e = ApiError.badRequest('Invalid input syntax');                                 break
      case '42P01': e = ApiError.unavailable('Database schema not ready');                           break
      case 'ECONNREFUSED':
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
