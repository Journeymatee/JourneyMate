'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const ApiError = require('../../lib/ApiError')
const service = require('./booking.service')
const razorpay = require('./payment/razorpay')

const bookingController = {
  /* ---------- discovery (no booking row created) -------------- */

  inventory: asyncHandler(async (req, res) => {
    const { type, origin, destination, travelDate, checkIn } = req.body || {}
    const items = await service.fetchInventory({
      type, origin, destination, travelDate, checkIn,
    })
    res.json({ count: items.length, items })
  }),

  quote: asyncHandler(async (req, res) => {
    const { type, offer, classCode, passengerCount, nights } = req.body || {}
    if (!offer) throw ApiError.badRequest('offer is required')
    const quote = await service.priceQuote({
      type, inventoryItem: offer, classCode, passengerCount, nights,
    })
    res.json({ quote })
  }),

  seatMap: asyncHandler(async (req, res) => {
    const { type, offer, classCode } = req.body || {}
    if (!offer) throw ApiError.badRequest('offer is required')
    const map = await service.fetchSeatMap({
      type, inventoryItem: offer, classCode,
    })
    res.json({ map })
  }),

  /* ---------- booking lifecycle ------------------------------- */

  createDraft: asyncHandler(async (req, res) => {
    const result = await service.createDraft(req.user.id, req.body || {})
    res.status(201).json(result)
  }),

  verifyPayment: asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid booking id')
    const result = await service.verifyPayment(req.user.id, id, req.body || {})
    res.json(result)
  }),

  list: asyncHandler(async (req, res) => {
    const bookings = await service.listForUser(req.user.id)
    res.json({ count: bookings.length, bookings })
  }),

  getOne: asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid booking id')
    const booking = await service.getOne(req.user.id, id)
    if (!booking) throw ApiError.notFound('Booking not found')
    res.json({ booking })
  }),

  cancel: asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) throw ApiError.badRequest('Invalid booking id')
    const result = await service.cancel(req.user.id, id)
    res.json(result)
  }),

  /* ---------- helpers ----------------------------------------- */

  paymentMode: asyncHandler(async (_req, res) => {
    res.json({
      provider: 'razorpay',
      live:     razorpay.isLiveMode(),
      keyId:    razorpay.isLiveMode() ? require('../../config/env').RAZORPAY_KEY_ID : null,
    })
  }),

  /* ---------- legacy (kept for backwards-compat) -------------- */

  create: asyncHandler(async (req, res) => {
    const row = await service.create(req.user.id, req.body || {})
    res.status(201).json(row)
  }),
}

module.exports = bookingController
