'use strict'

/**
 * List + create community travel notes (mounted at /api/blog so paths are
 * /experiences and not shadowed by GET /:slug).
 * Kept in a small router and mounted first in app.js.
 */
const express = require('express')
const { body, query } = require('express-validator')
const validate = require('../../middleware/validate')
const { optionalAuth } = require('../../middleware/auth')
const { experienceCreateLimiter } = require('../../middleware/rateLimit')
const controller = require('./blog.controller')

const router = express.Router()

router.get(
  '/experiences',
  optionalAuth,
  query('client_id').optional().isString().isLength({ min: 0, max: 64 }),
  validate,
  controller.listExperiences
)
router.post(
  '/experiences',
  experienceCreateLimiter,
  optionalAuth,
  body('display_name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Name must be 2–120 characters'),
  body('title')
    .isString()
    .trim()
    .isLength({ min: 4, max: 200 })
    .withMessage('Title must be 4–200 characters'),
  body('body')
    .isString()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Story must be 20–5000 characters'),
  body('destination').optional({ values: 'falsy' }).isString().trim().isLength({ min: 1, max: 120 }),
  body('visit_months')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Best time hint must be 1–200 characters if provided'),
  validate,
  controller.createExperience
)

module.exports = router
