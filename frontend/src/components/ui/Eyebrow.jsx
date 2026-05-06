import React from 'react'

/**
 * `Eyebrow` is the small uppercase "category" pill that sits above
 * a heading. We've been hand-rolling this everywhere with slightly
 * different padding/tracking — this primitive locks down a single
 * crisp visual so the product feels coherent.
 *
 * Accents map to the existing `shimmer-*` and tinted-glass palette
 * the site already uses, so this doesn't introduce any new colours.
 */

const ACCENTS = Object.freeze({
  emerald: {
    surface: 'border-emerald-500/30 bg-emerald-500/10',
    text:    'text-emerald-200',
    icon:    'text-emerald-300',
  },
  amber: {
    surface: 'border-amber-500/30 bg-amber-500/10',
    text:    'text-amber-200',
    icon:    'text-amber-300',
  },
  rose: {
    surface: 'border-rose-500/30 bg-rose-500/10',
    text:    'text-rose-200',
    icon:    'text-rose-300',
  },
  blue: {
    surface: 'border-blue-500/30 bg-blue-500/10',
    text:    'text-blue-200',
    icon:    'text-blue-300',
  },
  cyan: {
    surface: 'border-cyan-500/30 bg-cyan-500/10',
    text:    'text-cyan-200',
    icon:    'text-cyan-300',
  },
  violet: {
    surface: 'border-violet-500/30 bg-violet-500/10',
    text:    'text-violet-200',
    icon:    'text-violet-300',
  },
  teal: {
    surface: 'border-teal-500/30 bg-teal-500/10',
    text:    'text-teal-200',
    icon:    'text-teal-300',
  },
  slate: {
    surface: 'border-white/15 bg-white/[0.04]',
    text:    'text-slate-200',
    icon:    'text-slate-300',
  },
})

export default function Eyebrow({
  icon = null,
  accent = 'emerald',
  className = '',
  children,
}) {
  const theme = ACCENTS[accent] || ACCENTS.emerald
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md ${theme.surface} ${className}`.trim()}
    >
      {icon != null && (
        <span className={`shrink-0 ${theme.icon}`} aria-hidden>
          {icon}
        </span>
      )}
      <span
        className={`text-[10.5px] uppercase tracking-[0.18em] font-bold ${theme.text}`}
      >
        {children}
      </span>
    </span>
  )
}
