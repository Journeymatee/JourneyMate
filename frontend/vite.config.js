import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Stamp every build with a unique id so mobile users (and us) can confirm
// at a glance whether the device is running the latest JS or a stale cache.
// Render exposes RENDER_GIT_COMMIT during the build; locally we fall back
// to the wall-clock timestamp.
const BUILD_ID =
  process.env.VITE_BUILD_ID ||
  process.env.RENDER_GIT_COMMIT?.slice(0, 7) ||
  new Date().toISOString().replace(/\D/g, '').slice(0, 14)

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(BUILD_ID),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
