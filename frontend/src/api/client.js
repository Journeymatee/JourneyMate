import axios from 'axios'

/**
 * Dev: Vite proxy serves /api → backend.
 * Production (e.g. Vercel): you MUST set VITE_API_URL to the real API origin + /api
 * (e.g. https://your-api.vercel.app/api). Otherwise requests hit the static site and fail (Network Error).
 */
function apiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL
  if (raw != null && String(raw).trim() !== '') {
    const u = String(raw).trim().replace(/\/$/, '')
    try {
      const parsed = new URL(u)
      if (parsed.pathname === '/' || parsed.pathname === '') {
        return u.endsWith('/api') ? u : `${u}/api`
      }
    } catch {
      // ignore, fall through
    }
    return u
  }
  if (import.meta.env.DEV) return '/api'
  if (import.meta.env.PROD && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(
      '[JourneyMate] VITE_API_URL is not set. Add it in Vercel → Project → Settings → Environment Variables ' +
        '(value like https://YOUR-BACKEND-HOST/api), then redeploy the frontend.'
    )
  }
  return '/api'
}

const BASE_URL = apiBaseUrl()
export const API_BASE_URL = BASE_URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
