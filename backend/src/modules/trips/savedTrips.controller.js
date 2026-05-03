'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const ApiError = require('../../lib/ApiError')
const service = require('./savedTrips.service')
const collabRepo = require('./tripCollab.repo')
const repo = require('./savedTrips.repo')

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

  /* ───────────────────── Collaboration: comments + votes ───────────────────── */

  // Anyone with the share token can list comments. Auth is optional — the
  // viewer's identity (if any) is used to mark comments as "mine".
  listComments: asyncHandler(async (req, res) => {
    const trip = await resolveTripByToken(req.params.token)
    const items = await collabRepo.listComments(trip.id, req.user?.id ?? null)
    res.json({ items })
  }),

  // Auth required.
  createComment: asyncHandler(async (req, res) => {
    if (!req.user?.id) throw ApiError.unauthorized('Sign in to comment')
    const trip = await resolveTripByToken(req.params.token)
    try {
      const item = await collabRepo.createComment(trip.id, req.user, req.body?.body)
      res.status(201).json({ item })
    } catch (err) {
      if (err.code === 'EMPTY_BODY') throw ApiError.badRequest('Comment body is empty')
      throw err
    }
  }),

  deleteComment: asyncHandler(async (req, res) => {
    if (!req.user?.id) throw ApiError.unauthorized('Sign in to delete')
    const trip = await resolveTripByToken(req.params.token)
    const ok = await collabRepo.deleteComment(trip.id, req.user.id, req.params.id)
    if (!ok) throw ApiError.notFound('Comment not found')
    res.status(204).end()
  }),

  // Anyone with the share token can read vote totals. Anonymous viewers
  // simply don't get a "mine" field.
  getVotes: asyncHandler(async (req, res) => {
    const trip = await resolveTripByToken(req.params.token)
    const summary = await collabRepo.getVoteSummary(trip.id, req.user?.id ?? null)
    res.json({ summary })
  }),

  vote: asyncHandler(async (req, res) => {
    if (!req.user?.id) throw ApiError.unauthorized('Sign in to vote')
    const trip = await resolveTripByToken(req.params.token)
    const choice = String(req.body?.choice || '').trim().toLowerCase()
    try {
      const summary = await collabRepo.setVote(trip.id, req.user.id, choice)
      res.json({ summary })
    } catch (err) {
      if (err.code === 'BAD_CHOICE') throw ApiError.badRequest('choice must be "silver" or "gold"')
      throw err
    }
  }),

  clearVote: asyncHandler(async (req, res) => {
    if (!req.user?.id) throw ApiError.unauthorized('Sign in to vote')
    const trip = await resolveTripByToken(req.params.token)
    const summary = await collabRepo.clearVote(trip.id, req.user.id)
    res.json({ summary })
  }),
}

async function resolveTripByToken(rawToken) {
  const token = String(rawToken || '').trim()
  if (!token) throw ApiError.badRequest('token required')
  const trip = await repo.getByShareToken(token)
  if (!trip) throw ApiError.notFound('This shared trip link is no longer available')
  return trip
}

module.exports = savedTripsController
