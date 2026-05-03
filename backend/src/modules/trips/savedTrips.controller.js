'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const ApiError = require('../../lib/ApiError')
const service = require('./savedTrips.service')

function parseId(raw) {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) throw ApiError.badRequest('Invalid id')
  return n
}

const savedTripsController = {
  list: asyncHandler(async (req, res) => {
    const items = await service.listForUser(req.user.id)
    res.json({ items })
  }),

  create: asyncHandler(async (req, res) => {
    const created = await service.createForUser(req.user.id, req.body || {})
    res.status(201).json({ item: created })
  }),

  get: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    const item = await service.getOwned(req.user.id, id)
    res.json({ item })
  }),

  patch: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    const item = await service.patch(req.user.id, id, req.body || {})
    res.json({ item })
  }),

  remove: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    await service.remove(req.user.id, id)
    res.status(204).end()
  }),

  rotateShareLink: asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    const item = await service.rotate(req.user.id, id)
    res.json({ item })
  }),

  // Public — no auth.
  getPublic: asyncHandler(async (req, res) => {
    const token = String(req.params.token || '').trim()
    if (!token) throw ApiError.badRequest('token required')
    const item = await service.getPublic(token)
    // Strip the owner id from the public response.
    const { ...rest } = item
    res.json({ item: rest, public: true })
  }),
}

module.exports = savedTripsController
