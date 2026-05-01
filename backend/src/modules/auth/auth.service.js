'use strict'

const bcrypt = require('bcrypt')
const { OAuth2Client } = require('google-auth-library')
const ApiError = require('../../lib/ApiError')
const token = require('../../lib/token')
const repo = require('./auth.repo')
const env = require('../../config/env')
const { isDisposableDomain, FAKE_DOMAINS } = require('../../lib/emailValidator')

const BCRYPT_ROUNDS = 10

let googleClient = null
function getGoogleClient() {
  if (!env.GOOGLE_CLIENT_ID) return null
  if (!googleClient) googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)
  return googleClient
}

function isAdminEmail(email) {
  if (!email) return false
  return env.ADMIN_EMAILS.includes(String(email).trim().toLowerCase())
}

function toPublicUser(row) {
  return {
    id:        row.id,
    email:     row.email,
    name:      row.full_name || row.name,
    avatarUrl: row.avatar_url || null,
    provider:  row.provider || 'local',
    isAdmin:   isAdminEmail(row.email),
  }
}

function issueToken(user) {
  return token.sign({
    sub:   user.id,
    email: user.email,
    name:  user.full_name || user.name,
  })
}

const authService = {
  async login(email, password) {
    const row = await repo.findByEmail(email)
    if (!row) throw ApiError.unauthorized('Invalid email or password')
    if (!row.password_hash) throw ApiError.unauthorized('This account uses Google Sign-In. Please use "Continue with Google".')
    const ok = await bcrypt.compare(password, row.password_hash)
    if (!ok) throw ApiError.unauthorized('Invalid email or password')
    return { token: issueToken(row), user: toPublicUser(row) }
  },

  async register({ email, password, name }) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const row = await repo.create({ email, passwordHash, name: name || 'Traveler' })
    return { token: issueToken(row), user: toPublicUser(row) }
  },

  async forgotPassword(email, password) {
    const row = await repo.findByEmail(email)
    if (!row) {
      // Do not reveal whether an account exists.
      return { message: 'If this email is registered, the password has been updated.' }
    }
    if (!row.password_hash) {
      throw ApiError.badRequest('This account uses Google Sign-In. Please use "Continue with Google".')
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    await repo.updatePasswordByEmail(email, passwordHash)
    return { message: 'Password updated successfully. You can sign in now.' }
  },

  async me(userId) {
    const row = await repo.findById(userId)
    if (!row) throw ApiError.unauthorized()
    return { user: toPublicUser(row) }
  },

  async googleAuth(credential) {
    const client = getGoogleClient()
    if (!client) throw ApiError.badRequest('Google Sign-In is not configured on this server. Please set GOOGLE_CLIENT_ID in .env')

    let payload
    try {
      const ticket = await client.verifyIdToken({
        idToken:  credential,
        audience: env.GOOGLE_CLIENT_ID,
      })
      payload = ticket.getPayload()
    } catch {
      throw ApiError.unauthorized('Invalid Google credential. Please try signing in again.')
    }

    const { sub: googleId, email, name, picture: avatarUrl, email_verified: emailVerified } = payload
    if (!email) throw ApiError.badRequest('Google account has no email address')
    if (emailVerified === false) {
      throw ApiError.unauthorized('Your Google account email is not verified. Please verify it with Google first.')
    }

    const lower = String(email).trim().toLowerCase()
    const domain = lower.split('@')[1] || ''
    if (FAKE_DOMAINS.has(domain) || isDisposableDomain(domain)) {
      throw ApiError.badRequest('This email domain is not allowed. Please sign in with a real address.')
    }

    const row = await repo.findOrCreateByGoogle({ googleId, email: lower, name, avatarUrl })
    return { token: issueToken(row), user: toPublicUser(row) }
  },

  async stats() {
    const userCount = await repo.count()
    return { userCount, routeCount: 18 }
  },
}

module.exports = authService
