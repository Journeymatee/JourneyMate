import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, ArrowRight, Zap, TrendingUp, Navigation, X, Check, Users } from 'lucide-react'
import { filterCitiesSync, searchCitiesAPI } from '../data/indianCities'
import { POPULAR_DESTINATIONS } from '../services/travelService'

/* ------------------------------------------------------------------ */
/*  Dropdown                                                          */
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
/*  Controlled city input — single state, no value-clearing weirdness */
/* ------------------------------------------------------------------ */

function CityInput({
  label, accent, ringColor, value, onChange, exclude, placeholder,
}) {
  const [open, setOpen] = useState(false)
  const [apiItems, setApiItems] = useState([])
  const [apiLoading, setApiLoading] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
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
        className={`flex items-center gap-3 px-4 py-3.5 sm:py-4 rounded-2xl bg-white/5 hover:bg-white/[0.07] border border-white/10 transition-all ${ringColor} ${open ? 'ring-2' : ''}`}
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
/*  Hero                                                              */
/* ------------------------------------------------------------------ */

export default function HeroSearch({ onSearch, loading }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [userCount, setUserCount] = useState(null)

  useEffect(() => {
    import('../api/client').then(({ default: api }) => {
      api.get('/auth/stats')
        .then(({ data }) => { if (data?.userCount != null) setUserCount(data.userCount) })
        .catch(() => {})
    })
  }, [])

  const handleSearch = () => {
    if (!from.trim() || !to.trim() || loading) return
    onSearch(from.trim(), to.trim())
  }

  const handleQuickRoute = (route) => {
    setFrom(route.from); setTo(route.to)
    onSearch(route.from, route.to)
  }

  const swapCities = () => {
    setFrom(to); setTo(from)
  }

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center mesh-bg pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 safe-pad">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-48 xs:w-72 sm:w-96 h-48 xs:h-72 sm:h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 xs:w-72 sm:w-96 h-48 xs:h-72 sm:h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-indigo-500/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass border border-white/10 mb-5 sm:mb-8 animate-fade-in">
          <Zap size={12} className="text-amber-400 shrink-0" />
          <span className="text-[11px] xs:text-xs sm:text-sm text-slate-300 font-medium">Compare Budget vs Luxury in seconds</span>
          <TrendingUp size={12} className="text-green-400 shrink-0" />
        </div>

        {/* Hero title — fluid size so it never wraps weirdly on any device */}
        <h1 className="hero-title font-display font-bold text-white mb-4 sm:mb-6 animate-slide-up">
          Travel Smart,
          <br />
          <span className="shimmer-silver">Save Big</span>
          <span className="text-slate-500"> or </span>
          <span className="shimmer-gold">Live Gold</span>
        </h1>
        <p className="text-slate-400 text-sm xs:text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in px-2" style={{ animationDelay: '0.2s' }}>
          Side-by-side comparison of budget and luxury packages across every state, every city, every route in India.
        </p>

        {/* Search card */}
        <div className="glass rounded-3xl p-2 sm:p-3 animate-slide-up shadow-2xl relative z-20" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-stretch">
            <CityInput
              label="From"
              accent="text-green-400"
              ringColor="ring-green-500/30"
              value={from}
              onChange={setFrom}
              exclude={to}
              placeholder="Origin city, town or village"
            />

            {/* Swap */}
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

            {/* Mobile swap */}
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
              onChange={setTo}
              exclude={from}
              placeholder="Destination — e.g. Goa, Kaziranga"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={!from || !to || loading}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={18} />
                  <span>Compare</span>
                </>
              )}
            </button>
          </div>

          {(from || to) && (
            <div className="sm:hidden mt-2 px-2 pb-1 flex items-center justify-center gap-2 text-xs text-slate-400">
              {from && <span className="text-green-400 font-medium truncate max-w-[35vw]">{from}</span>}
              {from && to && <Navigation size={11} className="text-slate-500 rotate-90" />}
              {to && <span className="text-amber-400 font-medium truncate max-w-[35vw]">{to}</span>}
            </div>
          )}
        </div>

        {/* Popular routes — scrollable row on mobile */}
        <div className="mt-6 sm:mt-8 animate-fade-in relative z-10" style={{ animationDelay: '0.5s' }}>
          <p className="text-xs text-slate-500 font-medium text-center mb-3">Popular routes:</p>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 justify-start sm:justify-center sm:flex-wrap">
            {POPULAR_DESTINATIONS.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                type="button"
                onClick={() => handleQuickRoute(route)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/8 hover:border-white/20 text-xs text-slate-400 hover:text-white transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                <span>{route.emoji}</span>
                <span>{route.from} → {route.to}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats — all clickable */}
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
