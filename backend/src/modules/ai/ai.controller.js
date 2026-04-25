'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./ai.service')

const aiController = {
  chat: asyncHandler(async (req, res) => {
    const message = String(req.body?.message || '').trim()
    const history = Array.isArray(req.body?.history) ? req.body.history : []
    const result = await service.chat({ message, history, user: req.user })
    res.json(result)
  }),

  chatStream: asyncHandler(async (req, res) => {
    const message = String(req.body?.message || '').trim()
    const history = Array.isArray(req.body?.history) ? req.body.history : []

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    const stream = service.chatStream({ message, history, user: req.user })
    for await (const event of stream) {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    }
    res.write('data: {"type":"end"}\n\n')
    res.end()
  }),
}

module.exports = aiController
