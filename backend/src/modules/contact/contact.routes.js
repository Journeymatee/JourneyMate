'use strict'

const express = require('express')
const rateLimit = require('express-rate-limit')
const { body } = require('express-validator')

const validate = require('../../middleware/validate')
const ApiError = require('../../lib/ApiError')
const controller = require('./contact.controller')

const router = express.Router()

// Stricter limiter for the contact endpoint — sends real email + calls the
// AI. We never want one user / one bot to flood the owner's inbox.
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 6,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(
      ApiError.tooMany(
        'You have sent too many messages in a short time. Please wait a few minutes and try again.'
      )
    ),
})

router.post(
  '/',
  contactLimiter,
  body('name').isString().trim().isLength({ min: 1, max: 80 }).withMessage('Name is required'),
  body('email').isString().trim().isLength({ min: 5, max: 254 }).withMessage('Email is required'),
  body('message')
    .isString()
    .trim()
    .isLength({ min: 10, max: 4000 })
    .withMessage('Message must be 10-4000 characters'),
  body('topic').optional().isString().trim().isLength({ max: 80 }).withMessage('Topic is too long'),
  validate,
  controller.submit
)

module.exports = router
