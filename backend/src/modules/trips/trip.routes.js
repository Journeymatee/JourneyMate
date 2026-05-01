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

module.exports = router
