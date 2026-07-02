'use strict'

const asyncHandler = require('../../lib/asyncHandler')
const service = require('./ai.service')

const aiController = {
  chat: asyncHandler(async (req, res) => {
    const message = String(req.body?.message || '').trim()
    const history = Array.isArray(req.body?.history) ? req.body.history : []
    const planState = req.body?.planState && typeof req.body.planState === 'object' ? req.body.planState : null
    const result = await service.chat({ message, history, planState, user: req.user })
    res.json(result)
  }),

  chatStream: asyncHandler(async (req, res) => {
    const message = String(req.body?.message || '').trim()
    const history = Array.isArray(req.body?.history) ? req.body.history : []
    const planState = req.body?.planState && typeof req.body.planState === 'object' ? req.body.planState : null

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()

    const stream = service.chatStream({ message, history, planState, user: req.user })
    for await (const event of stream) {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    }
    res.write('data: {"type":"end"}\n\n')
    res.end()
  }),
}

module.exports = aiController
