import React, { useState } from 'react'
import { ChefHat, MapPin, ExternalLink, UtensilsCrossed } from 'lucide-react'

/* ---------------------------------------------------------------------- *
 *  StreetFoodPanel — visually paired with MusicPanel.                     *
 *                                                                         *
 *  This file used to live inside ComparisonPage.jsx as a private          *
 *  component pair. We pulled it out so other panels (e.g. TripInsightsBar)*
 *  can render it inside their own modals without dragging the rest of    *
 *  the comparison page along for the ride.                                *
 *                                                                         *
 *  Public API:                                                            *
 *    <StreetFoodPanel items={...} destination="Varanasi" />                *
 *      - `items` may be omitted; the component shows an empty state.      *
 *      - Renders pill-row cards (DishRow) styled like MusicPanel TrackRow.*
 *      - Has a built-in tier filter (All / Street / Fine dining).         *
 *      - Footer row links straight into Google Maps for "open all".       *
 * ---------------------------------------------------------------------- */

/* ── Single dish row — twin to MusicPanel's <TrackRow>. Emoji puck on
   the left, dish name + description + location, with inline action
   buttons (Open in Maps, Reserve / Book) on the right. */
function DishRow({ item, idx }) {
  const isFine = item.tier === 'fine'
  const accentRing = isFine
    ? 'border-amber-300/70 bg-amber-50/80 dark:border-amber-400/20 dark:bg-amber-500/[0.05]'
    : 'border-orange-300/70 bg-orange-50/80 dark:border-orange-400/20 dark:bg-orange-500/[0.05]'
  const hoverBorder = isFine
    ? 'hover:border-amber-400 dark:hover:border-amber-400/50'
    : 'hover:border-orange-400 dark:hover:border-orange-400/50'
  const accentText = isFine
    ? 'text-amber-700 dark:text-amber-300'
    : 'text-orange-700 dark:text-orange-300'
  const counterBg = isFine
    ? 'bg-white/80 dark:bg-slate-900/60 ring-1 ring-amber-300/70 dark:ring-amber-500/30'
    : 'bg-white/80 dark:bg-slate-900/60 ring-1 ring-orange-300/70 dark:ring-orange-500/30'

  return (
    <li
      className={`group relative flex flex-col gap-2 rounded-xl border ${accentRing} p-2.5 transition-colors ${hoverBorder} sm:flex-row sm:items-center sm:gap-3 sm:p-3`}
    >
      {/* Emoji puck — doubles as the row index visual anchor. */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl leading-none ${counterBg}`}
        aria-hidden
      >
        <span>{item.emoji || '🍽️'}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            <span className="mr-1.5 text-[10px] font-bold tabular-nums text-slate-500 dark:text-slate-500">
              {String(idx + 1).padStart(2, '0')}
            </span>
            {item.name}
          </span>
          {isFine && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/60 dark:border-amber-500/30 whitespace-nowrap">
              Fine
            </span>
          )}
        </div>
        {item.description && (
          <p className="truncate text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            {item.description}
          </p>
        )}
        {item.where && (
          <p className={`text-[10px] sm:text-[11px] leading-snug mt-0.5 flex items-start gap-1 ${accentText}`}>
            <MapPin size={10} className="mt-0.5 shrink-0" />
            <span className="min-w-0 break-words opacity-90">{item.where}</span>
          </p>
        )}
      </div>

      {/* Inline actions (mirrors Spotify/YT buttons in TrackRow). */}
      <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
        {item.mapsUrl && (
          <a
            href={item.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-black/30 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 transition hover:border-orange-400/60 dark:hover:border-orange-400/40 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] touch-manipulation"
            title="Open on Google Maps"
          >
            <MapPin size={11} className="text-orange-500 dark:text-orange-300" />
            Maps
            <ExternalLink size={9} className="opacity-70" />
          </a>
        )}
        {item.affiliateUrl && (
          <a
            href={item.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition active:scale-[0.97] touch-manipulation ${
              isFine
                ? 'border-amber-400/70 dark:border-amber-500/40 bg-amber-100/90 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200 hover:bg-amber-200/90 dark:hover:bg-amber-500/25'
                : 'border-emerald-400/70 dark:border-emerald-500/40 bg-emerald-100/90 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200/90 dark:hover:bg-emerald-500/25'
            }`}
            title={item.affiliatePartner ? `Book on ${item.affiliatePartner}` : 'Reserve a table'}
          >
            {isFine ? 'Reserve' : 'Book'}
            {item.affiliatePartner && (
              <span className="opacity-80 normal-case font-semibold">· {item.affiliatePartner}</span>
            )}
            <ExternalLink size={9} className="opacity-80" />
          </a>
        )}
      </div>
    </li>
  )
}

