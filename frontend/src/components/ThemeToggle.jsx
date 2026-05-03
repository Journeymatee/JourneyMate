import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * ThemeToggle
 *
 *   variant="icon"     — single round 36×36 button (navbar). Click cycles
 *                        between light and dark; long press is not used.
 *                        Uses a polished sun↔moon swap with theme-aware
 *                        backgrounds so it reads on both modes.
 *
 *   variant="segment"  — three-pill segmented control (Light · System ·
 *                        Dark) suitable for menus and settings panels.
 *                        The active pill uses a brand emerald→amber
 *                        gradient that survives both modes.
 */

const SEGMENTS = [
  { id: 'light',  Icon: Sun,     label: 'Light'  },
  { id: 'system', Icon: Monitor, label: 'System' },
  { id: 'dark',   Icon: Moon,    label: 'Dark'   },
]

export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { mode, resolved, setMode, toggle } = useTheme()

  if (variant === 'segment') {
    return (
      <div
        role="radiogroup"
        aria-label="Theme"
        className={`relative inline-flex items-center gap-0.5 p-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-inner ${className}`}
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
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 shadow-md shadow-emerald-500/20 ring-1 ring-white/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon size={13} strokeWidth={2.4} />
              <span className="tracking-tight">{label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // Default icon variant — a single round button that animates between
  // sun and moon with a smooth crossfade + rotate. Background tints
  // adapt to the active mode so the chip never looks washed-out.
  const isDark = resolved === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-9 h-9 3xl:w-10 3xl:h-10 rounded-xl border transition-all duration-200 overflow-hidden flex items-center justify-center group ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
          : 'bg-slate-900/[0.06] hover:bg-slate-900/[0.10] border-slate-900/10 hover:border-slate-900/20 text-slate-700 hover:text-slate-900'
      } ${className}`}
    >
      {/* Subtle radial highlight that intensifies on hover */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-amber-400/15 via-transparent to-transparent'
            : 'bg-gradient-to-br from-indigo-500/15 via-transparent to-transparent'
        }`}
      />
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0.6)',
        }}
      >
        <Moon size={16} className="drop-shadow" />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(-90deg) scale(0.6)' : 'rotate(0) scale(1)',
        }}
      >
        <Sun size={16} className="drop-shadow" />
      </span>
    </button>
  )
}
