'use strict'

const { pool } = require('../../config/db')

const blogRepo = {
  async list() {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        slug,
        title,
        excerpt,
        category,
        read_time_mins,
        author,
        emoji,
        tags,
        is_featured,
        published_at
      FROM blog_posts
      WHERE is_published = true
      ORDER BY is_featured DESC, published_at DESC, id DESC
    `
    )
    return rows
  },

  async getBySlug(slug) {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        slug,
        title,
        excerpt,
        body,
        category,
        read_time_mins,
        author,
        emoji,
        tags,
        is_featured,
        published_at
      FROM blog_posts
      WHERE is_published = true AND slug = $1
      LIMIT 1
    `,
      [String(slug || '')]
    )
    return rows[0] || null
  },

  async listExperiences({ userId, anonKey, includeComments = true, commentsPerExp = 12 } = {}) {
    const { rows: experiences } = await pool.query(
      `
      SELECT
        id,
        user_id,
        display_name,
        title,
        body,
        destination,
        visit_months,
        created_at
      FROM blog_experiences
      WHERE is_approved = true
      ORDER BY created_at DESC
      LIMIT 100
    `
    )
    if (experiences.length === 0) return []

    const ids = experiences.map((e) => e.id)

    const { rows: likeCountRows } = await pool.query(
      `
      SELECT experience_id, COUNT(*)::int AS c
      FROM blog_experience_likes
      WHERE experience_id = ANY($1::int[])
      GROUP BY experience_id
    `,
      [ids]
    )
    const { rows: coRows } = await pool.query(
      `
      SELECT experience_id, COUNT(*)::int AS c
      FROM blog_experience_comments
      WHERE experience_id = ANY($1::int[])
      GROUP BY experience_id
    `,
      [ids]
    )
    const { rows: reRows } = await pool.query(
      `
      SELECT experience_id, emoji, COUNT(*)::int AS c
      FROM blog_experience_reactions
      WHERE experience_id = ANY($1::int[])
      GROUP BY experience_id, emoji
    `,
      [ids]
    )

    const likeMap = new Map(likeCountRows.map((r) => [r.experience_id, r.c]))
    const comMap = new Map(coRows.map((r) => [r.experience_id, r.c]))
    const reactionMap = new Map() // id -> { emoji: count }
    for (const r of reRows) {
      if (!reactionMap.has(r.experience_id)) reactionMap.set(r.experience_id, {})
      reactionMap.get(r.experience_id)[r.emoji] = r.c
    }

    let viewerLiked = new Set()
    let viewerEmoji = new Map() // id -> emoji
    if (userId != null) {
      const { rows: vl } = await pool.query(
        `SELECT experience_id FROM blog_experience_likes WHERE experience_id = ANY($1) AND user_id = $2`,
        [ids, userId]
      )
      viewerLiked = new Set(vl.map((r) => r.experience_id))
      const { rows: ve } = await pool.query(
        `SELECT experience_id, emoji FROM blog_experience_reactions WHERE experience_id = ANY($1) AND user_id = $2`,
        [ids, userId]
      )
      viewerEmoji = new Map(ve.map((r) => [r.experience_id, r.emoji]))
    } else if (anonKey) {
      const { rows: vl } = await pool.query(
        `SELECT experience_id FROM blog_experience_likes WHERE experience_id = ANY($1) AND anon_key = $2`,
        [ids, anonKey]
      )
      viewerLiked = new Set(vl.map((r) => r.experience_id))
      const { rows: ve } = await pool.query(
        `SELECT experience_id, emoji FROM blog_experience_reactions WHERE experience_id = ANY($1) AND anon_key = $2`,
        [ids, anonKey]
      )
      viewerEmoji = new Map(ve.map((r) => [r.experience_id, r.emoji]))
    }

    let commentBuckets = new Map() // id -> [comments] newest first, capped
    if (includeComments) {
      const { rows: allCo } = await pool.query(
        `
        SELECT id, experience_id, user_id, display_name, body, created_at
        FROM blog_experience_comments
        WHERE experience_id = ANY($1)
        ORDER BY experience_id, created_at DESC
      `,
        [ids]
      )
      for (const c of allCo) {
        if (!commentBuckets.has(c.experience_id)) commentBuckets.set(c.experience_id, [])
        const arr = commentBuckets.get(c.experience_id)
        if (arr.length < commentsPerExp) arr.push(c)
      }
    }

    return experiences.map((e) => {
      const reaction_counts = reactionMap.get(e.id) || {}
      return {
        ...e,
        like_count: likeMap.get(e.id) || 0,
        comment_count: comMap.get(e.id) || 0,
        reaction_counts,
        viewer_liked: viewerLiked.has(e.id),
        viewer_emoji: viewerEmoji.get(e.id) || null,
        recent_comments: commentBuckets.get(e.id) || [],
      }
    })
  },

  async createExperience({ userId, displayName, title, body, destination, visitMonths }) {
    const { rows } = await pool.query(
      `
      INSERT INTO blog_experiences (user_id, display_name, title, body, destination, visit_months)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        user_id,
        display_name,
        title,
        body,
        destination,
        visit_months,
        created_at
    `,
      [userId, displayName, title, body, destination || null, visitMonths || null]
    )
    return rows[0]
  },

  async experienceExistsApproved(id) {
    const n = parseInt(String(id), 10)
    if (Number.isNaN(n) || n < 1) return null
    const { rowCount } = await pool.query(
      'SELECT 1 FROM blog_experiences WHERE id = $1 AND is_approved = true',
      [n]
    )
    return rowCount ? n : null
  },

  async getLikeCount(experienceId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS c FROM blog_experience_likes WHERE experience_id = $1',
      [experienceId]
    )
    return rows[0]?.c || 0
  },

  async toggleLike({ experienceId, userId, anonKey }) {
    if (userId) {
      const d = await pool.query(
        'DELETE FROM blog_experience_likes WHERE experience_id = $1 AND user_id = $2 RETURNING id',
        [experienceId, userId]
      )
      if (d.rowCount) {
        return { liked: false, like_count: await this.getLikeCount(experienceId) }
      }
      await pool.query('INSERT INTO blog_experience_likes (experience_id, user_id) VALUES ($1, $2)', [
        experienceId,
        userId,
      ])
      return { liked: true, like_count: await this.getLikeCount(experienceId) }
    }
    if (anonKey) {
      const d = await pool.query(
        'DELETE FROM blog_experience_likes WHERE experience_id = $1 AND anon_key = $2 RETURNING id',
        [experienceId, anonKey]
      )
      if (d.rowCount) {
        return { liked: false, like_count: await this.getLikeCount(experienceId) }
      }
      await pool.query('INSERT INTO blog_experience_likes (experience_id, anon_key) VALUES ($1, $2)', [experienceId, anonKey])
      return { liked: true, like_count: await this.getLikeCount(experienceId) }
    }
    return null
  },

  /**
   * Set reaction (one per identity). Pass emoji null/empty to clear.
   */
  async setReaction({ experienceId, userId, anonKey, emoji }) {
    if (userId) {
      await pool.query('DELETE FROM blog_experience_reactions WHERE experience_id = $1 AND user_id = $2', [
        experienceId,
        userId,
      ])
    } else if (anonKey) {
      await pool.query('DELETE FROM blog_experience_reactions WHERE experience_id = $1 AND anon_key = $2', [
        experienceId,
        anonKey,
      ])
    } else {
      return null
    }
    if (!emoji) {
      return {
        reaction_counts: await this._reactionBreakdown(experienceId),
        viewer_emoji: null,
      }
    }
    if (userId) {
      await pool.query(
        'INSERT INTO blog_experience_reactions (experience_id, user_id, emoji) VALUES ($1, $2, $3)',
        [experienceId, userId, emoji]
      )
    } else {
      await pool.query(
        'INSERT INTO blog_experience_reactions (experience_id, anon_key, emoji) VALUES ($1, $2, $3)',
        [experienceId, anonKey, emoji]
      )
    }
    return {
      reaction_counts: await this._reactionBreakdown(experienceId),
      viewer_emoji: emoji,
    }
  },

  async _reactionBreakdown(experienceId) {
    const { rows } = await pool.query(
      'SELECT emoji, COUNT(*)::int AS c FROM blog_experience_reactions WHERE experience_id = $1 GROUP BY emoji',
      [experienceId]
    )
    const o = {}
    for (const r of rows) o[r.emoji] = r.c
    return o
  },

  async addComment({ experienceId, userId, anonKey, displayName, body }) {
    const { rows } = await pool.query(
      `
      INSERT INTO blog_experience_comments (experience_id, user_id, anon_key, display_name, body)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, experience_id, user_id, display_name, body, created_at
    `,
      [experienceId, userId, anonKey || null, displayName, body]
    )
    return rows[0]
  },

  async listCommentsForExperience(experienceId, { limit = 200 } = {}) {
    const { rows } = await pool.query(
      `
      SELECT id, experience_id, user_id, display_name, body, created_at
      FROM blog_experience_comments
      WHERE experience_id = $1
      ORDER BY created_at ASC
      LIMIT $2
    `,
      [experienceId, limit]
    )
    return rows
  },
}

module.exports = blogRepo
