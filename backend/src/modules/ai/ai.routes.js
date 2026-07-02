'use strict'

const express = require('express')
const { body } = require('express-validator')

const validate = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const { authLimiter } = require('../../middleware/rateLimit')
const controller = require('./ai.controller')

const router = express.Router()

// Validation rules shared between /chat and /chat/stream. We allow longer
// messages (up to 6000 chars) so users can paste code, essays, or long
// passages they want help with.
const chatValidation = [
  body('message')
    .isString()
    .trim()
    .isLength({ min: 2, max: 2000 })
    .withMessage('message must be 2-2000 characters'),
  body('planState')
    .optional({ nullable: true })
    .isObject()
    .withMessage('planState must be an object'),
  body('history')
    .optional()
    .isArray({ max: 30 })
    .withMessage('history must be an array with max 30 items'),
  body('history.*.role')
    .optional()
    .isIn(['user', 'assistant'])
    .withMessage('history role must be user or assistant'),
  body('history.*.content')
    .optional()
    .isString()
    .isLength({ min: 1, max: 6000 })
    .withMessage('history content must be 1-6000 chars'),
]

router.post(
  '/chat/stream',
  requireAuth,
  authLimiter,
  ...chatValidation,
  validate,
  controller.chatStream
)

router.post(
  '/chat',
  requireAuth,
  authLimiter,
  body('message')
    .isString()
    .trim()
    .isLength({ min: 2, max: 2000 })
    .withMessage('message must be 2-2000 characters'),
  body('planState')
    .optional({ nullable: true })
    .isObject()
    .withMessage('planState must be an object'),
  body('history')
    .optional()
    .isArray({ max: 20 })
    .withMessage('history must be an array with max 20 items'),
  body('history.*.role')
    .optional()
    .isIn(['user', 'assistant'])
    .withMessage('history role must be user or assistant'),
  body('history.*.content')
    .optional()
    .isString()
    .isLength({ min: 1, max: 2000 })
    .withMessage('history content must be 1-2000 chars'),
  validate,
  controller.chat
)

module.exports = router
