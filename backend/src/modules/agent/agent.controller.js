'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const ApiError = require('../../lib/ApiError')
const service = require('./agent.service')

function clean(value, max = 200) {
  return String(value || '').trim().slice(0, max)
}

const agentController = {
  // POST /api/agent/trains   { from, to, date, class }
  trains: asyncHandler(async (req, res) => {
    const out = await service.runTool('search_trains', {
      from: clean(req.body?.from, 80),
      to: clean(req.body?.to, 80),
      date: clean(req.body?.date, 10),
      class: clean(req.body?.class, 4),
    })
    res.json(out)
  }),

  // POST /api/agent/flights  { from, to, date, return_date, passengers, cabin }
  flights: asyncHandler(async (req, res) => {
    const passengers = Number(req.body?.passengers)
    const out = await service.runTool('search_flights', {
      from: clean(req.body?.from, 60),
      to: clean(req.body?.to, 60),
      date: clean(req.body?.date, 10),
      return_date: clean(req.body?.return_date, 10) || undefined,
      passengers: Number.isFinite(passengers) ? passengers : 1,
      cabin: clean(req.body?.cabin, 20) || 'economy',
    })
    res.json(out)
  }),

  // POST /api/agent/hotels   { destination, check_in, check_out, guests, type }
  hotels: asyncHandler(async (req, res) => {
    const guests = Number(req.body?.guests)
    const out = await service.runTool('search_hotels', {
      destination: clean(req.body?.destination, 80),
      check_in: clean(req.body?.check_in, 10),
      check_out: clean(req.body?.check_out, 10),
      guests: Number.isFinite(guests) ? guests : 2,
      type: clean(req.body?.type, 20) || 'any',
    })
    res.json(out)
  }),

  // POST /api/agent/web      { query, topic, max_results }
  web: asyncHandler(async (req, res) => {
    const out = await service.runTool('web_search', {
      query: clean(req.body?.query, 240),
      topic: req.body?.topic === 'news' ? 'news' : 'general',
      max_results: Math.min(8, Math.max(3, Number(req.body?.max_results) || 5)),
    })
    res.json(out)
  }),

  // POST /api/agent/tatkal   { journey_date, class }
  tatkal: asyncHandler(async (req, res) => {
    const out = await service.runTool('tatkal_advisor', {
      journey_date: clean(req.body?.journey_date, 10),
      class: clean(req.body?.class, 4) || 'SL',
    })
    res.json(out)
  }),

  // POST /api/agent/ask      { message, history }
  ask: asyncHandler(async (req, res) => {
    const message = clean(req.body?.message, 1200)
    if (!message) throw ApiError.badRequest('message is required')
    const history = Array.isArray(req.body?.history) ? req.body.history : []
    const out = await service.ask({ message, history, user: req.user })
    res.json(out)
  }),
}

module.exports = agentController
