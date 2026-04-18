import React, { useState, useEffect } from 'react'
import { MapPin, ChevronRight, Zap, TrendingUp, Clock, Loader2, RefreshCw, Train, Plane } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

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

  return (
    <div className="min-h-[100dvh] mesh-bg pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-6">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-sm text-slate-400 font-medium">Live from our route database</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <h1 className="hero-title font-display font-bold text-white mb-4 leading-tight">
            Popular <span className="shimmer-gold">Routes</span>
          </h1>
          <p className="text-slate-400 text-sm xs:text-base sm:text-lg max-w-2xl mx-auto">
            Hand-researched routes across India — real prices, real transport options, real itineraries.
          </p>
        </div>

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
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center mb-8 sm:mb-12">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTag(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                    activeTag === cat
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-lg shadow-green-500/20'
                      : 'glass border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat}
                  {cat !== 'All' && (
                    <span className="ml-1.5 opacity-60">
                      ({routes.filter(r => r.tag === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Route count */}
            <p className="text-center text-xs text-slate-600 mb-6">
              Showing {filtered.length} of {routes.length} routes
            </p>

            {/* Route Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map((route) => {
                const savings = route.goldPrice - route.silverPrice
                const tagColor = TAG_COLORS[route.tag] || TAG_COLORS.Explore
                const emoji = TAG_EMOJIS[route.tag] || '🗺️'
                return (
                  <div
                    key={`${route.from}-${route.to}`}
                    className="glass rounded-3xl overflow-hidden border border-white/8 hover:border-white/15 group hover:scale-[1.01] transition-all duration-300 flex flex-col"
                  >
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
                        Silver saves you <span className="text-green-400 font-bold">₹{savings.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="mt-auto">
                        <button
                          type="button"
                          onClick={() => handleCompare(route)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-green-500/20 hover:-translate-y-0.5"
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
              <div className="text-center py-16">
                <p className="text-slate-500 text-sm">No routes found for "{activeTag}" category.</p>
                <button
                  type="button"
                  onClick={() => setActiveTag('All')}
                  className="mt-4 text-green-400 text-sm font-semibold hover:underline"
                >
                  Show all routes
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
