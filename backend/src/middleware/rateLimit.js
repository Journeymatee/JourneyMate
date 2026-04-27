'use strict'

const rateLimit = require('express-rate-limit')
const env = require('../config/env')
const ApiError = require('../lib/ApiError')

const baseOptions = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(ApiError.tooMany()),
}

const globalLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_MAX,
})

const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 30,
})

const experienceCreateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 12,
})

const experienceLikeLimiter = rateLimit({
  ...baseOptions,
  windowMs: 5 * 60 * 1000,
  max: 120,
})

const experienceCommentLimiter = rateLimit({
  ...baseOptions,
  windowMs: 5 * 60 * 1000,
  max: 40,
})

module.exports = {
  globalLimiter,
  authLimiter,
  experienceCreateLimiter,
  experienceLikeLimiter,
  experienceCommentLimiter,
}
