'use strict'

const ANON_MAX = 64
const ANON_MIN = 8

/**
 * Logged-in users: userId only. Guests: require stable client_id (from localStorage).
 */
function getExperienceIdentity(req) {
  const userId = req.user?.id != null ? Number(req.user.id) : null
  if (userId) return { userId, anonKey: null }
  const raw = (req.body && req.body.client_id) || req.get('X-Experience-Identity') || ''
  const s = String(raw).trim()
  if (s.length < ANON_MIN || s.length > ANON_MAX) return null
  return { userId: null, anonKey: s }
}

module.exports = { getExperienceIdentity, ANON_MIN, ANON_MAX }
