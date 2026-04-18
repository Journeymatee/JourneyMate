'use strict'

const { validationResult } = require('express-validator')
const ApiError = require('../lib/ApiError')

/** Run after a chain of express-validator rules. */
function validate(req, _res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) return next()
  const details = result.array({ onlyFirstError: true }).map((e) => ({
    field: e.path || e.param,
    msg: e.msg,
  }))
  return next(ApiError.badRequest('Validation failed', details))
}

module.exports = validate
