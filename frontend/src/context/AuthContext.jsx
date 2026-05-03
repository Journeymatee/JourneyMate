import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

// Auth endpoints need a bigger budget than the default 15 s axios timeout
// because Render free-tier dynos may be cold when the user hits Login.
// 35 s comfortably covers a full cold-boot + DB connect.
const AUTH_REQ_TIMEOUT = 35000

/**
 * Decides whether an /auth/me failure should sign the user out.
 *   • 401/403 → token is genuinely invalid → drop it
 *   • everything else (timeout, 5xx, network) → KEEP the token, the user
 *     stays logged in once the server comes back. This is critical on
 *     mobile / slow connections where a one-off timeout used to silently
 *     log everyone out on every page load.
 */
function shouldSignOut(err) {
  const s = err?.response?.status
  return s === 401 || s === 403
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('jm_token')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me', { timeout: AUTH_REQ_TIMEOUT })
      .then((res) => setUser(res.data.user))
      .catch((err) => {
        if (shouldSignOut(err)) {
          localStorage.removeItem('jm_token')
          setUser(null)
        }
        // Otherwise: keep the token. Next request will re-validate.
        // eslint-disable-next-line no-console
        else console.warn('[auth] /auth/me failed (transient):', err?.code || err?.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post(
      '/auth/login',
      { email, password },
      { timeout: AUTH_REQ_TIMEOUT }
    )
    localStorage.setItem('jm_token', data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload, { timeout: AUTH_REQ_TIMEOUT })
    localStorage.setItem('jm_token', data.token)
    setUser(data.user)
    return data.user
  }, [])

  const loginWithGoogle = useCallback(async (credential) => {
    const { data } = await api.post(
      '/auth/google',
      { credential },
      { timeout: AUTH_REQ_TIMEOUT }
    )
    localStorage.setItem('jm_token', data.token)
    setUser(data.user)
    return data.user
  }, [])

  const forgotPassword = useCallback(async (email, password) => {
    const { data } = await api.post(
      '/auth/forgot-password',
      { email, password },
      { timeout: AUTH_REQ_TIMEOUT }
    )
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('jm_token')
    setUser(null)
    // Also sign out from Google GIS if loaded
    if (window.google?.accounts?.id) {
      try { window.google.accounts.id.disableAutoSelect() } catch { /* ignore */ }
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, loginWithGoogle, forgotPassword, logout }),
    [user, loading, login, register, loginWithGoogle, forgotPassword, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
