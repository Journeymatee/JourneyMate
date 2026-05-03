import React, { useState, useEffect, useMemo } from 'react'
import { MapPin, ChevronRight, Zap, TrendingUp, Clock, Loader2, RefreshCw, Train, Plane, Compass, IndianRupee, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import PageHero from '../components/PageHero'
import SectionHeader from '../components/SectionHeader'
import { getStatePhoto } from '../utils/getStatePhoto'
import PhotoLightbox from '../components/PhotoLightbox'

const TAG_COLORS = {
  Beach:      'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Mountains:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Heritage:   'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Adventure:  'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Hills:      'text-lime-400 bg-lime-500/10 border-lime-500/20',
  Spiritual:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Weekend:    'text-teal-400 bg-teal-500/10 border-teal-500/20',
  Scenic:     'text-green-400 bg-green-500/10 border-green-500/20',
  Royal:      'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Explore:    'text-slate-400 bg-slate-500/10 border-slate-500/20',
  Backwaters: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
}

const TAG_EMOJIS = {
  Beach:      '🏖️',
  Mountains:  '🏔️',
  Heritage:   '🏰',
  Adventure:  '⛷️',
  Hills:      '🌿',
  Spiritual:  '🕉️',
  Weekend:    '🌊',
  Scenic:     '☕',
  Royal:      '🏛️',
  Explore:    '🗺️',
  Backwaters: '🚤',
}

const CATEGORIES = ['All', 'Beach', 'Mountains', 'Heritage', 'Adventure', 'Hills', 'Spiritual', 'Weekend', 'Scenic', 'Royal']

export default function PopularRoutes() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const navigate = useNavigate()

  const fetchRoutes = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/trips/popular')
      setRoutes(data.routes || [])
    } catch (err) {
      setError('Could not load routes. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRoutes() }, [])

  const filtered = activeTag === 'All'
    ? routes
    : routes.filter((r) => r.tag === activeTag)

  const handleCompare = (route) => {
    navigate('/', { state: { from: route.from, to: route.to, autoSearch: true } })
  }

  /**
   * Headline stats shown as glass chips inside the hero — communicates
   * scale at a glance without forcing the user to scroll.
   */
  const heroStats = useMemo(() => {
    if (!routes.length) return null
    const cities = new Set()
    let avgSavings = 0
    routes.forEach((r) => {
      cities.add(r.from)
      cities.add(r.to)
      avgSavings += (r.goldPrice || 0) - (r.silverPrice || 0)
    })
    return {
      routeCount: routes.length,
      cityCount: cities.size,
      avgSavings: Math.round(avgSavings / Math.max(routes.length, 1)),
    }
  }, [routes])

  return (
    <div className="min-h-[100dvh] page-bg-cyan">
      <PageHero
        image="/photos/hero-himalaya.png"
        imagePos="center 30%"
        accent="cyan"
        size="compact"
        eyebrow="Live from our route database"
        eyebrowIcon={<TrendingUp size={14} className="text-cyan-400" />}
        title="Popular"
        highlight="Routes"
        subtitle="Hand-researched journeys across India — real prices, real transport, day-by-day itineraries."
      >
        {heroStats && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-cyan-200">
              <Compass size={12} className="text-cyan-300" />
              {heroStats.routeCount} curated routes
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-emerald-200">
              <MapPin size={12} className="text-emerald-300" />
              {heroStats.cityCount}+ cities
            </span>
            {heroStats.avgSavings > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-amber-200">
                <IndianRupee size={12} className="text-amber-300" />
                Avg ₹{heroStats.avgSavings.toLocaleString('en-IN')} silver savings
              </span>
            )}
          </div>
        )}
      </PageHero>

      <div className="max-w-7xl 3xl:max-w-[1680px] 4xl:max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 pb-16 sm:pb-20 pt-8 sm:pt-10">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={32} className="text-green-400 animate-spin" />
            <p className="text-slate-500 text-sm">Loading routes from database…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="glass rounded-2xl p-8 border border-red-500/20">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchRoutes}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 hover:bg-white/12 text-white text-sm font-semibold transition-all"
              >
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && routes.length > 0 && (
          <>
            <SectionHeader
              icon={<Filter size={16} strokeWidth={2.4} />}
              accent="cyan"
              eyebrow="Filter the journeys"
              title="Pick a vibe"
              subtitle="Beach, mountains, heritage, weekend escapes — narrow down to the trip that fits you."
              badge={
                <span className="hidden xs:inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  {filtered.length} of {routes.length}
                </span>
              }
              divider
              className="!mb-4"
            />

            {/* Category Filter — sticky, glass-rail look */}
            <div className="sticky top-16 sm:top-20 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-8 sm:mb-10 backdrop-blur-md bg-slate-950/55 border-y border-white/5 py-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isActive = activeTag === cat
                  const count = cat === 'All' ? routes.length : routes.filter(r => r.tag === cat).length
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveTag(cat)}
                      aria-pressed={isActive}
                      className={`group relative px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-200 border ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-transparent shadow-lg shadow-cyan-500/30 scale-[1.02]'
                          : 'glass border-white/10 text-slate-300 hover:text-white hover:border-white/25 hover:bg-white/8'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {cat !== 'All' && (
                          <span aria-hidden className="text-[13px] leading-none">
                            {TAG_EMOJIS[cat] || '✨'}
                          </span>
                        )}
                        {cat}
                        <span className={`text-[10px] font-bold tabular-nums ${isActive ? 'opacity-90' : 'opacity-50'}`}>
                          {count}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Route Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
              {filtered.map((route, idx) => {
                const savings = route.goldPrice - route.silverPrice
                const tagColor = TAG_COLORS[route.tag] || TAG_COLORS.Explore
                const emoji = TAG_EMOJIS[route.tag] || '🗺️'
                const photo = getStatePhoto({
                  stateCode: route.toStateCode,
                  city: route.to,
                })
                return (
                  <div
                    key={`${route.from}-${route.to}`}
                    className="glass rounded-3xl overflow-hidden border border-white/8 hover:border-cyan-400/30 group hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 flex flex-col relative animate-slide-up"
                    style={{ animationDelay: `${Math.min(idx, 9) * 35}ms` }}
                  >
                    {/* Subtle hover glow */}
                    <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent" />
                    {/* Destination state landscape — Ken-Burns on hover,
                        click to expand into a full-size lightbox. */}
                    {photo?.file && (
                      <div className="relative h-36 sm:h-40 overflow-hidden">
                        <PhotoLightbox
                          src={photo.file}
                          alt={`${photo.spot} — ${photo.name}`}
                          caption={photo.spot}
                          subcaption={photo.name}
                          badge={photo.biome}
                          wrapperClassName="absolute inset-0"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        >
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                          <div className="pointer-events-none absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-bold text-cyan-300/95">
                                {photo.name}
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-white truncate drop-shadow">
                                {photo.spot}
                              </div>
                            </div>
                          </div>
                        </PhotoLightbox>
                      </div>
                    )}

                    {/* Card header */}
                    <div className="bg-gradient-to-br from-white/5 to-transparent p-5 sm:p-6 border-b border-white/6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center text-2xl shrink-0">
                          {emoji}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${tagColor}`}>
                          {route.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-white mb-1">
                        <MapPin size={14} className="text-green-400 shrink-0" />
                        <span className="font-semibold text-sm sm:text-base truncate">{route.from}</span>
                        <ChevronRight size={14} className="text-slate-500 shrink-0" />
                        <MapPin size={14} className="text-amber-400 shrink-0" />
                        <span className="font-semibold text-sm sm:text-base truncate">{route.to}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                        <span className="flex items-center gap-1"><Clock size={11} />{route.duration}</span>
                        {route.transport && (
                          <span className="flex items-center gap-1">
                            {route.transport.toLowerCase().includes('flight')
                              ? <Plane size={11} /> : <Train size={11} />}
                            {route.transport}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col">
                      {/* Highlights from live API */}
                      {route.highlights && route.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {route.highlights.map((h) => (
                            <span key={h} className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full glass border border-white/8 text-slate-400 truncate max-w-[120px]">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price comparison */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-xl bg-green-500/8 border border-green-500/15 p-3 text-center">
                          <div className="text-[10px] text-green-400 font-semibold uppercase mb-1">Silver</div>
                          <div className="font-display font-bold text-base sm:text-lg text-white tabular-nums">
                            ₹{route.silverPrice.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="rounded-xl bg-amber-500/8 border border-amber-500/15 p-3 text-center">
                          <div className="text-[10px] text-amber-400 font-semibold uppercase mb-1">Gold</div>
                          <div className="font-display font-bold text-base sm:text-lg text-white tabular-nums">
                            ₹{route.goldPrice.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-xs text-slate-500 mb-5">
                        Silver saves you <span className="text-cyan-400 font-bold">₹{savings.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="mt-auto">
                        <button
                          type="button"
                          onClick={() => handleCompare(route)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5"
                        >
                          <Zap size={15} />
                          Compare Plans
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="mt-2">
                <div className="mx-auto max-w-md text-center glass rounded-3xl border border-white/8 px-6 py-12">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                    <Compass size={22} className="text-cyan-300" />
                  </div>
                  <h3
                    className="text-lg font-semibold text-white mb-1"
                    style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}
                  >
                    No routes for "{activeTag}" yet
                  </h3>
                  <p className="text-slate-500 text-sm mb-5">
                    We're still curating this category. Try another vibe in the meantime.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTag('All')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 hover:-translate-y-0.5 transition-all"
                  >
                    Show all routes
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
