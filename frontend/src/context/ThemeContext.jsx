import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

/**
 * ThemeContext — owns the user's bright/dark preference.
 *
 *  • mode: 'light' | 'dark' | 'system'  (what the user explicitly picked)
 *  • resolved: 'light' | 'dark'         (what is actually applied)
 *
 * The resolved theme is reflected on `<html>` via:
 *   - `data-theme="light" | "dark"`   ← targets our CSS-variable overrides
 *   - `class="dark"` (added when resolved is dark) ← lets us use Tailwind's
 *     `dark:` modifier for any future component.
 *
 * The choice is persisted to localStorage so it survives reloads.
 */

const STORAGE_KEY = 'jm:theme-v1'
const ThemeContext = createContext(null)

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredMode() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* private mode / quota — ignore */
  }
  return 'dark'
}

function applyTheme(resolved) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.setAttribute('data-theme', resolved)
  html.classList.toggle('dark', resolved === 'dark')
  html.style.colorScheme = resolved
  // Update the <meta name="theme-color"> for nicer mobile chrome.
  const metaSelector = 'meta[name="theme-color"]'
  let meta = document.querySelector(metaSelector)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', resolved === 'dark' ? '#0a0a0f' : '#fafaf7')
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => readStoredMode())
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme())

  // Listen for OS theme changes when the user picked "system".
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener?.('change', onChange) ?? mq.addListener?.(onChange)
    return () => {
      mq.removeEventListener?.('change', onChange) ?? mq.removeListener?.(onChange)
    }
  }, [])

  const resolved = mode === 'system' ? systemTheme : mode

  // Apply on mount and whenever the resolved theme changes.
  useEffect(() => { applyTheme(resolved) }, [resolved])

  // Persist whenever the user explicitly picks something.
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, mode) } catch { /* ignore */ }
  }, [mode])

  const setThemeMode = useCallback((next) => {
    if (next === 'light' || next === 'dark' || next === 'system') setMode(next)
  }, [])

  const toggle = useCallback(() => {
    setMode((current) => {
      const currentResolved = current === 'system' ? getSystemTheme() : current
      return currentResolved === 'dark' ? 'light' : 'dark'
    })
  }, [])

  const value = {
    mode,
    resolved,
    isDark: resolved === 'dark',
    isLight: resolved === 'light',
    setMode: setThemeMode,
    toggle,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>')
  }
  return ctx
}
