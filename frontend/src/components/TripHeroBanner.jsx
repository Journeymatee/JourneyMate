import React from 'react'
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Plane,
  Calendar,
  Award,
} from 'lucide-react'
import { getStatePhoto, onPhotoError } from '../utils/getStatePhoto'

/**
 * TripHeroBanner — the visual anchor of the comparison page.
 *
 * Design language:
 *   • Tall destination photo (h-64 → lg:h-[28rem]) — gives the page a real
 *     "travel app" feel right above the fold.
 *   • Layered glass overlay: subtle gradient at the top for action contrast,
 *     a deeper one at the bottom for the route + duration headline.
 *   • Ken Burns slow-zoom on the photo so the page never feels static.
 *   • Top-left: glass Back chip. Top-right: lightbox + Save button slot.
 *   • Bottom: oversized "Origin → Destination" in Clash Display, with an
 *     uppercase eyebrow ("YOUR JOURNEY · 5 DAYS") and trip-type chip.
 *   • Optional bottom-right: animated "Save ₹X,XXX" badge — pulls eyes
 *     straight to the value prop.
 *
 * The component is intentionally pure-presentation: any slot it doesn't get
 * (savings, save-button, trip-type meta) it just hides.
 */
export default function TripHeroBanner({
  origin,
  destination,
  duration,
  savings,
  tripTypeMeta,
  destinationStateCode,
  destinationStateObj,
  onBack,
  saveSlot, // <SaveTripButton ... />
}) {
  const photo = getStatePhoto({
    stateCode: destinationStateCode || destinationStateObj?.code,
    city: destination,
  })

  const formatINR = (n) => {
    if (!Number.isFinite(n)) return null
    return `₹${Math.round(n).toLocaleString('en-IN')}`
  }

  return (
    <>
      <div
        className="relative mb-6 sm:mb-8 overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40 animate-slide-up"
        style={{ animationDelay: '0.02s' }}
      >
        {/* ── Photo layer ─────────────────────────────────────────── */}
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] w-full">
          {photo?.file && (
            <img
              src={photo.file}
              alt={`${photo.spot} — ${photo.name}`}
              onError={onPhotoError}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                animation: 'heroKenBurns 18s ease-in-out infinite alternate',
              }}
            />
          )}

          {/* Gradient stack:
              - top: subtle dark for action contrast
              - bottom: deep dark for headline legibility
              - radial glow on the right for premium depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/15 to-slate-950/85" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_15%_100%,rgba(245,158,11,0.18),transparent_55%)] mix-blend-soft-light" />
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_100%_0%,rgba(56,189,248,0.18),transparent_60%)] mix-blend-soft-light" />

          {/* ── Top row: Back / Lightbox / Save ─────────────────── */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/55 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur-md transition hover:border-white/30 hover:bg-slate-950/75 hover:text-white"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="flex items-center gap-2">{saveSlot}</div>
          </div>

          {/* ── Bottom: route, duration, trip-type, savings ──────── */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-12 sm:px-7 sm:pb-7 sm:pt-16">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
              {/* Left: route */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/[0.08] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
                    <Plane size={10} /> Your journey
                  </span>
                  {duration && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/[0.08] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
                      <Calendar size={10} /> {duration}
                    </span>
                  )}
                  {tripTypeMeta && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-300/40 bg-fuchsia-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-100 backdrop-blur-md">
                      <span aria-hidden>{tripTypeMeta.icon}</span>
                      {tripTypeMeta.short}
                    </span>
                  )}
                </div>

                <h1
                  className="mt-2.5 sm:mt-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]"
                  style={{ fontFamily: 'Clash Display, Syne, sans-serif', letterSpacing: '-0.02em' }}
                >
                  <span className="break-words">{origin}</span>
                  <ChevronRight
                    size={28}
                    className="text-amber-300/85 self-center shrink-0"
                    strokeWidth={2.5}
                  />
                  <span className="break-words bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 bg-clip-text text-transparent">
                    {destination}
                  </span>
                </h1>

                {photo?.spot && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-white/70">
                    <MapPin size={11} className="text-amber-300" />
                    <span className="font-medium">{photo.spot}</span>
                    {photo.name && (
                      <span className="text-white/45">· {photo.name}</span>
                    )}
                  </p>
                )}
              </div>

              {/* Right: savings hero badge */}
              {Number.isFinite(savings) && savings > 0 && (
                <div className="relative shrink-0">
                  {/* glow */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-400/45 to-cyan-400/35 blur-xl opacity-70" />
                  <div className="relative flex items-center gap-3 rounded-2xl border border-emerald-300/40 bg-slate-950/70 px-4 py-3 backdrop-blur-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-slate-950 shadow-lg">
                      <Award size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300/90">
                        Smart Silver saves
                      </p>
                      <p
                        className="text-xl font-bold leading-tight text-white"
                        style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}
                      >
                        {formatINR(savings)}
                      </p>
                      <p className="text-[10px] text-white/60">vs Premium Gold</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── AI-tuned signature (top-left absolute mini-chip) ─── */}
          <div className="pointer-events-none absolute left-3 sm:left-5 top-14 sm:top-16 hidden md:flex">
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/40 bg-cyan-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-md">
              <Sparkles size={9} /> AI-tuned trip
            </span>
          </div>
        </div>
      </div>

    </>
  )
}
