'use strict'

const ApiError = require('../lib/ApiError')
const { verify } = require('../lib/token')

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const m = header.match(/^Bearer\s+(.+)$/i)
  const session = m ? verify(m[1].trim()) : null
  if (!session) return next(ApiError.unauthorized('Missing or invalid token'))
  req.user = { id: session.sub, email: session.email, name: session.name }
  return next()
}

/** Attach user if present, but don't block. */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const m = header.match(/^Bearer\s+(.+)$/i)
  const session = m ? verify(m[1].trim()) : null
  if (session) req.user = { id: session.sub, email: session.email, name: session.name }
  return next()
}

module.exports = { requireAuth, optionalAuth }