/** Inner panel — segmented filter + list of dish rows (MusicPanel-style). */
export default function StreetFoodPanel({ items = [], destination = '' }) {
  // Always default to 'all' — the user's plan view should NOT lock the filter.
  // This way the modal always shows every dish on open and the user can refine.
  const [tier, setTier] = useState('all')
  const list = Array.isArray(items) ? items : []

  // Empty-state shortcut — keeps callers (modals etc.) from having to
  // null-check the array themselves.
  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-500/10 border border-orange-300/70 dark:border-orange-500/25 flex items-center justify-center mb-3">
          <ChefHat size={22} className="text-orange-600 dark:text-orange-300" />
        </div>
        <p className="text-sm text-slate-800 dark:text-slate-300 font-semibold mb-1">No picks yet</p>
        <p className="text-xs text-slate-500 max-w-xs">
          We don&apos;t have a curated street-food list for this destination yet — try a nearby city.
        </p>
      </div>
    )
  }

  const counts = {
    all: list.length,
    street: list.filter((i) => i.tier !== 'fine').length,
    fine: list.filter((i) => i.tier === 'fine').length,
  }
  const visible = tier === 'all' ? list : list.filter((i) => (i.tier || 'street') === tier)

  // Always render all 3 tiers so the UI is consistent across destinations;
  // a tier with 0 items renders disabled but stays visible for clarity.
  const TIERS = [
    { id: 'all',    label: 'All',         count: counts.all    },
    { id: 'street', label: 'Street',      count: counts.street },
    { id: 'fine',   label: 'Fine dining', count: counts.fine   },
  ]

  return (
    <>
      <p className="mb-4 text-xs text-slate-600 dark:text-slate-400 leading-snug">
        Local favourites picked from markets, dhabas and old-city lanes — eat where the locals do.
      </p>

      {/* Segmented filter — same shape & rhythm as the music panel's
          provider strip, but acts as a tier picker. */}
      <div
        className="grid grid-cols-3 gap-1 w-full min-w-0 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-900/10 dark:border-white/10 mb-4"
        role="group"
        aria-label="Filter by food tier"
      >
        {TIERS.map((t) => {
          const disabled = t.count === 0 && t.id !== 'all'
          const active = tier === t.id
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setTier(t.id)}
              aria-pressed={active}
              className={`min-w-0 py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold text-center leading-snug transition-all duration-200 active:scale-[0.98] touch-manipulation ${
                active
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : disabled
                  ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-white/5'
              }`}
            >
              <span className="truncate inline-block max-w-full align-middle">{t.label}</span>
              <span className={`ml-1 text-[10px] tabular-nums ${active ? 'opacity-90' : 'opacity-70'}`}>
                ({t.count})
              </span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-900/10 dark:border-white/8 bg-white/60 dark:bg-white/[0.02] p-6 text-center">
          <ChefHat size={20} className="text-slate-400 dark:text-slate-500" />
          <p className="text-xs text-slate-600 dark:text-slate-400 italic">
            No {tier === 'fine' ? 'fine-dining' : 'street-food'} picks listed for this place — try the All tab.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((item, i) => (
            <DishRow key={`${item.name}-${i}`} item={item} idx={i} />
          ))}
        </ul>
      )}

      {/* Footer strip — mirrors the music panel's "Open vibe in" footer.
          A single "Open all on Maps" search shortcut + a tiny tip line. */}
      {visible.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-900/8 dark:border-white/8 pt-3">
          <span className="mr-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500">
            <UtensilsCrossed size={11} />
            Open all in
          </span>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(`${tier === 'fine' ? 'fine dining ' : 'street food '}${destination}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:border-orange-400/60 dark:hover:border-orange-400/40 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] touch-manipulation"
            title="Search all picks on Google Maps"
          >
            <MapPin size={12} className="text-orange-500 dark:text-orange-300" />
            Google Maps
            <ExternalLink size={11} className="text-slate-400" />
          </a>
        </div>
      )}

      <p className="mt-3 text-[10px] text-slate-500 dark:text-slate-600 leading-snug">
        Tip: many top stalls are cash-only and busiest 7–10 PM. Pin locations open on Google Maps.
      </p>
    </>
  )
}
