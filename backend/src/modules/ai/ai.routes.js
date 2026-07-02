'use strict'

const express = require('express')
const { body } = require('express-validator')

const validate = require('../../middleware/validate')
const { requireAuth } = require('../../middleware/auth')
const { authLimiter } = require('../../middleware/rateLimit')
const controller = require('./ai.controller')

const router = express.Router()

router.post(
  '/chat/stream',
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
