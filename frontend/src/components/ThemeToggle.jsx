import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * ThemeToggle
 *
 *   variant="icon"     — single round 36×36 button (navbar). Click cycles
 *                        between light and dark; long press is not used.
 *   variant="segment"  — three-pill segmented control (Light · System · Dark)
 *                        suitable for menus and settings panels.
 */

const SEGMENTS = [
  { id: 'light',  Icon: Sun,     label: 'Light' },
  { id: 'system', Icon: Monitor, label: 'System' },
  { id: 'dark',   Icon: Moon,    label: 'Dark' },
]

export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { mode, resolved, setMode, toggle } = useTheme()

  if (variant === 'segment') {
    return (
      <div
        role="radiogroup"
        aria-label="Theme"
        className={`inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/5 ${className}`}
      >
        {SEGMENTS.map(({ id, Icon, label }) => {
          const active = mode === id
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(id)}
              title={`${label} mode`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // Default icon variant: single round button.
  const isDark = resolved === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all overflow-hidden ${className}`}
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0)' : 'rotate(90deg)',
        }}
      >
        <Moon size={16} />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(-90deg)' : 'rotate(0)',
        }}
      >
        <Sun size={16} />
      </span>
    </button>
  )
}
