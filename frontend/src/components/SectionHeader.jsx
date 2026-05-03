import React from 'react'

/**
 * Editorial section header used across the app to create a consistent,
 * premium typographic rhythm:
 *
 *   ┌──┐  PRE-TITLE EYEBROW
 *   │ ◉│  ── Clash Display title ───────────────────  [optional badge]
 *   └──┘
 *
 *  - `icon`     – a Lucide icon node, rendered inside a gradient pill
 *  - `accent`   – tailwind colour token used for the icon pill + eyebrow
 *                 ('cyan' | 'violet' | 'emerald' | 'amber' | 'rose' |
 *                  'sky' | 'purple' | 'fuchsia')
 *  - `eyebrow`  – tiny uppercase label above the title
 *  - `title`    – main heading text (rendered in Clash Display)
 *  - `subtitle` – optional one-line description below the title row
 *  - `badge`    – optional right-side ReactNode (e.g. a count pill)
 *  - `divider`  – when true, draws a soft hairline between title and badge
 *  - `as`       – heading tag (`h1`, `h2`, `h3`…). Default `h2`.
 *  - `id`       – id passed through to the heading for `aria-labelledby`
 *  - `className`– extra classes appended to the wrapper
 *
 * Usage:
 *   <SectionHeader
 *     icon={<TrendingUp size={16} strokeWidth={2.4} />}
 *     accent="cyan"
 *     eyebrow="Live now"
 *     title="Popular routes"
 *     subtitle="Hand-researched journeys across India"
 *     badge={<span>23 routes</span>}
 *     divider
 *   />
 */

const ACCENTS = {
  cyan:    { grad: 'from-cyan-400 to-sky-500',         shadow: 'shadow-cyan-500/30',    eyebrow: 'text-cyan-300/90' },
  sky:     { grad: 'from-sky-400 to-blue-500',         shadow: 'shadow-sky-500/30',     eyebrow: 'text-sky-300/90' },
  violet:  { grad: 'from-violet-400 to-indigo-500',    shadow: 'shadow-violet-500/30',  eyebrow: 'text-violet-300/90' },
  purple:  { grad: 'from-purple-400 to-fuchsia-500',   shadow: 'shadow-purple-500/30',  eyebrow: 'text-purple-300/90' },
  fuchsia: { grad: 'from-fuchsia-400 to-pink-500',     shadow: 'shadow-fuchsia-500/30', eyebrow: 'text-fuchsia-300/90' },
  rose:    { grad: 'from-rose-400 to-pink-500',        shadow: 'shadow-rose-500/30',    eyebrow: 'text-rose-300/90' },
  amber:   { grad: 'from-amber-400 to-orange-500',     shadow: 'shadow-amber-500/30',   eyebrow: 'text-amber-300/90' },
  emerald: { grad: 'from-emerald-400 to-teal-500',     shadow: 'shadow-emerald-500/30', eyebrow: 'text-emerald-300/90' },
}

export default function SectionHeader({
  icon,
  accent = 'cyan',
  eyebrow,
  title,
  subtitle,
  badge,
  divider = false,
  as: Tag = 'h2',
  id,
  className = '',
}) {
  const a = ACCENTS[accent] || ACCENTS.cyan

  return (
    <div className={`mb-5 sm:mb-6 3xl:mb-8 ${className}`}>
      <div className="flex items-center gap-2.5 sm:gap-3 3xl:gap-4 flex-wrap">
        {icon && (
          <div
            className={`flex h-8 w-8 sm:h-9 sm:w-9 3xl:h-11 3xl:w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${a.grad} text-white shadow-lg ${a.shadow} ring-1 ring-white/15`}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p
              className={`text-[10px] sm:text-[11px] 3xl:text-xs font-bold uppercase tracking-[0.16em] ${a.eyebrow}`}
            >
              {eyebrow}
            </p>
          )}
          {title && (
            <Tag
              id={id}
              className="text-sm 2xs:text-base sm:text-lg lg:text-xl 2xl:text-2xl 3xl:text-3xl font-semibold text-white tracking-tight leading-tight"
              style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}
            >
              {title}
            </Tag>
          )}
        </div>
        {divider && (
          <div className="flex-1 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent ml-1 hidden sm:block" />
        )}
        {badge && <div className="ml-auto sm:ml-0 shrink-0">{badge}</div>}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs sm:text-sm 3xl:text-base text-slate-400 leading-relaxed max-w-2xl 3xl:max-w-3xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
