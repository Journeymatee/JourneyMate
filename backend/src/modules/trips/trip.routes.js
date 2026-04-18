'use strict'

const express = require('express')
const { query } = require('express-validator')
const validate = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const controller = require('./trip.controller')

const router = express.Router()

router.get(
  '/search',
  requireAuth,
  query('from').isString().trim().isLength({ min: 2, max: 80 }).withMessage('from required'),
  query('to').isString().trim().isLength({ min: 2, max: 80 }).withMessage('to required'),
  validate,
  controller.search
)

router.get('/popular', controller.popular)

module.exports = router
