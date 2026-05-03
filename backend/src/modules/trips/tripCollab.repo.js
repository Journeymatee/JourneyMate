'use strict'

/**
 * Repo for trip collaboration: comments + Silver/Gold votes.
 *
 * One small file because the two tables share access patterns and always
 * load together when rendering a shared-trip discussion panel.
 */

const { pool } = require('../../config/db')

const COMMENT_MAX = 2000

function trim(s, max) {
  const v = String(s == null ? '' : s).trim()
  if (!v) return ''
  return v.length > max ? v.slice(0, max) : v
}

function commentRowToDto(row) {
  return {
    id:         Number(row.id),
    body:       row.body,
    authorName: row.author_name || 'Traveler',
    isMine:     Boolean(row._is_mine),
    createdAt:  row.created_at,
  }
}

async function listComments(savedTripId, viewerId = null) {
  const sql = `
    SELECT id, user_id, author_name, body, created_at,
           (user_id IS NOT NULL AND user_id = $2) AS _is_mine
      FROM trip_comments
     WHERE saved_trip_id = $1
     ORDER BY created_at DESC
     LIMIT 200
  `
  const { rows } = await pool.query(sql, [Number(savedTripId), viewerId == null ? null : Number(viewerId)])
  return rows.map(commentRowToDto)
}

async function createComment(savedTripId, user, bodyRaw) {
  const body = trim(bodyRaw, COMMENT_MAX)
  if (!body) {
    const e = new Error('Comment body is empty')
    e.code = 'EMPTY_BODY'
    throw e
  }
  const authorName = trim(user?.name || user?.email || 'Traveler', 120) || 'Traveler'
  const sql = `
    INSERT INTO trip_comments (saved_trip_id, user_id, author_name, body)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, author_name, body, created_at,
              (user_id IS NOT NULL AND user_id = $2) AS _is_mine
  `
  const { rows } = await pool.query(sql, [Number(savedTripId), Number(user.id), authorName, body])
  return commentRowToDto(rows[0])
}

async function deleteComment(savedTripId, viewerId, id) {
  const { rowCount } = await pool.query(
    `DELETE FROM trip_comments
       WHERE id = $1 AND saved_trip_id = $2 AND user_id = $3`,
    [Number(id), Number(savedTripId), Number(viewerId)]
  )
  return rowCount > 0
}

async function getVoteSummary(savedTripId, viewerId = null) {
  const counts = await pool.query(
    `SELECT choice, COUNT(*)::int AS n
       FROM trip_votes
      WHERE saved_trip_id = $1
      GROUP BY choice`,
    [Number(savedTripId)]
  )
  const result = { silver: 0, gold: 0, total: 0, mine: null }
  for (const row of counts.rows) {
    if (row.choice === 'silver' || row.choice === 'gold') {
      result[row.choice] = Number(row.n)
      result.total += Number(row.n)
    }
  }
  if (viewerId != null) {
    const me = await pool.query(
      `SELECT choice FROM trip_votes
        WHERE saved_trip_id = $1 AND user_id = $2 LIMIT 1`,
      [Number(savedTripId), Number(viewerId)]
    )
    if (me.rows[0]) result.mine = me.rows[0].choice
  }
  return result
}

async function setVote(savedTripId, userId, choice) {
  if (choice !== 'silver' && choice !== 'gold') {
    const e = new Error('Vote must be "silver" or "gold"')
    e.code = 'BAD_CHOICE'
    throw e
  }
  await pool.query(
    `INSERT INTO trip_votes (saved_trip_id, user_id, choice)
       VALUES ($1, $2, $3)
       ON CONFLICT (saved_trip_id, user_id) DO UPDATE
         SET choice = EXCLUDED.choice, updated_at = NOW()`,
    [Number(savedTripId), Number(userId), choice]
  )
  return getVoteSummary(savedTripId, userId)
}

async function clearVote(savedTripId, userId) {
  await pool.query(
    `DELETE FROM trip_votes WHERE saved_trip_id = $1 AND user_id = $2`,
    [Number(savedTripId), Number(userId)]
  )
  return getVoteSummary(savedTripId, userId)
}

module.exports = {
  listComments,
  createComment,
  deleteComment,
  getVoteSummary,
  setVote,
  clearVote,
}
