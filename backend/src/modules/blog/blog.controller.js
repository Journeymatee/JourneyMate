'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const ApiError = require('../../lib/ApiError')
const repo = require('./blog.repo')
const { getExperienceIdentity, ANON_MIN, ANON_MAX } = require('./experienceIdentity')

const REACTIONS = new Set(['👍', '❤️', '😂', '🎉', '🙏', '✈️'])

function viewerAnonKeyFromQuery(req) {
  if (req.user?.id) return null
  const s = String(req.query?.client_id || '').trim()
  if (s.length < ANON_MIN || s.length > ANON_MAX) return null
  return s
}

const blogController = {
  list: asyncHandler(async (_req, res) => {
    const posts = await repo.list()
    res.json({ posts })
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const post = await repo.getBySlug(req.params.slug)
    if (!post) throw ApiError.notFound('Post not found')
    res.json({ post })
  }),

  listExperiences: asyncHandler(async (req, res) => {
    const userId = req.user?.id != null ? Number(req.user.id) : null
    const anonKey = userId ? null : viewerAnonKeyFromQuery(req)
    const experiences = await repo.listExperiences({ userId, anonKey, includeComments: true })
    res.json({ experiences })
  }),

  createExperience: asyncHandler(async (req, res) => {
    const { display_name: displayName, title, body, destination, visit_months: visitMonths } = req.body || {}
    const userId = req.user ? req.user.id : null
    const visit =
      visitMonths != null && String(visitMonths).trim() ? String(visitMonths).trim().slice(0, 200) : null
    const row = await repo.createExperience({
      userId,
      displayName: String(displayName).trim(),
      title: String(title).trim(),
      body: String(body).trim(),
      destination: destination != null && String(destination).trim() ? String(destination).trim() : null,
      visitMonths: visit,
    })
    res.status(201).json({ experience: row })
  }),

  toggleExperienceLike: asyncHandler(async (req, res) => {
    const eid = await repo.experienceExistsApproved(req.params.id)
    if (!eid) throw ApiError.notFound('Experience not found')
    const idy = getExperienceIdentity(req)
    if (!idy) {
      throw ApiError.badRequest(
        'Sign in or pass client_id (8–64 chars) in the JSON body for public likes'
      )
    }
    const result = await repo.toggleLike({
      experienceId: eid,
      userId: idy.userId,
      anonKey: idy.anonKey,
    })
    if (!result) {
      throw ApiError.badRequest('Sign in or pass client_id in the request body for guests')
    }
    res.json({ ...result, experience_id: eid })
  }),

  setExperienceReaction: asyncHandler(async (req, res) => {
    const eid = await repo.experienceExistsApproved(req.params.id)
    if (!eid) throw ApiError.notFound('Experience not found')
    const idy = getExperienceIdentity(req)
    if (!idy) {
      throw ApiError.badRequest(
        'Sign in or pass client_id in the body for public reactions'
      )
    }
    const raw = req.body && req.body.emoji != null ? String(req.body.emoji) : ''
    const emoji = raw === '' || raw === 'null' || raw === 'remove' ? null : raw
    if (emoji && !REACTIONS.has(emoji)) {
      throw ApiError.badRequest('Use one of the provided reaction emojis', {
        allowed: [...REACTIONS],
      })
    }
    const result = await repo.setReaction({
      experienceId: eid,
      userId: idy.userId,
      anonKey: idy.anonKey,
      emoji: emoji || null,
    })
    if (!result) {
      throw ApiError.badRequest('Sign in or pass client_id for guest reactions')
    }
    res.json({ ...result, experience_id: eid })
  }),

  addExperienceComment: asyncHandler(async (req, res) => {
    const eid = await repo.experienceExistsApproved(req.params.id)
    if (!eid) throw ApiError.notFound('Experience not found')
    const { body, display_name: displayName, client_id: clientId } = req.body || {}
    const text = body != null ? String(body).trim() : ''
    if (text.length < 1 || text.length > 2000) {
      throw ApiError.badRequest('Comment must be 1–2000 characters')
    }
    if (req.user) {
      const name = (displayName && String(displayName).trim()) || req.user.name || 'Traveler'
      if (name.length < 1 || name.length > 120) {
        throw ApiError.badRequest('Name must be 1–120 characters')
      }
      const row = await repo.addComment({
        experienceId: eid,
        userId: Number(req.user.id),
        anonKey: null,
        displayName: name,
        body: text,
      })
      return res.status(201).json({ comment: row })
    }
    const anon = clientId && String(clientId).trim()
    if (!anon || anon.length < ANON_MIN || anon.length > ANON_MAX) {
      throw ApiError.badRequest('Sign in, or pass client_id (8–64 characters) in the request body')
    }
    const name = String(displayName || '').trim()
    if (name.length < 2 || name.length > 120) {
      throw ApiError.badRequest('Name must be 2–120 characters for guest comments')
    }
    const row = await repo.addComment({
      experienceId: eid,
      userId: null,
      anonKey: anon,
      displayName: name,
      body: text,
    })
    res.status(201).json({ comment: row })
  }),

  listExperienceComments: asyncHandler(async (req, res) => {
    const eid = await repo.experienceExistsApproved(req.params.id)
    if (!eid) throw ApiError.notFound('Experience not found')
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200))
    const comments = await repo.listCommentsForExperience(eid, { limit })
    res.json({ comments })
  }),
}

module.exports = blogController
