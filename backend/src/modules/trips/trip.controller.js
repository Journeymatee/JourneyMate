'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./trip.service')

const tripController = {
  search: asyncHandler(async (req, res) => {
    const from = String(req.query.from || '').trim()
    const to = String(req.query.to || '').trim()
    const days = req.query.days
    const trip = await service.search(from, to, { days })
    res.json(trip)
  }),

  popular: asyncHandler(async (_req, res) => {
    res.json({ routes: service.listPopular() })
  }),

  placeArticle: asyncHandler(async (req, res) => {
    const out = await service.placeArticle(req.query.q)
    res.json(out)
  }),
}

module.exports = tripController
