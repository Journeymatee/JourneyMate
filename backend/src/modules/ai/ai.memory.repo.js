'use strict'

const { pool } = require('../../config/db')

async function getRecentMessages(userId, limit = 20) {
  const capped = Math.min(Math.max(Number(limit) || 20, 1), 50)
  const q = `
    SELECT role, content
    FROM ai_chat_messages
    WHERE user_id = $1
    ORDER BY id DESC
    LIMIT $2
  `
  const r = await pool.query(q, [userId, capped])
  return r.rows.reverse().map((row) => ({
    role: row.role === 'assistant' ? 'assistant' : 'user',
    content: String(row.content || ''),
  }))
}

async function saveMessage(userId, role, content) {
  const q = `
    INSERT INTO ai_chat_messages (user_id, role, content)
    VALUES ($1, $2, $3)
  `
  await pool.query(q, [userId, role, content])
}

module.exports = {
  getRecentMessages,
  saveMessage,
}
