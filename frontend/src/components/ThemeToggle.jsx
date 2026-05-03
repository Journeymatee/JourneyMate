import React, { useLayoutEffect, useRef, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * ThemeToggle
 *
 *   variant="icon"     — single round 36×36 button (navbar). Click cycles
 *                        between light and dark; long press is not used.
 *
 *   variant="segment"  — three-pill segmented control with a hardware-
 *                        accelerated sliding indicator that tracks the
 *                        active segment. The glowing pill uses a brand
 *                        emerald→amber gradient and survives both modes.
 */

const SEGMENTS = [
  { id: 'light',  Icon: Sun,     label: 'Light'  },
  { id: 'system', Icon: Monitor, label: 'System' },
  { id: 'dark',   Icon: Moon,    label: 'Dark'   },
]

// Segment icons styled per mode for the glow tint
const SEGMENT_TINTS = {
  light:  { glow: 'shadow-amber-400/40',   iconColor: 'text-amber-300'  },
  system: { glow: 'shadow-sky-400/40',     iconColor: 'text-sky-300'    },
  dark:   { glow: 'shadow-indigo-400/40',  iconColor: 'text-indigo-300' },
}

export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { mode, resolved, setMode, toggle } = useTheme()

  // ── Segment variant ──────────────────────────────────────────────────────
  const trackRef  = useRef(null)
  const pillRefs  = useRef({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  useLayoutEffect(() => {
    if (variant !== 'segment') return
    const track = trackRef.current
    const pill  = pillRefs.current[mode]
    if (!track || !pill) return
    const tRect = track.getBoundingClientRect()
    const pRect = pill.getBoundingClientRect()
    setIndicator({
      left:  pRect.left - tRect.left,
      width: pRect.width,
      ready: true,
    })
  }, [mode, variant])

  if (variant === 'segment') {
    const tint = SEGMENT_TINTS[mode] ?? SEGMENT_TINTS.dark
    return (
      <div
        ref={trackRef}
        role="radiogroup"
        aria-label="Appearance"
        className={`relative inline-flex items-center p-1 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${className}`}
      >
        {/* Sliding glow indicator — absolutely positioned behind buttons */}
        {indicator.ready && (
          <span
            aria-hidden
            className={`absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 shadow-lg ${tint.glow} transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}

        {SEGMENTS.map(({ id, Icon, label }) => {
          const active = mode === id
          return (
            <button
              key={id}
              ref={(el) => { pillRefs.current[id] = el }}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(id)}
              title={`${label} mode`}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold tracking-tight select-none transition-colors duration-200 ${
                active ? 'text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon
                size={13}
                strokeWidth={active ? 2.8 : 2}
                className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}
              />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // ── Icon variant (navbar) ────────────────────────────────────────────────
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
          opacity:   isDark ? 1 : 0,
          transform: isDark ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0.6)',
        }}
      >
        <Moon size={16} className="drop-shadow" />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity:   isDark ? 0 : 1,
          transform: isDark ? 'rotate(-90deg) scale(0.6)' : 'rotate(0) scale(1)',
        }}
      >
        <Sun size={16} className="drop-shadow" />
      </span>
    </button>
  )
}
