'use strict'

const express = require('express')
const { query } = require('express-validator')
const validate = require('../../middleware/validate')
const controller = require('./city.controller')

const router = express.Router()

router.get(
  '/',
  query('q').optional().isString().isLength({ max: 80 }),
  query('limit').optional().isInt({ min: 1, max: 40 }),
  query('state').optional().isString().isLength({ min: 2, max: 4 }),
  validate,
  controller.search
)

router.get('/states', controller.states)
router.get('/:slug', controller.bySlug)

module.exports = router
