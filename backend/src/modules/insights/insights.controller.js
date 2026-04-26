'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./insights.service')

const insightsController = {
  trendingCities: asyncHandler(async (_req, res) => {
    const data = await service.trendingCities()
    res.json(data)
  }),
}

module.exports = insightsController
