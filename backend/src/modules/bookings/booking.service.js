'use strict'

const { pool } = require('../../config/db')
const ApiError = require('../../lib/ApiError')

const bookingService = {
  async create(userId, payload) {
    const { origin, destination, plan, price_inr, travel_date, extras } = payload
    if (!origin || !destination) throw ApiError.badRequest('origin and destination required')
    if (!['silver', 'gold'].includes(plan)) throw ApiError.badRequest('plan must be silver or gold')
    if (!Number.isFinite(Number(price_inr)) || Number(price_inr) <= 0) throw ApiError.badRequest('price_inr must be positive')

    const { rows } = await pool.query(
      `INSERT INTO bookings (user_id, origin, destination, plan, price_inr, travel_date, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING id, origin, destination, plan, price_inr, travel_date, status, created_at`,
      [userId, origin, destination, plan, Math.round(Number(price_inr)), travel_date || null, JSON.stringify(extras || {})]
    )
    return rows[0]
  },

  async listForUser(userId) {
    const { rows } = await pool.query(
      `SELECT id, origin, destination, plan, price_inr, travel_date, status, created_at
       FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [userId]
    )
    return rows
  },
}

module.exports = bookingService
