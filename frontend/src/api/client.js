import axios from 'axios'

// In development: uses Vite proxy (/api → localhost:8080)
// In production:  uses VITE_API_URL (e.g. https://journeymate-api.railway.app/api)
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

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
