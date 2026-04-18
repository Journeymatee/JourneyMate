'use strict'

const { pool } = require('../../config/db')

const authRepo = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, full_name, avatar_url, provider FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email]
    )
    return rows[0] || null
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, email, full_name, avatar_url, provider FROM users WHERE id = $1 LIMIT 1',
      [id]
    )
    return rows[0] || null
  },

  async findByGoogleId(googleId) {
    const { rows } = await pool.query(
      'SELECT id, email, full_name, avatar_url, provider FROM users WHERE google_id = $1 LIMIT 1',
      [googleId]
    )
    return rows[0] || null
  },

  async create({ email, passwordHash, name }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, provider)
       VALUES ($1, $2, $3, 'local')
       RETURNING id, email, full_name, avatar_url, provider`,
      [email, passwordHash, name]
    )
    return rows[0]
  },

  /** Find or create a user from a verified Google profile. */
  async findOrCreateByGoogle({ googleId, email, name, avatarUrl }) {
    // First try matching by google_id
    const byGoogleId = await this.findByGoogleId(googleId)
    if (byGoogleId) return byGoogleId

    // Then try matching by email (link existing account)
    const byEmail = await this.findByEmail(email)
    if (byEmail) {
      const { rows } = await pool.query(
        `UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2),
         provider = CASE WHEN provider = 'local' THEN 'google' ELSE provider END,
         updated_at = NOW()
         WHERE id = $3
         RETURNING id, email, full_name, avatar_url, provider`,
        [googleId, avatarUrl, byEmail.id]
      )
      return rows[0]
    }

    // Create brand new Google user
    const { rows } = await pool.query(
      `INSERT INTO users (email, full_name, google_id, avatar_url, provider, password_hash)
       VALUES ($1, $2, $3, $4, 'google', NULL)
       RETURNING id, email, full_name, avatar_url, provider`,
      [email, name || 'Traveler', googleId, avatarUrl]
    )
    return rows[0]
  },

  async count() {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM users')
    return rows[0].n
  },
}

module.exports = authRepo
