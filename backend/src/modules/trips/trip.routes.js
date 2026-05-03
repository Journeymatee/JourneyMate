'use strict'

const express = require('express')
const { query } = require('express-validator')
const validate = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const controller = require('./trip.controller')

const router = express.Router()

/**
 * Hard request-level timeout. If the controller doesn't respond in time
 * (e.g. an unexpected upstream hang slips past the per-fetch timeouts),
 * we send a deterministic 503 so the client can retry — instead of leaving
 * the connection open until the load balancer kills it minutes later.
 */
function withRequestTimeout(timeoutMs) {
  return (req, res, next) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled || res.headersSent) return
      settled = true
      res.status(503).json({
        error: {
          message: 'Request took too long. The server is busy — please try again.',
          code: 'REQUEST_TIMEOUT',
        },
      })
    }, timeoutMs)
    res.on('finish', () => { settled = true; clearTimeout(timer) })
    res.on('close',  () => { settled = true; clearTimeout(timer) })
    next()
  }
}

router.get(
  '/place-article',
  requireAuth,
  query('q').isString().trim().isLength({ min: 2, max: 200 }).withMessage('q required'),
  validate,
  controller.placeArticle
)

router.get(
  '/search',
  withRequestTimeout(25000), // hard ceiling — 25 s; client retries on 503
  requireAuth,
  query('from').isString().trim().isLength({ min: 2, max: 80 }).withMessage('from required'),
  query('to').isString().trim().isLength({ min: 2, max: 80 }).withMessage('to required'),
  // `days` / `tripType` / `vibes` are normalised in the service so that
  // unknown values never 400 — older clients still get a valid response.
  validate,
  controller.search
)

router.get('/preferences', requireAuth, controller.preferences)

router.get('/popular', controller.popular)

router.get(
  '/music',
  query('place').isString().trim().isLength({ min: 2, max: 80 }).withMessage('place required'),
  query('tripType').optional().isString().trim().isLength({ max: 24 }),
  query('vibe').optional().isString().trim().isLength({ max: 48 }),
  validate,
  controller.music
)

router.get(
  '/shopping',
  query('place').isString().trim().isLength({ min: 2, max: 80 }).withMessage('place required'),
  validate,
  controller.shopping
)

module.exports = router
