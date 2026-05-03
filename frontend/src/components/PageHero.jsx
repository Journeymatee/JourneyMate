import React from 'react'

/**
 * Cinematic page hero with a full-bleed background image, animated
 * Ken-Burns zoom, layered dark gradients for legibility, and a soft
 * blend into the dark page background below.
 *
 * Props:
 *   image     – public path to the hero image (e.g. "/photos/hero-goa.png")
 *   imagePos  – CSS object-position value for cropping (default 'center')
 *   accent    – Tailwind colour token used in the badge ring + glow
 *               (e.g. 'cyan' | 'purple' | 'amber' | 'emerald' | 'rose')
 *   eyebrow   – small pill above the title (string or node)
 *   eyebrowIcon – optional icon node rendered inside the eyebrow
 *   title     – main H1 (string or node)
 *   highlight – word/phrase inside the title to render with a gradient sheen
 *               (rendered after `title` if provided)
 *   subtitle  – paragraph under the title
 *   children  – optional content shown below the subtitle (CTA, chips, …)
 *   size      – 'compact' | 'default' | 'tall' (default 'default').
 *               'compact' is best for pages where the user expects to see
 *               content immediately below (e.g. Popular Routes list).
 *   minH      – override the size preset with a custom min-height class
 */

/**
 * Hero size presets — every value is responsive across the full breakpoint
 * spectrum (2xs phones → 4xl 4K TVs) so the hero never looks stretched
 * on a TV or cramped on a 320-px phone.
 */
const SIZE_PRESETS = {
  compact: {
    minH:        'min-h-[38vh] 2xs:min-h-[40vh] sm:min-h-[44vh] lg:min-h-[46vh] 3xl:min-h-[42vh]',
    padding:     'pb-6 sm:pb-8 lg:pb-10 pt-20 2xs:pt-24 sm:pt-28 lg:pt-32 3xl:pt-40',
    titleCls:    'text-2xl 2xs:text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl',
    subtitleCls: 'text-xs 2xs:text-sm sm:text-base 3xl:text-lg',
  },
  default: {
    minH:        'min-h-[46vh] 2xs:min-h-[52vh] sm:min-h-[58vh] lg:min-h-[62vh] 3xl:min-h-[58vh]',
    padding:     'pb-10 sm:pb-14 lg:pb-16 pt-24 2xs:pt-28 sm:pt-32 lg:pt-40 3xl:pt-48',
    titleCls:    'text-3xl 2xs:text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl 3xl:text-8xl',
    subtitleCls: 'text-sm sm:text-base lg:text-lg 3xl:text-xl',
  },
  tall: {
    minH:        'min-h-[55vh] 2xs:min-h-[62vh] sm:min-h-[72vh] lg:min-h-[78vh] 3xl:min-h-[70vh]',
    padding:     'pb-14 sm:pb-20 lg:pb-24 pt-28 2xs:pt-32 sm:pt-40 lg:pt-48 3xl:pt-56',
    titleCls:    'text-4xl 2xs:text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl 3xl:text-9xl',
    subtitleCls: 'text-base sm:text-lg lg:text-xl 3xl:text-2xl',
  },
}

const ACCENT_MAP = {
  cyan:    { ring: 'border-cyan-400/35',    glow: 'from-cyan-500/25',    text: 'text-cyan-300',    grad: 'from-cyan-300 via-teal-300 to-emerald-300' },
  purple:  { ring: 'border-purple-400/35',  glow: 'from-purple-500/25',  text: 'text-purple-300',  grad: 'from-purple-300 via-fuchsia-300 to-violet-300' },
  amber:   { ring: 'border-amber-400/35',   glow: 'from-amber-500/25',   text: 'text-amber-300',   grad: 'from-amber-300 via-yellow-300 to-orange-300' },
  emerald: { ring: 'border-emerald-400/35', glow: 'from-emerald-500/25', text: 'text-emerald-300', grad: 'from-emerald-300 via-green-300 to-teal-300' },
  rose:    { ring: 'border-rose-400/35',    glow: 'from-rose-500/25',    text: 'text-rose-300',    grad: 'from-rose-300 via-pink-300 to-fuchsia-300' },
  sky:     { ring: 'border-sky-400/35',     glow: 'from-sky-500/25',     text: 'text-sky-300',     grad: 'from-sky-300 via-cyan-300 to-blue-300' },
}

export default function PageHero({
  image,
  imagePos = 'center',
  accent = 'cyan',
  eyebrow,
  eyebrowIcon,
  title,
  highlight,
  subtitle,
  children,
  size = 'default',
  minH,
}) {
  const a = ACCENT_MAP[accent] || ACCENT_MAP.cyan
  const preset = SIZE_PRESETS[size] || SIZE_PRESETS.default
  const heightCls = minH || preset.minH

  return (
    <header className={`relative w-full ${heightCls} flex items-end overflow-hidden`}>
      {/* Background image with slow Ken-Burns zoom */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: imagePos,
          backgroundRepeat: 'no-repeat',
          animation: 'heroKenBurns 24s ease-in-out infinite alternate',
        }}
      />

      {/* Dim layer for text legibility */}
      <div className="absolute inset-0 bg-slate-950/55" />

      {/* Brand-tinted radial glow on the side */}
      <div
        className={`absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-gradient-radial ${a.glow} to-transparent blur-3xl opacity-70`}
      />

      {/* Top-to-bottom darkening + soft blend into the page bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/30 to-slate-950" />

      {/* Soft brand line on top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Content — wrapper grows with viewport so 4K TVs don't look cramped */}
      <div className={`relative w-full max-w-5xl 2xl:max-w-6xl 3xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 ${preset.padding} text-center`}>
        {eyebrow && (
          <div
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-950/55 backdrop-blur-md border ${a.ring} mb-4 sm:mb-5 shadow-lg shadow-black/30 max-w-full`}
          >
            {eyebrowIcon}
            <span className="text-[11px] 2xs:text-xs sm:text-sm 3xl:text-base text-slate-200 font-medium truncate">{eyebrow}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${a.text.replace('text-', 'bg-')} animate-pulse shrink-0`} />
          </div>
        )}

        <h1 className={`font-display font-bold ${preset.titleCls} text-white mb-3 sm:mb-4 leading-[1.05] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] break-words`}>
          {title}
          {highlight && (
            <>
              {' '}
              <span className={`bg-gradient-to-r ${a.grad} bg-clip-text text-transparent`}>
                {highlight}
              </span>
            </>
          )}
        </h1>

        {subtitle && (
          <p className={`text-slate-200/90 ${preset.subtitleCls} max-w-2xl 3xl:max-w-3xl mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]`}>
            {subtitle}
          </p>
        )}

        {children && <div className="mt-5 sm:mt-6 flex flex-wrap justify-center">{children}</div>}
      </div>
    </header>
  )
}
