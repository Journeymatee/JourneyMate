import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, ArrowRight, Zap, TrendingUp, Navigation, X, Check, Sparkles, AlertCircle } from 'lucide-react'
import { filterCitiesSync, searchCitiesAPI } from '../data/indianCities'
import HeroBackground from './HeroBackground'
import { TRIP_TYPES } from '../data/tripVibes'

/* ------------------------------------------------------------------ */
/*  City dropdown                                                     */
/* ------------------------------------------------------------------ */

function CityDropdown({ open, items, loading, accent, onPick, onClose }) {
  if (!open) return null
  return (
    <div
      role="listbox"
      className="absolute left-0 right-0 top-full mt-1.5 z-[80] rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-950/95"
      style={{ maxHeight: 340, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {loading && (
        <div className="flex items-center gap-2 px-4 py-2 text-[11px] text-slate-500 border-b border-white/5">
          <div className="w-3 h-3 border border-slate-500 border-t-white rounded-full animate-spin" />
          Searching India…
        </div>
      )}

      {items.length === 0 && !loading && (
        <div className="px-4 py-4 text-center text-xs text-slate-500">
          Type at least 2 characters to search any village or town in India.
        </div>
      )}

      {items.map((it, i) => (
        <button
          key={`${it.name}-${it.source || 'sync'}-${i}`}
          type="button"
          role="option"
          onMouseDown={(e) => { e.preventDefault(); onPick(it.name) }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-left border-b border-white/5 last:border-0"
        >
          <MapPin size={14} className={`shrink-0 ${accent}`} />
          <span className="flex-1 min-w-0 truncate">
            {it.name}
            {it.state && (
              <span className="text-slate-500 text-[10px] ml-2 font-normal">{it.state}</span>
            )}
          </span>
          {it.source === 'nominatim' && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">OSM</span>
          )}
          {it.source === 'db' && it.type && (
            <span className="text-[9px] uppercase tracking-wider text-slate-600 shrink-0">{it.type}</span>
          )}
        </button>
      ))}

      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClose() }}
        className="w-full text-xs text-slate-500 hover:text-slate-300 py-2 text-center border-t border-white/5 bg-slate-950/60"
      >
        Close
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  City input                                                        */
/* ------------------------------------------------------------------ */

function CityInput({
  label, accent, ringColor, value, onChange, exclude, placeholder, error, inputRef: forwardedRef,
}) {
  const [open, setOpen] = useState(false)
  const [apiItems, setApiItems] = useState([])
  const [apiLoading, setApiLoading] = useState(false)
  const wrapRef = useRef(null)
  const internalInputRef = useRef(null)
  const inputRef = forwardedRef || internalInputRef
  const timerRef = useRef(null)

  const syncItems = useMemo(() => {
    return filterCitiesSync(value, exclude).slice(0, 6).map((name) => ({
      name,
      source: 'sync',
    }))
  }, [value, exclude])

  const merged = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const it of syncItems) {
      if (!seen.has(it.name.toLowerCase())) {
        out.push(it); seen.add(it.name.toLowerCase())
      }
    }
    for (const it of apiItems) {
      const k = it.name.toLowerCase()
      if (!seen.has(k) && k !== exclude.toLowerCase()) {
        out.push(it); seen.add(k)
      }
    }
    return out.slice(0, 10)
  }, [syncItems, apiItems, exclude])

  const fireApiLookup = useCallback((q) => {
    clearTimeout(timerRef.current)
    if (q.trim().length < 2) {
      setApiItems([]); setApiLoading(false); return
    }
    setApiLoading(true)
    timerRef.current = setTimeout(async () => {
      const r = await searchCitiesAPI(q)
      setApiItems(r)
      setApiLoading(false)
    }, 300)
  }, [])

  useEffect(() => {
    const onDocDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('touchstart', onDocDown)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('touchstart', onDocDown)
    }
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const onInputChange = (e) => {
    const v = e.target.value
    onChange(v)
    setOpen(true)
    fireApiLookup(v)
  }

  const onFocus = () => {
    setOpen(true)
    if (value.length >= 2) fireApiLookup(value)
  }

  const pick = (name) => {
    onChange(name)
    setApiItems([])
    setOpen(false)
    inputRef.current?.blur()
  }

  const clear = () => {
    onChange('')
    setApiItems([])
    inputRef.current?.focus()
  }

  return (
    <div className="relative flex-1 min-w-0" ref={wrapRef}>
      <div
        className={`flex items-center gap-3 px-4 py-3.5 sm:py-4 rounded-2xl bg-white/5 hover:bg-white/[0.07] border transition-all ${
          error
            ? 'border-red-500/45 ring-2 ring-red-500/30'
            : `border-white/10 ${ringColor} ${open ? 'ring-2' : ''}`
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        <MapPin size={18} className={`${accent} shrink-0`} />
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">{label}</div>
          <input
            ref={inputRef}
            className="w-full bg-transparent text-white font-medium text-sm placeholder-slate-500 outline-none"
            placeholder={placeholder}
            value={value}
            onChange={onInputChange}
            onFocus={onFocus}
            autoComplete="off"
            spellCheck={false}
            inputMode="search"
          />
        </div>
        {value && !open && <Check size={14} className="text-emerald-400 shrink-0" />}
        {value && open && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); clear() }}
            className="shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
            aria-label={`Clear ${label}`}
          >
            <X size={12} />
          </button>
        )}
      </div>

      <CityDropdown
        open={open}
        items={merged}
        loading={apiLoading}
        accent={accent}
        onPick={pick}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero — single search block + trip-type chips that *are* the CTA    */
/* ------------------------------------------------------------------ */

export default function HeroSearch({ onSearch, loading, initialTripType = null, initialVibes = [] }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [tripType, setTripType] = useState(initialTripType)
  const [vibes, setVibes] = useState(Array.isArray(initialVibes) ? initialVibes : [])
  const [validation, setValidation] = useState(null)   // { from?: bool, to?: bool, msg }
  const [userCount, setUserCount] = useState(null)
  const fromRef = useRef(null)
  const toRef = useRef(null)

  // Late hydration (server preferences arrive after first render).
  useEffect(() => {
    if (initialTripType && !tripType) setTripType(initialTripType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTripType])
  useEffect(() => {
    if (Array.isArray(initialVibes) && initialVibes.length > 0 && vibes.length === 0) {
      setVibes(initialVibes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVibes])

  useEffect(() => {
    import('../api/client').then(({ default: api }) => {
      api.get('/auth/stats')
        .then(({ data }) => { if (data?.userCount != null) setUserCount(data.userCount) })
        .catch(() => {})
    })
  }, [])

  const swapCities = () => { setFrom(to); setTo(from) }

  /** Toggle a trip-type chip — clicking the active one clears it. */
  const toggleType = (typeId) => {
    setValidation(null)
    setTripType((cur) => (cur === typeId ? null : typeId))
  }

  /**
   * The single Compare button. Validates from/to first; trip-type is OPTIONAL
   * (no chip selected → backend serves the baseline plan with no overrides).
   */
  const handleCompare = () => {
    if (loading) return
    const f = String(from || '').trim()
    const t = String(to || '').trim()
    if (!f || !t) {
      setValidation({
        from: !f,
        to: !t,
        msg: !f && !t
          ? 'Add origin and destination first.'
          : !f
            ? 'Add an origin city first.'
            : 'Add a destination city first.',
      })
      if (!f) fromRef.current?.focus()
      else if (!t) toRef.current?.focus()
      return
    }
    setValidation(null)
    onSearch(f, t, undefined, { tripType, vibes })
  }

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 safe-pad overflow-hidden">
      <HeroBackground />
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-48 xs:w-72 sm:w-96 h-48 xs:h-72 sm:h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 xs:w-72 sm:w-96 h-48 xs:h-72 sm:h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-indigo-500/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        {/* Hero text */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass border border-white/10 mb-4 sm:mb-6 animate-fade-in">
            <Zap size={12} className="text-amber-400 shrink-0" />
            <span className="text-[11px] xs:text-xs sm:text-sm text-slate-300 font-medium">Compare Budget vs Luxury in seconds</span>
            <TrendingUp size={12} className="text-green-400 shrink-0" />
          </div>
          <h1 className="hero-title font-display font-bold text-white mb-3 sm:mb-4 animate-slide-up">
            Travel Smart,
            <br />
            <span className="shimmer-silver">Save Big</span>
            <span className="text-slate-500"> or </span>
            <span className="shimmer-gold">Live Gold</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base md:text-lg mb-7 sm:mb-9 max-w-xl mx-auto leading-relaxed animate-fade-in px-2" style={{ animationDelay: '0.2s' }}>
            Side-by-side comparison of budget and luxury packages across India.
          </p>
        </div>

        {/* Single search block — inputs first, then trip-type chips that act as Compare */}
        <div
          className="hero-search-card glass rounded-3xl border border-white/10 p-3 sm:p-4 shadow-2xl shadow-black/30 animate-slide-up text-left"
          className="glass rounded-3xl border border-white/10 p-3 sm:p-4 shadow-2xl shadow-black/30 animate-slide-up text-left"
          style={{ animationDelay: '0.3s' }}
        >
          {/* From / To inputs */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-stretch">
            <CityInput
              label="From"
              accent="text-green-400"
              ringColor="ring-green-500/30"
              value={from}
              onChange={(v) => { setFrom(v); if (validation?.from) setValidation(null) }}
              exclude={to}
              placeholder="Origin city, town or village"
              error={!!validation?.from}
              inputRef={fromRef}
            />

            <div className="hidden sm:flex items-center justify-center w-10 shrink-0">
              <button
                type="button"
                onClick={swapCities}
                title="Swap cities"
                className="w-9 h-9 rounded-full bg-white/6 border border-white/10 flex items-center justify-center hover:bg-white/12 hover:border-white/20 transition-all hover:rotate-180 duration-300"
              >
                <ArrowRight size={14} className="text-slate-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={swapCities}
              className="sm:hidden self-center -my-1 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300"
              aria-label="Swap cities"
            >
              <ArrowRight size={14} className="rotate-90" />
            </button>

            <CityInput
              label="To"
              accent="text-amber-400"
              ringColor="ring-amber-500/30"
              value={to}
              onChange={(v) => { setTo(v); if (validation?.to) setValidation(null) }}
              exclude={from}
              placeholder="Destination — e.g. Goa, Kaziranga"
              error={!!validation?.to}
              inputRef={toRef}
            />
          </div>

          {/* Validation hint when user clicks a chip without filling cities */}
          {validation && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-[12px] text-red-100">
              <AlertCircle size={14} className="text-red-300 shrink-0" />
              <span className="leading-snug">{validation.msg}</span>
            </div>
          )}

          {/* Mobile-only echo of from → to */}
          {(from || to) && (
            <div className="sm:hidden mt-2 px-1 flex items-center justify-center gap-2 text-xs text-slate-400">
              {from && <span className="text-green-400 font-medium truncate max-w-[35vw]">{from}</span>}
              {from && to && <Navigation size={11} className="text-slate-500 rotate-90" />}
              {to && <span className="text-amber-400 font-medium truncate max-w-[35vw]">{to}</span>}
            </div>
          )}

          {/* Trip-type chips — selection only (optional filter) */}
          <div className="mt-4 sm:mt-5 pt-4 border-t border-white/8">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-slate-400">
                <Sparkles size={12} className="text-fuchsia-300" />
                Who&apos;s travelling? <span className="text-slate-600 normal-case font-medium tracking-normal">(optional)</span>
              </div>
              {tripType && (
                <button
                  type="button"
                  onClick={() => setTripType(null)}
                  className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-200 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
            <div
              role="radiogroup"
              aria-label="Trip type filter (optional)"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {TRIP_TYPES.map((t) => {
                const active = tripType === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={loading}
                    onClick={() => toggleType(t.id)}
                    className={`group relative overflow-hidden min-w-0 flex flex-col items-start gap-0.5 px-3 py-3 sm:py-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${
                      active
                        ? `${t.border} shadow-lg shadow-black/30 ring-2 ${t.ring}`
                        : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/25 hover:-translate-y-0.5'
                    } ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {active && (
                      <span aria-hidden className={`absolute inset-0 bg-gradient-to-br ${t.gradient} pointer-events-none`} />
                    )}

                    <div className="relative z-10 flex items-center gap-2 w-full min-w-0">
                      <span className="text-base sm:text-lg leading-none shrink-0" aria-hidden>{t.icon}</span>
                      <span className={`text-xs sm:text-sm font-bold truncate min-w-0 flex-1 ${active ? 'text-white' : 'text-slate-200'}`}>
                        {t.label}
                      </span>
                      {active && (
                        <Check size={12} className={`${t.accent} shrink-0`} aria-hidden />
                      )}
                    </div>
                    <span className={`relative z-10 hidden sm:block text-[10px] leading-snug truncate w-full ${active ? 'text-white/85' : 'text-slate-500'}`}>
                      {t.blurb}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Compare button — single CTA after From, To, and (optional) trip-type */}
            <button
              type="button"
              onClick={handleCompare}
              disabled={loading}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Comparing…</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Compare plans</span>
                  {tripType && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ml-1 rounded-full bg-white/15 border border-white/20">
                      {TRIP_TYPES.find((t) => t.id === tripType)?.icon}
                      {TRIP_TYPES.find((t) => t.id === tripType)?.short}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats — popular routes block remains removed */}
      <div className="relative z-[5] max-w-3xl w-full mt-10 sm:mt-16 animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <div className="glass rounded-2xl p-4 sm:p-6 border border-white/8">
          <div className="grid grid-cols-3 gap-0 text-center divide-x divide-white/8">
            {[
              { value: '₹12,500',                                           labelFull: 'Avg Savings with Silver', labelShort: 'Silver Savings', color: 'text-green-400', to: '/how-it-works' },
              { value: '600+',                                              labelFull: 'Cities Across India',     labelShort: 'Indian Cities',  color: 'text-slate-300', to: '/popular-routes' },
              { value: userCount != null ? `${userCount.toLocaleString('en-IN')}` : '…', labelFull: 'Registered Members', labelShort: 'Members', color: 'text-amber-400', to: '/blog' },
            ].map((stat) => (
              <Link
                key={stat.labelFull}
                to={stat.to}
                className="px-2 xs:px-3 sm:px-5 py-1 group cursor-pointer hover:opacity-90 transition-opacity flex flex-col items-center"
              >
                <div className={`font-display font-bold text-lg xs:text-xl sm:text-2xl lg:text-3xl ${stat.color} group-hover:scale-105 transition-transform tabular-nums`}>
                  {stat.value}
                </div>
                <div className="text-[9px] xs:text-[10px] sm:text-xs text-slate-500 mt-1 leading-snug group-hover:text-slate-400 transition-colors">
                  <span className="hidden sm:inline">{stat.labelFull}</span>
                  <span className="sm:hidden">{stat.labelShort}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
