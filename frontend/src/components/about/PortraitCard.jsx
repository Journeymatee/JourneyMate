import React from 'react'
import { MapPin } from 'lucide-react'
import { useTilt } from '../../hooks/aboutHooks'

/**
 * `PortraitCard` renders the layered hero photo:
 *   ambient glow → backdrop pad → conic halo → glass frame → photo
 *   → duotone wash → cursor spotlight → vignette → corner brackets
 *   → caption chips → "Open to opportunities" pill.
 *
 * SOLID notes
 *  - SRP: this owns *only* the portrait surface; the rest of the
 *    intro text lives in `HeroIntro`.
 *  - OCP: every editorial value (image, alt, location, frameNo)
 *    is a prop, so the same card can render any future profile.
 *  - DIP: it depends on the `useTilt` abstraction, not on raw
 *    pointer-event maths inside the component.
 */
export default function PortraitCard({
  src,
  alt,
  location = 'Hyderabad',
  frameNo = '01 / 26',
  openToOpportunities = true,
}) {
  const tilt = useTilt({ max: 5, scale: 1.01 })

  return (
    <div className="relative mx-auto lg:mx-0 w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[400px] lg:max-w-[440px]">
      <div
        aria-hidden
        className="portrait-ambient absolute -inset-6 sm:-inset-10 rounded-[3.5rem] blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="portrait-pad absolute inset-0 rounded-[2.6rem] -m-4 sm:-m-5 pointer-events-none"
      />

      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="relative will-change-transform"
        style={{
          transform:
            'perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--scale, 1))',
          transition: 'transform 250ms ease-out',
        }}
      >
        {/* Soft conic-gradient halo behind the glass frame. */}
        <div
          aria-hidden
          className="absolute -inset-2 rounded-[2.4rem] blur-xl opacity-50"
          style={{
            background:
              'conic-gradient(from 0deg, #22c55e, #f59e0b, #f43f5e, #6366f1, #22c55e)',
            animation: 'ringSpin 22s linear infinite',
            willChange: 'transform',
          }}
        />

        {/* Glass photo frame. */}
        <div className="relative rounded-[2rem] overflow-hidden border border-white/20 shadow-[0_30px_80px_-20px_rgba(2,6,23,0.7),inset_0_1px_0_rgba(255,255,255,0.10)] bg-slate-950/60 backdrop-blur-xl">
          <img
            src={src}
            alt={alt}
            loading="eager"
            decoding="async"
            className="block w-full aspect-[4/5] object-cover object-center"
            style={{ filter: 'saturate(1.10) contrast(1.06) brightness(1.02)' }}
          />

          {/* Cool-tone duotone wash to lift the metro greys. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.30), rgba(34,197,94,0.18) 50%, rgba(244,63,94,0.20))',
            }}
          />
          {/* Cursor spotlight (driven by --mx/--my from useTilt). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle 240px at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.22), transparent 60%)',
              mixBlendMode: 'soft-light',
            }}
          />
          {/* Bottom vignette so caption chips stay readable. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
            style={{
              background:
                'linear-gradient(to top, rgba(2,6,23,0.85), rgba(2,6,23,0.0))',
            }}
          />

          {/* Camera-style corner brackets. */}
          <span aria-hidden className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/40 rounded-tl-md" />
          <span aria-hidden className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-white/40 rounded-tr-md" />
          <span aria-hidden className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-white/40 rounded-bl-md" />
          <span aria-hidden className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/40 rounded-br-md" />

          {/* Bottom captions */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-[0.14em] font-semibold text-slate-100 shadow-lg shadow-black/30">
              <MapPin size={10} className="text-emerald-300" aria-hidden />
              {location}
            </span>
            {frameNo && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] uppercase tracking-[0.18em] font-bold text-white/70 bg-white/5 border border-white/10 backdrop-blur">
                {frameNo}
              </span>
            )}
          </div>
        </div>
      </div>

      {openToOpportunities && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 whitespace-nowrap shadow-lg shadow-emerald-500/20">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
            <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-emerald-300">
            Open to opportunities
          </span>
        </div>
      )}
    </div>
  )
}
