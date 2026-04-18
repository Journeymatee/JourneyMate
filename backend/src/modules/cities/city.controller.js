'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const ApiError = require('../../lib/ApiError')
const service = require('./city.service')

const cityController = {
  search: asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim()
    const limit = Math.min(Number(req.query.limit) || 12, 40)
    const stateCode = req.query.state ? String(req.query.state).toUpperCase() : null
    const payload = await service.search(q, { limit, stateCode })
    res.json(payload)
  }),

  bySlug: asyncHandler(async (req, res) => {
    const city = await service.bySlug(String(req.params.slug))
    if (!city) throw ApiError.notFound('City not found')
    res.json(city)
  }),

  states: asyncHandler(async (_req, res) => {
    const states = await service.listStates()
    res.json({ count: states.length, states })
  }),
}

module.exports = cityController
