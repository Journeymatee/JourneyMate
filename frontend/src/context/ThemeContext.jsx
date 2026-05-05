import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { runMonkeyThemeWipe, isReducedMotion } from '../lib/themeWipe'

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

// Bumped from v1 → v2 when we switched the default from dark to light.
// The version bump effectively resets every existing visitor's stored
// preference, so they all start in the new light default and can opt
// back into dark via the toggle.
const STORAGE_KEY = 'jm:theme-v2'
const ThemeContext = createContext(null)

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredMode() {
  if (typeof window === 'undefined') return 'light'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* private mode / quota — ignore */
  }
  return 'light'
}

// Tracks the currently-running transition timer so rapid toggles
// (light → dark → light) don't leave the body without the helper
// class once the timeout fires for the older switch.
let themeTransitionTimer = null

/**
 * Briefly add a `theme-transitioning` class to <html> so the global
 * CSS rule fades background-color/color/border-color over ~220ms
 * instead of snapping. Removed once the longest transition finishes.
 */
function withSmoothTransition(fn) {
  if (typeof document === 'undefined') {
    fn()
    return
  }
  const html = document.documentElement
  html.classList.add('theme-transitioning')
  fn()
  if (themeTransitionTimer) clearTimeout(themeTransitionTimer)
  themeTransitionTimer = setTimeout(() => {
    html.classList.remove('theme-transitioning')
    themeTransitionTimer = null
  }, 280) // matches the longest transition (box-shadow 240ms) + buffer
}

/* Core mutation: flip <html> attributes/classes + meta theme-color. */
function commitTheme(resolved) {
  const html = document.documentElement
  html.setAttribute('data-theme', resolved)
  html.classList.toggle('dark', resolved === 'dark')
  html.style.colorScheme = resolved
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', resolved === 'dark' ? '#0a0a0f' : '#f8fafc')
}

/**
 * Public theme apply with a cartoon-monkey "poster rise" animation.
 *
 *   • initial: true       → no animation, just commit the theme.
 *   • reduced-motion user → no slide, just the gentle cross-fade we
 *                            already use elsewhere (220 ms).
 *   • everyone else       → a cartoon monkey rides a rising poster
 *                            from the bottom of the viewport, drops
 *                            off the new theme, then fades.
 *
 * The actual choreography lives in `lib/themeWipe.js`; this function
 * just decides which path to take and supplies the commit callback.
 */
function applyTheme(resolved, { initial = false } = {}) {
  if (typeof document === 'undefined') return

  if (initial) {
    commitTheme(resolved)
    return
  }

  if (isReducedMotion()) {
    withSmoothTransition(() => commitTheme(resolved))
    return
  }

  runMonkeyThemeWipe(resolved, () => commitTheme(resolved))
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

  // Track the last theme we *actually* applied. Animating when the
  // resolved value didn't change is what causes the monkey-wipe to
  // fire on page reloads (and on every StrictMode double-mount in
  // dev). By comparing against the previous applied value, we only
  // animate when the user genuinely flipped the mode.
  //
  // Initial value is `resolved` itself, so the first effect run sees
  // "no change" and falls through to the silent commit path.
  const lastAppliedRef = useRef(resolved)

  useEffect(() => {
    const changed = lastAppliedRef.current !== resolved
    applyTheme(resolved, { initial: !changed })
    lastAppliedRef.current = resolved
  }, [resolved])

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
