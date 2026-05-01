'use strict'

const ApiError = require('../lib/ApiError')
const env = require('../config/env')
const { verify } = require('../lib/token')

function isAdminEmail(email) {
  if (!email) return false
  return env.ADMIN_EMAILS.includes(String(email).trim().toLowerCase())
}

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const m = header.match(/^Bearer\s+(.+)$/i)
  const session = m ? verify(m[1].trim()) : null
  if (!session) return next(ApiError.unauthorized('Missing or invalid token'))
  req.user = {
    id: session.sub,
    email: session.email,
    name: session.name,
    isAdmin: isAdminEmail(session.email),
  }
  return next()
}

/** Attach user if present, but don't block. */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const m = header.match(/^Bearer\s+(.+)$/i)
  const session = m ? verify(m[1].trim()) : null
  if (session) {
    req.user = {
      id: session.sub,
      email: session.email,
      name: session.name,
      isAdmin: isAdminEmail(session.email),
    }
  }
  return next()
}

/**
 * requireAuth + email must be in ADMIN_EMAILS.
 * Use this for ANY endpoint that exposes raw customer data.
 */
function requireAdmin(req, _res, next) {
  const header = req.headers.authorization || ''
  const m = header.match(/^Bearer\s+(.+)$/i)
  const session = m ? verify(m[1].trim()) : null
  if (!session) return next(ApiError.unauthorized('Missing or invalid token'))
  if (!isAdminEmail(session.email)) {
    return next(ApiError.forbidden('Admin access required'))
  }
  req.user = {
    id: session.sub,
    email: session.email,
    name: session.name,
    isAdmin: true,
  }
  return next()
}

module.exports = { requireAuth, optionalAuth, requireAdmin }
