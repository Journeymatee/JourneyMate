'use strict'

/**
 * Structured operational error. Anything thrown/passed to next()
 * that is an ApiError is treated as known, user-facing, and safe to serialize.
 * Everything else is logged + returned as an opaque 500.
 */
class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message || code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.isOperational = true
    Error.captureStackTrace?.(this, ApiError)
  }

  static badRequest(msg, details)    { return new ApiError(400, 'BAD_REQUEST',    msg || 'Bad request',        details) }
  static unauthorized(msg)           { return new ApiError(401, 'UNAUTHORIZED',   msg || 'Unauthorized')                }
  static forbidden(msg)              { return new ApiError(403, 'FORBIDDEN',      msg || 'Forbidden')                   }
  static notFound(msg)               { return new ApiError(404, 'NOT_FOUND',      msg || 'Not found')                   }
  static conflict(msg, details)      { return new ApiError(409, 'CONFLICT',       msg || 'Conflict',           details) }
  static unprocessable(msg, details) { return new ApiError(422, 'UNPROCESSABLE',  msg || 'Unprocessable',      details) }
  static tooMany(msg)                { return new ApiError(429, 'RATE_LIMITED',   msg || 'Too many requests')           }
  static internal(msg, details)      { return new ApiError(500, 'INTERNAL',       msg || 'Server error',       details) }
  static unavailable(msg)            { return new ApiError(503, 'UNAVAILABLE',    msg || 'Service unavailable')         }
}

module.exports = ApiError
