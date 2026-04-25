'use strict'

const express = require('express')
const { body } = require('express-validator')
const validate     = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const { authLimiter } = require('../../middleware/rateLimit')
const controller   = require('./auth.controller')

const router = express.Router()

router.post(
  '/login',
  authLimiter,
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password required'),
  validate,
  controller.login
)

router.post(
  '/register',
  authLimiter,
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
  body('name').optional().isString().trim().isLength({ max: 120 }),
  validate,
  controller.register
)

router.post(
  '/forgot-password',
  authLimiter,
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
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
