'use strict'

const express = require('express')
const { body } = require('express-validator')
const validate     = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const { authLimiter } = require('../../middleware/rateLimit')
const controller   = require('./auth.controller')
const { validateEmail } = require('../../lib/emailValidator')

const router = express.Router()

/**
 * Express-validator rule: strict email validation.
 * `strict=true` runs an MX lookup so signup/forgot-password only accept domains
 * that can actually receive mail. Login skips MX (slow) since the account
 * already exists and was checked at signup.
 */
function emailRule({ strict }) {
  return body('email')
    .isString()
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 254 }).withMessage('Please enter a valid email address')
    .bail()
    .custom(async (value) => {
      const result = await validateEmail(value, { requireMx: strict })
      if (!result.ok) throw new Error(result.reason)
      return true
    })
}

router.post(
  '/login',
  authLimiter,
  emailRule({ strict: false }),
  body('password').isString().isLength({ min: 1 }).withMessage('Password required'),
  validate,
  controller.login
)

router.post(
  '/register',
  authLimiter,
  emailRule({ strict: true }),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
  body('name').optional().isString().trim().isLength({ max: 120 }),
  validate,
  controller.register
)

router.post(
  '/forgot-password',
  authLimiter,
  emailRule({ strict: true }),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
  validate,
  controller.forgotPassword
)

/** Verify a Google Identity Services credential and return a JourneyMate JWT */
router.post(
  '/google',
  authLimiter,
  body('credential').isString().notEmpty().withMessage('credential is required'),
  validate,
  controller.googleAuth
)

router.get('/me',    requireAuth, controller.me)
router.get('/stats', controller.stats)   // public — user count

module.exports = router
