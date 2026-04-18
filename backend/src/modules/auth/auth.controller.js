'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./auth.service')

const authController = {
  login: asyncHandler(async (req, res) => {
    const email    = String(req.body?.email    || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    const result   = await service.login(email, password)
    res.json(result)
  }),

  register: asyncHandler(async (req, res) => {
    const email    = String(req.body?.email    || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    const name     = String(req.body?.name     || 'Traveler').trim() || 'Traveler'
    const result   = await service.register({ email, password, name })
    res.status(201).json(result)
  }),

  me: asyncHandler(async (req, res) => {
    const result = await service.me(req.user.id)
    res.json(result)
  }),

  /** POST /auth/google  { credential: <Google JWT> } */
  googleAuth: asyncHandler(async (req, res) => {
    const credential = String(req.body?.credential || '').trim()
    if (!credential) {
      return res.status(400).json({ error: { message: 'credential is required' } })
    }
    const result = await service.googleAuth(credential)
    res.json(result)
  }),

  /** GET /auth/stats — public, returns live user count */
  stats: asyncHandler(async (_req, res) => {
    const data = await service.stats()
    res.json(data)
  }),
}

module.exports = authController
