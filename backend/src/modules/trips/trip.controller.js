'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./trip.service')
const preferencesRepo = require('./tripPreferences.repo')

const tripController = {
  search: asyncHandler(async (req, res) => {
    const from = String(req.query.from || '').trim()
    const to = String(req.query.to || '').trim()
    const days = req.query.days
    const tripType = req.query.tripType
    const vibes = req.query.vibes
    const trip = await service.search(from, to, { days, tripType, vibes })

    // Best-effort: persist this user's last preferences so the next visit
    // prefills the picker. Failures here MUST NOT break the search response.
    if (req.user?.id) {
      preferencesRepo
        .upsert(req.user.id, {
          tripType:  trip.tripType,
          vibes:     trip.vibes,
          lastFrom:  from,
          lastTo:    to,
          lastDays:  trip.requestedDays,
        })
        .catch(() => {})
    }

    res.json(trip)
  }),

  preferences: asyncHandler(async (req, res) => {
    if (!req.user?.id) return res.json({ preferences: null })
    const row = await preferencesRepo.getForUser(req.user.id).catch(() => null)
    res.json({ preferences: row })
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
