'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./contact.service')

const contactController = {
  submit: asyncHandler(async (req, res) => {
    const meta = {
      ip: req.ip,
      userAgent: String(req.get?.('user-agent') || '').slice(0, 240),
    }
    const result = await service.submit({
      name: req.body?.name,
      email: req.body?.email,
      topic: req.body?.topic,
      message: req.body?.message,
      meta,
    })
    res.json(result)
  }),
}

module.exports = contactController
