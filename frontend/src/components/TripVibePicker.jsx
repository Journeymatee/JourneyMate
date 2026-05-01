import React from 'react'
import { Users, Sparkles } from 'lucide-react'
import { TRIP_TYPES, VIBES_BY_TYPE } from '../data/tripVibes'

/* ------------------------------------------------------------------ */
/*  Trip-type radio chips                                              */
/* ------------------------------------------------------------------ */
/**
 * 4 cards: Solo / Couple / Family / Friends.
 *
 * Layout:
 *   - <360px : 2-column grid, compact emoji + short label.
 *   - sm+    : 4-column grid with blurb + animated gradient sheen on the
 *              active chip (acts as our "photo background" without bringing
 *              binary assets into the bundle).
 *
 * Single-select. `value === null` means "not chosen yet". Clicking the
 * already-active chip clears it.
 */
export function TripTypePicker({ value, onChange, size = 'md', showHeader = true }) {
  return (
    <div className="w-full min-w-0">
      {showHeader && (
        <div className="flex items-center gap-2 mb-2">
          <Users size={14} className="text-fuchsia-300 shrink-0" />
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Travelling as
          </div>
        </div>
      )}
      <div
        role="radiogroup"
        aria-label="Trip type"
        className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full min-w-0"
      >
        {TRIP_TYPES.map((t) => {
          const active = value === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(active ? null : t.id)}
              className={`group relative overflow-hidden min-w-0 flex flex-col items-start gap-0.5 px-3 py-2.5 sm:py-3 rounded-2xl border text-left transition-all duration-300 active:scale-[0.98] ${
                active
                  ? `${t.border} shadow-lg shadow-black/30 ring-2 ${t.ring}`
                  : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/25'
              }`}
            >
              {active && (
                <span
                  aria-hidden
                  className={`absolute inset-0 bg-gradient-to-br ${t.gradient} pointer-events-none`}
                />
              )}
              {active && (
                <span
                  aria-hidden
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none"
                />
              )}

              <div className="relative flex items-center gap-2 w-full min-w-0 z-10">
                <span className="text-base sm:text-lg leading-none shrink-0" aria-hidden>
                  {t.icon}
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold truncate min-w-0 flex-1 ${
                    active ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {size === 'sm' ? t.short : t.label}
                </span>
                {active && (
                  <Sparkles size={12} className={`${t.accent} shrink-0`} aria-hidden />
                )}
              </div>
              {size !== 'sm' && (
                <span
                  className={`relative z-10 hidden sm:block text-[10px] leading-snug truncate w-full ${
                    active ? 'text-white/85' : 'text-slate-500'
                  }`}
                >
                  {t.blurb}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Vibe chips (multi-select, dynamic per trip type)                   */
/* ------------------------------------------------------------------ */
/**
 * Renders the vibe options for the selected trip type. Multi-select.
 * Empty when `tripType` is null. Chips wrap onto multiple lines as needed.
 */
export function VibeChips({ tripType, value, onChange, label }) {
  if (!tripType) return null
  const list = VIBES_BY_TYPE[tripType] || []
  if (list.length === 0) return null
  const meta = TRIP_TYPES.find((t) => t.id === tripType) || null
  const accent = meta?.accent || 'text-fuchsia-300'
  const selected = Array.isArray(value) ? value : []
  const titleText = label || (
    tripType === 'couple' ? 'Couple vibes — pick what fits you'
    : tripType === 'solo'    ? 'Solo vibes'
    : tripType === 'family'  ? 'Family vibes'
                             : 'Friends vibes'
  )

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className={`text-[10px] uppercase tracking-wider font-semibold truncate ${accent}`}>
          {titleText}
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-200 font-semibold shrink-0"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full min-w-0">
        {list.map((v) => {
          const active = selected.includes(v.id)
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(v.id)}
              className={`min-w-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${
                active
                  ? 'bg-gradient-to-r from-fuchsia-500/30 to-pink-500/20 border-fuchsia-400/50 text-white shadow shadow-fuchsia-500/15'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/25 hover:text-white'
              }`}
            >
              <span className="text-sm leading-none shrink-0" aria-hidden>{v.icon}</span>
              <span className="truncate max-w-[8rem]">{v.label}</span>
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <div className="mt-2 text-[10px] text-slate-500 leading-snug">
          Budget &amp; suggestions update automatically when you change these.
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Combined picker (used in both HeroSearch and Compare)              */
/* ------------------------------------------------------------------ */
export default function TripVibePicker({ tripType, vibes, onTripType, onVibes, size = 'md', compact = false }) {
  return (
    <div className={`w-full min-w-0 ${compact ? 'space-y-2.5' : 'space-y-3'}`}>
      <TripTypePicker
        value={tripType}
        onChange={(next) => {
          onTripType(next)
          if (next !== tripType) onVibes([])
        }}
        size={size}
      />
      {tripType && (
        <VibeChips tripType={tripType} value={vibes} onChange={onVibes} />
      )}
    </div>
  )
}
