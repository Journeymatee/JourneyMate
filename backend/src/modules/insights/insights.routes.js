'use strict'

const express = require('express')
const controller = require('./insights.controller')

const router = express.Router()

router.get('/trending-cities', controller.trendingCities)

module.exports = router
