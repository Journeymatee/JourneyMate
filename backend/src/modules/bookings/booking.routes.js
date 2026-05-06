'use strict'

const express = require('express')
const { body } = require('express-validator')
const validate = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const controller = require('./booking.controller')

const router = express.Router()

router.use(requireAuth)

/* ─── Discovery (does not persist anything) ────────────────────── */

router.post(
  '/inventory',
  body('type').isIn(['train', 'flight', 'hotel']),
  body('origin').optional().isString().trim().isLength({ min: 1, max: 160 }),
  body('destination').optional().isString().trim().isLength({ min: 1, max: 160 }),
  body('travelDate').optional({ nullable: true }).isString().trim().isLength({ max: 32 }),
  body('checkIn').optional({ nullable: true }).isString().trim().isLength({ max: 32 }),
  validate,
  controller.inventory,
)

router.post(
  '/quote',
  body('type').isIn(['train', 'flight', 'hotel']),
  body('offer').isObject(),
  body('classCode').optional({ nullable: true }).isString().trim().isLength({ max: 20 }),
  body('passengerCount').optional({ nullable: true }).isInt({ min: 1, max: 9 }),
  body('nights').optional({ nullable: true }).isInt({ min: 1, max: 60 }),
  validate,
  controller.quote,
)

router.post(
  '/seat-map',
  body('type').isIn(['train', 'flight', 'hotel']),
  body('offer').isObject(),
  body('classCode').optional({ nullable: true }).isString().trim().isLength({ max: 20 }),
  validate,
  controller.seatMap,
)

router.get('/payment-mode', controller.paymentMode)

/* ─── Booking lifecycle ─────────────────────────────────────────── */

router.get('/', controller.list)
router.get('/:id', controller.getOne)

router.post(
  '/draft',
  body('type').isIn(['train', 'flight', 'hotel']),
  body('offer').isObject(),
  body('classCode').optional({ nullable: true }).isString().trim().isLength({ max: 20 }),
  body('passengerCount').optional({ nullable: true }).isInt({ min: 1, max: 9 }),
  body('passengers').optional({ nullable: true }).isArray({ max: 9 }),
  body('passengers.*.fullName').optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 80 }),
  body('passengers.*.age').optional({ nullable: true }).isInt({ min: 0, max: 120 }),
  body('passengers.*.gender').optional({ nullable: true }).isIn(['M', 'F', 'O', 'male', 'female', 'other', '']),
  body('contactEmail').optional({ nullable: true }).isEmail(),
  body('contactPhone').optional({ nullable: true }).isString().trim().isLength({ max: 20 }),
  body('travelDate').optional({ nullable: true }).isString().trim().isLength({ max: 32 }),
  body('checkIn').optional({ nullable: true }).isString().trim().isLength({ max: 32 }),
  body('checkOut').optional({ nullable: true }).isString().trim().isLength({ max: 32 }),
  body('nights').optional({ nullable: true }).isInt({ min: 1, max: 60 }),
  validate,
  controller.createDraft,
)

router.post(
  '/:id/verify',
  body('paymentId').isString().trim().isLength({ min: 4, max: 64 }),
  body('signature').isString().trim().isLength({ min: 4, max: 256 }),
  body('recipientEmail').optional({ nullable: true }).isEmail(),
  validate,
  controller.verifyPayment,
)

router.post('/:id/cancel', controller.cancel)

/* ─── Legacy "save the comparison plan" endpoint ───────────────── */

router.post(
  '/',
  body('origin').isString().trim().isLength({ min: 2, max: 120 }),
  body('destination').isString().trim().isLength({ min: 2, max: 120 }),
  body('plan').isIn(['silver', 'gold']),
  body('price_inr').isInt({ min: 1 }),
  body('travel_date').optional().isISO8601(),
  validate,
  controller.create,
)

module.exports = router
