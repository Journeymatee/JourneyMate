'use strict'

const express = require('express')
const { query } = require('express-validator')
const validate = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const controller = require('./trip.controller')

const router = express.Router()

router.get(
  '/place-article',
  requireAuth,
  query('q').isString().trim().isLength({ min: 2, max: 200 }).withMessage('q required'),
  validate,
  controller.placeArticle
)

router.get(
  '/search',
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
