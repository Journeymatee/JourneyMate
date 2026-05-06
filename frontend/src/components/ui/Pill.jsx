import React from 'react'

/**
 * `Pill` is a generic small badge / status chip. Use it for inline
 * meta info ("3 left", "Most Popular", "GST extra"), not for
 * uppercase section labels — those should use `<Eyebrow>`.
 *
 * Variants
 *   - 'soft'   — translucent tinted glass (default)
 *   - 'solid'  — full-saturation gradient (use sparingly for badges)
 *   - 'outline' — outline only, no fill
 */

const ACCENTS = Object.freeze({
  emerald: { soft: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200', solid: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white', outline: 'border-emerald-500/40 text-emerald-200' },
  amber:   { soft: 'border-amber-500/30 bg-amber-500/10 text-amber-200',       solid: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white', outline: 'border-amber-500/40 text-amber-200' },
  rose:    { soft: 'border-rose-500/30 bg-rose-500/10 text-rose-200',          solid: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white',     outline: 'border-rose-500/40 text-rose-200' },
  blue:    { soft: 'border-blue-500/30 bg-blue-500/10 text-blue-200',          solid: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',   outline: 'border-blue-500/40 text-blue-200' },
  cyan:    { soft: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',          solid: 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white',     outline: 'border-cyan-500/40 text-cyan-200' },
  slate:   { soft: 'border-white/15 bg-white/[0.05] text-slate-200',           solid: 'bg-slate-800 text-slate-100',                               outline: 'border-white/20 text-slate-200' },
})

const SIZES = Object.freeze({
  xs: 'text-[10px] px-2 py-0.5',
  sm: 'text-[11px] px-2.5 py-1',
  md: 'text-xs px-3 py-1.5',
})

export default function Pill({
  accent = 'emerald',
  variant = 'soft',
  size = 'sm',
  icon = null,
  className = '',
  children,
}) {
  const theme = ACCENTS[accent] || ACCENTS.emerald
  const surface = theme[variant] || theme.soft
  const border = variant === 'solid' ? '' : 'border'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold backdrop-blur-md ${border} ${SIZES[size] || SIZES.sm} ${surface} ${className}`.trim()}
    >
      {icon != null && (
        <span className="shrink-0" aria-hidden>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  )
}
