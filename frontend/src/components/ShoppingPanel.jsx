import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ShoppingBag,
  Building2,
  Store,
  Gem,
  Palette,
  MapPin,
  ExternalLink,
  Loader2,
  Sparkles,
  RefreshCw,
  Tag,
  Map as MapIcon,
} from 'lucide-react'
import { getPlaceShopping } from '../services/shoppingService'

/* ------------------------------------------------------------------ *
 * Local error boundary — keep render-time failures inside the panel.   *
 * If something breaks here the rest of the comparison page is fine.    *
 * ------------------------------------------------------------------ */
class ShoppingErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[ShoppingPanel] render failed, hiding panel:', err)
    }
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

/* ------------------------------------------------------------------ *
 * Small Google "G" glyph — inline SVG, no extra deps.                  *
 * ------------------------------------------------------------------ */
function GoogleGlyph({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.7-2.4 3.5v2.9h3.9c2.3-2.1 3.5-5.2 3.5-8.5z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-2.9c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3C3.4 21.4 7.4 24 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2v-3H1.4C.5 9 0 10.4 0 12c0 1.6.5 3 1.4 4.5l4-3.1z" />
      <path fill="#EA4335" d="M12 4.7c1.7 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1c1-2.8 3.5-4.9 6.6-4.9z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ *
 * Type → icon + accent. Static map so Tailwind JIT picks up classes.    *
 * ------------------------------------------------------------------ */
// Theme-aware. Each value is a *complete* class string so Tailwind JIT picks
// it up — no string interpolation games.
const TYPE_META = {
  market:   { Icon: Store,        label: 'Market',   accent: 'amber',   ring: 'border-amber-300/70 dark:border-amber-400/25 bg-amber-50/80 dark:bg-amber-500/[0.05]',          text: 'text-amber-700 dark:text-amber-300',   chip: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/70 dark:border-amber-400/30' },
  bazaar:   { Icon: ShoppingBag,  label: 'Bazaar',   accent: 'rose',    ring: 'border-rose-300/70 dark:border-rose-400/25 bg-rose-50/80 dark:bg-rose-500/[0.05]',              text: 'text-rose-700 dark:text-rose-300',     chip: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300/70 dark:border-rose-400/30' },
  mall:     { Icon: Building2,    label: 'Mall',     accent: 'sky',     ring: 'border-sky-300/70 dark:border-sky-400/25 bg-sky-50/80 dark:bg-sky-500/[0.05]',                  text: 'text-sky-700 dark:text-sky-300',       chip: 'bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/70 dark:border-sky-400/30' },
  street:   { Icon: MapPin,       label: 'Street',   accent: 'emerald', ring: 'border-emerald-300/70 dark:border-emerald-400/25 bg-emerald-50/80 dark:bg-emerald-500/[0.05]',  text: 'text-emerald-700 dark:text-emerald-300', chip: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/70 dark:border-emerald-400/30' },
  craft:    { Icon: Palette,      label: 'Craft',    accent: 'fuchsia', ring: 'border-fuchsia-300/70 dark:border-fuchsia-400/25 bg-fuchsia-50/80 dark:bg-fuchsia-500/[0.05]',  text: 'text-fuchsia-700 dark:text-fuchsia-300', chip: 'bg-fuchsia-100 dark:bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-300/70 dark:border-fuchsia-400/30' },
  boutique: { Icon: Gem,          label: 'Boutique', accent: 'violet',  ring: 'border-violet-300/70 dark:border-violet-400/25 bg-violet-50/80 dark:bg-violet-500/[0.05]',      text: 'text-violet-700 dark:text-violet-300', chip: 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-300/70 dark:border-violet-400/30' },
}

const PRICE_LABEL = {
  budget: { label: '$', tip: 'Budget-friendly' },
  mid:    { label: '$$', tip: 'Mid-range' },
  luxury: { label: '$$$', tip: 'Premium / luxury' },
}

function typeMetaFor(t) {
  return TYPE_META[t] || TYPE_META.street
}

/* ------------------------------------------------------------------ *
 * Filter pill                                                          *
 * ------------------------------------------------------------------ */
function FilterPill({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition active:scale-[0.97] touch-manipulation ${
        active
          ? 'border-cyan-500/60 dark:border-cyan-400/50 bg-cyan-100/90 dark:bg-cyan-500/15 text-cyan-800 dark:text-white shadow-sm dark:shadow-md dark:shadow-cyan-500/20'
          : 'border-slate-900/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:border-slate-900/20 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {children}
      {typeof count === 'number' && (
        <span className={`rounded-full px-1.5 text-[10px] font-bold tabular-nums ${active ? 'bg-cyan-200/70 dark:bg-white/20 text-cyan-800 dark:text-white' : 'bg-slate-900/8 dark:bg-white/10 text-slate-600 dark:text-slate-400'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

/* ------------------------------------------------------------------ *
 * One spot card                                                        *
 * ------------------------------------------------------------------ */
function ShopSpotCard({ spot, idx }) {
  const meta = typeMetaFor(spot.type)
  const Icon = meta.Icon
  const price = PRICE_LABEL[spot.priceRange] || null
  const known = Array.isArray(spot.knownFor) ? spot.knownFor.slice(0, 4) : []

  return (
    <li
      className={`group relative flex flex-col gap-2 rounded-xl border ${meta.ring} p-3 transition hover:-translate-y-0.5 hover:border-cyan-400/60 dark:hover:border-cyan-400/40 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-cyan-500/10 sm:p-3.5`}
      style={{ animationDelay: `${0.04 * idx}s` }}
    >
      {/* Header row: icon + name + price */}
      <div className="flex items-start gap-2.5 sm:gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-gradient-to-br dark:from-white/[0.08] dark:to-white/[0.02] shadow-sm dark:shadow-md ring-1 ring-slate-900/8 dark:ring-white/10 ${meta.text}`}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              {spot.name}
            </p>
            {price && (
              <span
                className="shrink-0 rounded-md border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                title={price.tip}
              >
                {price.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 flex-wrap text-[11px] text-slate-600 dark:text-slate-400">
            <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.chip}`}>
              {meta.label}
            </span>
            {spot.area && (
              <span className="inline-flex items-center gap-0.5 min-w-0">
                <MapPin size={10} className="shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="truncate">{spot.area}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Description */}
      {spot.description && (
        <p className="text-[12px] text-slate-700 dark:text-slate-300/90 leading-snug">{spot.description}</p>
      )}

      {/* Known-for chips */}
      {known.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="mr-0.5 inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500">
            <Tag size={10} /> Known for
          </span>
          {known.map((k, i) => (
            <span
              key={`${k}-${i}`}
              className="rounded-md border border-slate-900/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-slate-700 dark:text-slate-300"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      {/* Action row */}
      <div className="mt-1 flex flex-wrap items-center gap-1.5 border-t border-slate-900/8 dark:border-white/5 pt-2">
        {spot.links?.googleMaps && (
          <a
            href={spot.links.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:border-sky-400/60 dark:hover:border-sky-400/40 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] touch-manipulation"
            title={`Open ${spot.name} on Google Maps`}
          >
            <MapIcon size={12} className="text-sky-600 dark:text-sky-300" />
            Google Maps
            <ExternalLink size={10} className="text-slate-400 dark:text-slate-400" />
          </a>
        )}
        {spot.links?.googleSearch && (
          <a
            href={spot.links.googleSearch}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:border-fuchsia-400/60 dark:hover:border-fuchsia-400/40 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] touch-manipulation"
            title={`Search ${spot.name} on Google`}
          >
            <GoogleGlyph size={11} />
            Search
          </a>
        )}
      </div>
    </li>
  )
}

/* ------------------------------------------------------------------ *
 * Main panel                                                           *
 * ------------------------------------------------------------------ */
function ShoppingPanelInner({ destination }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('all')
  const reqIdRef = useRef(0)

  useEffect(() => {
    if (!destination) {
      setData(null)
      return
    }
    const myReq = ++reqIdRef.current
    let cancelled = false
    setLoading(true)
    setError(false)
    setFilter('all')

    getPlaceShopping({ place: destination })
      .then((res) => {
        if (cancelled || reqIdRef.current !== myReq) return
        const safeSpots = Array.isArray(res?.spots)
          ? res.spots.filter((s) => s && typeof s.name === 'string' && s.name.trim())
          : []
        if (safeSpots.length === 0) {
          setError(true)
          setData(null)
        } else {
          setData({ ...res, spots: safeSpots })
        }
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [destination])

  // Build filter chips & counts.
  const counts = useMemo(() => {
    const c = { all: 0 }
    for (const s of data?.spots || []) {
      c.all += 1
      c[s.type] = (c[s.type] || 0) + 1
    }
    return c
  }, [data])

  const visible = useMemo(() => {
    if (!data?.spots) return []
    if (filter === 'all') return data.spots
    return data.spots.filter((s) => s.type === filter)
  }, [data, filter])

  if (!destination) return null

  return (
    <div
      className="mb-6 sm:mb-8 rounded-2xl border border-slate-900/10 dark:border-white/10 glass p-4 sm:p-5 animate-slide-up w-full min-w-0"
      style={{ animationDelay: '0.18s' }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-500/25 dark:to-orange-500/15 border border-amber-400/60 dark:border-amber-500/30 ring-1 ring-white/40 dark:ring-white/10 flex items-center justify-center">
          <ShoppingBag
            size={16}
            className={`text-amber-700 dark:text-amber-300 ${loading ? 'animate-pulse' : ''}`}
          />
        </div>
        <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white truncate">
          Shopping in {destination}
        </h3>
        {data?.source && (
          <span
            className={`ml-auto hidden xs:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              data.source.includes('osm')
                ? 'border-emerald-400/60 dark:border-emerald-400/30 bg-emerald-100/80 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : data.source === 'generic'
                ? 'border-slate-400/60 dark:border-slate-400/30 bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-300'
                : 'border-amber-400/60 dark:border-amber-400/30 bg-amber-100/80 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
            }`}
          >
            <Sparkles size={9} />
            {data.source.includes('osm')
              ? 'Live + curated'
              : data.source === 'generic'
              ? 'Generic'
              : 'Curated'}
          </span>
        )}
      </div>

      <p className="mb-3 text-xs text-slate-600 dark:text-slate-400 leading-snug">
        {data?.summary
          ? data.summary
          : 'Best places to shop near your destination — bazaars, malls and craft hubs.'}
      </p>

      {/* Loading skeleton */}
      {loading && !data && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-slate-900/8 dark:border-white/8 bg-white/40 dark:bg-white/[0.02] p-3"
            >
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-slate-900/5 dark:bg-white/5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-900/5 dark:bg-white/5" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-900/5 dark:bg-white/5" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-900/5 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error / empty state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-900/8 dark:border-white/8 bg-white/40 dark:bg-white/[0.02] p-6 text-center">
          <ShoppingBag size={22} className="text-slate-400 dark:text-slate-500" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Couldn't load shopping suggestions for this place right now.
          </p>
          <button
            type="button"
            onClick={() => {
              setError(false)
              setLoading(true)
              getPlaceShopping({ place: destination })
                .then((res) => {
                  if (!res?.spots?.length) setError(true)
                  else setData(res)
                })
                .catch(() => setError(true))
                .finally(() => setLoading(false))
            }}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-slate-900/15 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-amber-400/60 dark:hover:border-amber-400/40 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-slate-900 dark:hover:text-white transition active:scale-[0.97] touch-manipulation"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {/* Loaded */}
      {!loading && !error && data?.spots?.length > 0 && (
        <>
          {/* Filter pills */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5 border-b border-slate-900/8 dark:border-white/5 pb-3">
            <FilterPill
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              count={counts.all}
            >
              All
            </FilterPill>
            {Object.keys(TYPE_META).map((t) => {
              const c = counts[t] || 0
              if (c === 0) return null
              const meta = TYPE_META[t]
              return (
                <FilterPill
                  key={t}
                  active={filter === t}
                  onClick={() => setFilter(t)}
                  count={c}
                >
                  {meta.label}
                </FilterPill>
              )
            })}
          </div>

          <ul className="space-y-2">
            {visible.map((s, i) => (
              <ShopSpotCard key={`${s.name}-${i}`} spot={s} idx={i} />
            ))}
          </ul>

          {/* Provider links — search the whole destination */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-900/8 dark:border-white/8 pt-3">
            <span className="mr-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500">
              <Sparkles size={11} />
              All shopping in {destination}
            </span>
            {data.links?.googleMaps && (
              <a
                href={data.links.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:border-sky-400/60 dark:hover:border-sky-400/40 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] touch-manipulation"
                title="Browse all shopping on Google Maps"
              >
                <MapIcon size={12} className="text-sky-600 dark:text-sky-300" />
                Google Maps
                <ExternalLink size={10} className="text-slate-400 dark:text-slate-400" />
              </a>
            )}
            {data.links?.googleSearch && (
              <a
                href={data.links.googleSearch}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:border-fuchsia-400/60 dark:hover:border-fuchsia-400/40 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] touch-manipulation"
                title="Search on Google"
              >
                <GoogleGlyph size={11} />
                Google Search
                <ExternalLink size={10} className="text-slate-400 dark:text-slate-400" />
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function ShoppingPanel(props) {
  return (
    <ShoppingErrorBoundary>
      <ShoppingPanelInner {...props} />
    </ShoppingErrorBoundary>
  )
}
