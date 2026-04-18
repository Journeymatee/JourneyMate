'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./trip.service')

const tripController = {
  search: asyncHandler(async (req, res) => {
    const from = String(req.query.from || '').trim()
    const to = String(req.query.to || '').trim()
    const trip = await service.search(from, to)
    res.json(trip)
  }),

  popular: asyncHandler(async (_req, res) => {
    res.json({ routes: service.listPopular() })
  }),
}

module.exports = tripController
