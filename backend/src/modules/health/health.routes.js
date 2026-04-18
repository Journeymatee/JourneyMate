'use strict'

const express = require('express')
const { pool } = require('../../config/db')
const asyncHandler = require('../../lib/asyncHandler')

const router = express.Router()

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    let db = false
    try { await pool.query('SELECT 1'); db = true } catch { /* noop */ }
    res.status(db ? 200 : 503).json({
      ok: db,
      service: 'journeymate-api',
      version: require('../../../package.json').version,
      database: db,
      time: new Date().toISOString(),
    })
  })
)

module.exports = router
