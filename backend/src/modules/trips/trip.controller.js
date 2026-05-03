'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./trip.service')
const preferencesRepo = require('./tripPreferences.repo')
const placeMusic = require('./placeMusic.service')
const placeShopping = require('./placeShopping.service')

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

  /**
   * Music suggestions tuned to a destination + (optional) tripType/vibe.
   * Anyone can call it — no auth needed (no user data, all public).
   *
   * Speed comes from the in-memory cache inside placeMusic.service (~1h per
   * (place, tripType, vibe) tuple). We deliberately bypass `res.json()` and
   * write the body with `res.end()` so Express never runs the ETag /
   * If-None-Match freshness check — every request gets a clean 200 + JSON,
   * which is much easier to debug in Postman/curl/DevTools.
   */
  music: asyncHandler(async (req, res) => {
    const place = String(req.query.place || '').trim()
    const tripType = req.query.tripType ? String(req.query.tripType).trim() : null
    const vibe = req.query.vibe ? String(req.query.vibe).trim() : null
    const out = await placeMusic.getMusicForPlace({ place, tripType, vibe })
    const body = JSON.stringify(out)
    res.status(200)
    res.set('Content-Type', 'application/json; charset=utf-8')
    res.set('Cache-Control', 'no-store')
    res.removeHeader('ETag')
    res.end(body)
  }),

  /**
   * Shopping suggestions for a destination — curated bazaars + malls +
   * boutiques, optionally enriched with live OpenStreetMap data for
   * uncurated places. Returns Google Maps search URLs as click-throughs
   * so the user always opens real-world maps with full venue data.
   *
   * Public — no auth needed (destination only, no user data). Bypasses
   * Express's freshness/ETag check so every request returns 200 + JSON.
   */
  shopping: asyncHandler(async (req, res) => {
    const place = String(req.query.place || '').trim()
    const out = await placeShopping.getShoppingForPlace({ place })
    const body = JSON.stringify(out)
    res.status(200)
    res.set('Content-Type', 'application/json; charset=utf-8')
    res.set('Cache-Control', 'no-store')
    res.removeHeader('ETag')
    res.end(body)
  }),
}

module.exports = tripController
