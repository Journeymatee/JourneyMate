import React from 'react'
import { Link } from 'react-router-dom'
import { Linkedin, Mail, Plane, Sparkles } from 'lucide-react'
import { ROLES } from '../../data/aboutContent'
import { useTypewriter } from '../../hooks/aboutHooks'
import StatStrip from './StatStrip'

/**
 * `HeroIntro` owns the right-hand intro column of the page hero:
 *   eyebrow chip → name headline → typewriter role → bio →
 *   stats strip → quick action row.
 *
 * It accepts the data it needs as props so it never imports anything
 * page-specific; the page layer wires it to `aboutContent.js` (DIP).
 */
export default function HeroIntro({
  name,
  email,
  bioJourney,
  stats,
  roles = ROLES,
}) {
  const role = useTypewriter(roles)

  return (
    <div className="text-center lg:text-left">
      <EyebrowChip />

      <h1
        id="about-name"
        className="font-display font-bold text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.04] tracking-[-0.02em] text-white mb-3 sm:mb-4"
      >
        Hi, I&apos;m{' '}
        <span
          className="relative inline-block bg-clip-text text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(120deg, #34d399 0%, #fbbf24 35%, #fb7185 70%, #34d399 100%)',
            backgroundSize: '200% auto',
            animation: 'shimmer 4s linear infinite',
            filter: 'drop-shadow(0 4px 24px rgba(34,197,94,0.20))',
          }}
        >
          {name}
        </span>
        <span className="text-emerald-300/80">.</span>
      </h1>

      <h2 className="text-sm xs:text-base sm:text-lg lg:text-xl text-slate-200 mb-4 sm:mb-5 min-h-[1.6em] font-medium">
        I&apos;m{' '}
        <span className="font-semibold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
          {role || '\u00A0'}
        </span>
        <span
          aria-hidden
          className="ml-0.5 inline-block w-[2px] h-5 align-text-bottom bg-emerald-400 animate-blink"
        />
      </h2>

      <p className="text-[14px] xs:text-[15px] sm:text-base lg:text-[17px] text-slate-300/90 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-7 sm:mb-8">
        I build things real travellers actually use. Java + React, brewed
        with way too much coffee and shipped from{' '}
        <span className="font-semibold bg-gradient-to-r from-amber-200 to-rose-200 bg-clip-text text-transparent">
          {bioJourney}
        </span>
        .
      </p>

      <StatStrip stats={stats} />

      <CtaRow email={email} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
 *  Sub-components — kept private to this file because they are
 *  only ever consumed by HeroIntro (cohesion).
 * ───────────────────────────────────────────────────────────────── */

function EyebrowChip() {
  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 sm:mb-5 backdrop-blur-md"
      style={{
        background:
          'linear-gradient(135deg, rgba(245,158,11,0.14), rgba(244,63,94,0.10))',
        boxShadow:
          'inset 0 0 0 1px rgba(245,158,11,0.35), 0 6px 20px -8px rgba(245,158,11,0.30)',
      }}
    >
      <Sparkles size={11} className="text-amber-300" aria-hidden />
      {['Founder', 'Engineer', 'Traveller'].map((label, i, arr) => (
        <React.Fragment key={label}>
          <span className="text-[10.5px] uppercase tracking-[0.18em] font-bold bg-gradient-to-r from-amber-200 to-rose-200 bg-clip-text text-transparent">
            {label}
          </span>
          {i < arr.length - 1 && (
            <span aria-hidden className="w-1 h-1 rounded-full bg-amber-300/60" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function CtaRow({ email }) {
  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
      <a
        href={`mailto:${email}`}
        className="group relative inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-slate-950 font-bold text-sm transition-all hover:-translate-y-0.5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #34d399 0%, #fbbf24 100%)',
          boxShadow:
            '0 12px 28px -10px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #6ee7b7, #fcd34d)' }}
        />
        <Mail size={15} aria-hidden className="relative" />
        <span className="relative">Say hello</span>
      </a>

      <Link
        to="/"
        className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md text-white text-sm font-semibold hover:bg-white/[0.10] hover:border-white/25 transition-all"
      >
        <Plane
          size={15}
          aria-hidden
          className="text-emerald-300 group-hover:-translate-y-0.5 transition-transform"
        />
        Try JourneyMate
      </Link>

      <a
        href="https://www.linkedin.com/in/harsh-vardhan-8b406a250"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md text-slate-300 hover:text-white hover:border-white/25 hover:bg-white/[0.08] text-sm transition-all"
        aria-label="LinkedIn profile"
        title="LinkedIn"
      >
        <Linkedin size={15} aria-hidden />
      </a>
    </div>
  )
}
