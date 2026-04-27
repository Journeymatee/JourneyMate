'use strict'

const express = require('express')
const { body, param, query } = require('express-validator')
const validate = require('../../middleware/validate')
const { optionalAuth } = require('../../middleware/auth')
const {
  experienceLikeLimiter,
  experienceCommentLimiter,
} = require('../../middleware/rateLimit')
const controller = require('./blog.controller')

const router = express.Router()

const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid experience id required')]

router.post(
  '/experiences/:id/like',
  experienceLikeLimiter,
  optionalAuth,
  ...idParam,
  body('client_id').optional().isString().isLength({ min: 0, max: 64 }),
  validate,
  controller.toggleExperienceLike
)
router.post(
  '/experiences/:id/reaction',
  experienceLikeLimiter,
  optionalAuth,
  ...idParam,
  body('client_id').optional().isString().isLength({ min: 0, max: 64 }),
  body('emoji').optional().isString().isLength({ min: 0, max: 8 }),
  validate,
  controller.setExperienceReaction
)
router.get(
  '/experiences/:id/comments',
  ...idParam,
  query('limit').optional().isInt({ min: 1, max: 500 }),
  validate,
  controller.listExperienceComments
)
router.post(
  '/experiences/:id/comments',
  experienceCommentLimiter,
  optionalAuth,
  ...idParam,
  body('body')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment 1–2000 characters'),
  body('display_name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 0, max: 120 }),
  body('client_id').optional().isString().isLength({ min: 0, max: 64 }),
  validate,
  controller.addExperienceComment
)

router.get('/', controller.list)
router.get('/:slug', controller.getBySlug)

module.exports = router
