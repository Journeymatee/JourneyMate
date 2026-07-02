import React from 'react'
import {
  ChevronRight,
  Clock,
  MapPin,
  Plane,
  Train,
  Zap,
} from 'lucide-react'

import { Button } from '../ui'
import PhotoLightbox from '../PhotoLightbox'
import { getStatePhoto } from '../../utils/getStatePhoto'

import {
  TAG_BACKDROPS,
  TAG_COLORS,
  TAG_EMOJIS,
} from '../../data/popularRoutesContent'

/**
 * `RouteCard` renders a single popular-route tile. It is a pure
 * presentation component — pass it a route object + an `onCompare`
 * callback and it knows nothing else. That makes it trivial to
 * reuse on other surfaces (search results, related-routes panel,
 * collection pages) without rewriting the design.
 */
export default function RouteCard({ route, onCompare, animationDelay = 0 }) {
  const savings = (route.goldPrice || 0) - (route.silverPrice || 0)
  const tagColor = TAG_COLORS[route.tag] || TAG_COLORS.Explore
  const tagBackdrop = TAG_BACKDROPS[route.tag] || TAG_BACKDROPS.Explore
  const emoji = TAG_EMOJIS[route.tag] || '\uD83D\uDDFA\uFE0F'
  const photo = getStatePhoto({ stateCode: route.toStateCode, city: route.to })

  return (
    <article
      className="glass rounded-3xl overflow-hidden border border-white/8 hover:border-cyan-400/30 group hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 flex flex-col relative animate-slide-up"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent" />

      {/* ── Hero photo strip ────────────────────────────────────── */}
      <div className={`relative h-40 sm:h-44 overflow-hidden ${tagBackdrop}`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(0,0,0,0.35),transparent_60%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(255,255,255,0.45),transparent_60%)] mix-blend-soft-light"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-4 -right-2 text-[8rem] leading-none opacity-25 select-none rotate-[-8deg]"
          aria-hidden
        >
          {emoji}
        </div>

        {photo?.file && (
          <PhotoLightbox
            src={photo.file}
            alt={`${photo.spot} — ${photo.name}`}
            caption={photo.spot}
            subcaption={photo.name}
            badge={photo.biome}
            showHint={false}
            wrapperClassName="absolute inset-0 z-10"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-slate-950/10"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 py-3">
          <div className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-slate-950/70 ring-1 ring-white/40 dark:ring-white/15 backdrop-blur-md flex items-center justify-center text-xl shadow-[0_6px_18px_-6px_rgba(0,0,0,0.45)]">
            {emoji}
          </div>
          <span
            className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-slate-950/65 backdrop-blur-md ${tagColor}`}
          >
            {route.tag}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-3 pt-10 pointer-events-none">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.22em] font-bold text-cyan-200/95 drop-shadow">
            {photo?.name || 'India'}
          </div>
          <div className="text-base sm:text-lg font-display font-bold text-white truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]">
            {photo?.spot || route.to}
          </div>
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-white/5 to-transparent p-5 sm:p-6 border-b border-white/6">
        <div className="flex items-center gap-2 text-white mb-1">
          <MapPin size={14} className="text-green-400 shrink-0" aria-hidden />
          <span className="font-semibold text-sm sm:text-base truncate">
            {route.from}
          </span>
          <ChevronRight size={14} className="text-slate-500 shrink-0" aria-hidden />
          <MapPin size={14} className="text-amber-400 shrink-0" aria-hidden />
          <span className="font-semibold text-sm sm:text-base truncate">
            {route.to}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock size={11} aria-hidden />
            {route.duration}
          </span>
          {route.transport && (
            <span className="flex items-center gap-1">
              {route.transport.toLowerCase().includes('flight') ? (
                <Plane size={11} aria-hidden />
              ) : (
                <Train size={11} aria-hidden />
              )}
              {route.transport}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        {route.highlights && route.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {route.highlights.map((h) => (
              <span
                key={h}
                className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full glass border border-white/8 text-slate-400 truncate max-w-[120px]"
              >
                {h}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-green-500/8 border border-green-500/15 p-3 text-center">
            <div className="text-[10px] text-green-400 font-semibold uppercase mb-1">
              Silver
            </div>
            <div className="font-display font-bold text-base sm:text-lg text-white tabular-nums">
              {`\u20B9${route.silverPrice.toLocaleString('en-IN')}`}
            </div>
          </div>
          <div className="rounded-xl bg-amber-500/8 border border-amber-500/15 p-3 text-center">
            <div className="text-[10px] text-amber-400 font-semibold uppercase mb-1">
              Gold
            </div>
            <div className="font-display font-bold text-base sm:text-lg text-white tabular-nums">
              {`\u20B9${route.goldPrice.toLocaleString('en-IN')}`}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 mb-5">
          Silver saves you{' '}
          <span className="text-cyan-400 font-bold">
            {`\u20B9${savings.toLocaleString('en-IN')}`}
          </span>
        </div>

        <div className="mt-auto">
          <Button
            variant="primary"
            accent="blue"
            size="md"
            fullWidth
            onClick={() => onCompare?.(route)}
            iconLeft={<Zap size={15} />}
            className="!py-3"
          >
            Compare Plans
          </Button>
        </div>
      </div>
    </article>
  )
}
