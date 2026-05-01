'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./admin.service')

const adminController = {
  ask: asyncHandler(async (req, res) => {
    const question = String(req.body?.question || '').trim()
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-10) : []
    const result = await service.ask({ question, history })
    res.json(result)
  }),

  stats: asyncHandler(async (_req, res) => {
    const stats = await service.quickStats()
    res.json(stats)
  }),
}

module.exports = adminController
