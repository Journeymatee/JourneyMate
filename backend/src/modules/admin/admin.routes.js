'use strict'

const express = require('express')
const { body } = require('express-validator')

const validate = require('../../middleware/validate')
const { requireAdmin } = require('../../middleware/auth')
const { authLimiter } = require('../../middleware/rateLimit')
const controller = require('./admin.controller')

const router = express.Router()

router.get('/stats', requireAdmin, controller.stats)

router.post(
  '/agent',
  requireAdmin,
  authLimiter,
  body('question')
    .isString()
    .trim()
    .isLength({ min: 2, max: 2000 })
    .withMessage('question must be 2-2000 characters'),
  body('history')
    .optional()
    .isArray({ max: 10 })
    .withMessage('history must be an array with max 10 items'),
  body('history.*.role')
    .optional()
    .isIn(['user', 'assistant'])
    .withMessage('history role must be user or assistant'),
  body('history.*.content')
    .optional()
    .isString()
    .isLength({ min: 1, max: 4000 })
    .withMessage('history content must be 1-4000 chars'),
  validate,
  controller.ask
)

module.exports = router
