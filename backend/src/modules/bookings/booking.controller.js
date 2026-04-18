'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./booking.service')

const bookingController = {
  create: asyncHandler(async (req, res) => {
    const row = await service.create(req.user.id, req.body || {})
    res.status(201).json(row)
  }),

  list: asyncHandler(async (req, res) => {
    const rows = await service.listForUser(req.user.id)
    res.json({ count: rows.length, bookings: rows })
  }),
}

module.exports = bookingController
