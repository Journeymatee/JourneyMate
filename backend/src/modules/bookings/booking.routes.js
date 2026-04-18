'use strict'

const express = require('express')
const { body } = require('express-validator')
const validate = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const controller = require('./booking.controller')

const router = express.Router()

router.use(requireAuth)

router.get('/', controller.list)

router.post(
  '/',
  body('origin').isString().trim().isLength({ min: 2, max: 120 }),
  body('destination').isString().trim().isLength({ min: 2, max: 120 }),
  body('plan').isIn(['silver', 'gold']),
  body('price_inr').isInt({ min: 1 }),
  body('travel_date').optional().isISO8601(),
  validate,
  controller.create
)

module.exports = router
