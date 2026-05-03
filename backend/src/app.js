'use strict'

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')

const env = require('./config/env')
const logger = require('./lib/logger')
const { globalLimiter } = require('./middleware/rateLimit')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

const healthRoutes   = require('./modules/health/health.routes')
const authRoutes     = require('./modules/auth/auth.routes')
const cityRoutes     = require('./modules/cities/city.routes')
const tripRoutes     = require('./modules/trips/trip.routes')
const savedTripRoutes = require('./modules/trips/savedTrips.routes')
const bookingRoutes  = require('./modules/bookings/booking.routes')
const blogExperiencesListRoutes = require('./modules/blog/blog.experiencesList.routes')
const blogRoutes     = require('./modules/blog/blog.routes')
const insightsRoutes = require('./modules/insights/insights.routes')
const aiRoutes       = require('./modules/ai/ai.routes')
const adminRoutes    = require('./modules/admin/admin.routes')

function buildApp() {
  const app = express()
  if (env.TRUST_PROXY) app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
  app.use(compression())

  const origins = env.CORS_ORIGIN === '*'
    ? true
    : env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  app.use(cors({ origin: origins, credentials: true }))

  app.use(express.json({ limit: '200kb' }))
  app.use(express.urlencoded({ extended: false, limit: '200kb' }))

  // Structured request log (morgan → our logger)
  app.use(
    morgan(
      (tokens, req, res) =>
        JSON.stringify({
          t: new Date().toISOString(),
          lvl: 'info',
          msg: 'http',
          m: tokens.method(req, res),
          u: tokens.url(req, res),
          s: Number(tokens.status(req, res)),
          ms: Number(tokens['response-time'](req, res)),
        }),
      {
        stream: { write: (line) => process.stdout.write(line) },
        skip: (req) => req.path === '/api/health',
      }
    )
  )

  app.use(globalLimiter)

  // Routes
  app.use('/api/health',   healthRoutes)
  app.use('/api/auth',     authRoutes)
  app.use('/api/cities',   cityRoutes)
  app.use('/api/trips',    tripRoutes)
  app.use('/api/saved-trips', savedTripRoutes)
  app.use('/api/bookings', bookingRoutes)
  // Mount list/create first so /experiences is not mistaken for a slug
  app.use('/api/blog',     blogExperiencesListRoutes)
  app.use('/api/blog',     blogRoutes)
  app.use('/api/insights', insightsRoutes)
  app.use('/api/ai',       aiRoutes)
  app.use('/api/admin',    adminRoutes)

  // Keep legacy route alive for older clients: /api/trips/search was previously
  // documented and some code still calls it — already served above. Nothing else to alias.

  app.use(notFound)
  app.use(errorHandler)

  return app
}

module.exports = { buildApp, logger }
