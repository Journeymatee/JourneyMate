import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Compass,
  Filter,
  IndianRupee,
  Loader2,
  MapPin,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'

import api from '../api/client'
import PageHero from '../components/PageHero'
import SectionHeader from '../components/SectionHeader'
import { Button, Card, Heading, Pill } from '../components/ui'
import RouteCard from '../components/popularRoutes/RouteCard'
import {
  CATEGORIES,
  TAG_EMOJIS,
} from '../data/popularRoutesContent'

/**
 * Popular Routes — orchestrator. Fetches `/trips/popular`, holds the
 * active filter state, and composes the page from `<PageHero>`,
 * primitive surfaces, and the `<RouteCard>` feature component.
 *
 *   page → feature components → primitives → data
 */
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
    } catch {
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
    navigate('/', {
      state: { from: route.from, to: route.to, autoSearch: true },
    })
  }

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
    <main className="min-h-[100dvh] page-bg-cyan">
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
            <Pill accent="cyan" variant="soft" icon={<Compass size={12} />}>
              {heroStats.routeCount} curated routes
            </Pill>
            <Pill accent="emerald" variant="soft" icon={<MapPin size={12} />}>
              {`${heroStats.cityCount}+ cities`}
            </Pill>
            {heroStats.avgSavings > 0 && (
              <Pill accent="amber" variant="soft" icon={<IndianRupee size={12} />}>
                {`Avg \u20B9${heroStats.avgSavings.toLocaleString('en-IN')} silver savings`}
              </Pill>
            )}
          </div>
        )}
      </PageHero>

      <div className="max-w-7xl 3xl:max-w-[1680px] 4xl:max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 pb-16 sm:pb-20 pt-8 sm:pt-10">
        {loading && <PopularRoutesLoading />}
        {!loading && error && <PopularRoutesError onRetry={fetchRoutes} message={error} />}

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

            <CategoryFilterBar
              routes={routes}
              activeTag={activeTag}
              onChange={setActiveTag}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
              {filtered.map((route, idx) => (
                <RouteCard
                  key={`${route.from}-${route.to}`}
                  route={route}
                  onCompare={handleCompare}
                  animationDelay={Math.min(idx, 9) * 35}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <EmptyCategory tag={activeTag} onClear={() => setActiveTag('All')} />
            )}
          </>
        )}
      </div>
    </main>
  )
}

/* ─── private subcomponents ──────────────────────────────────────── */

function PopularRoutesLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 size={32} className="text-green-400 animate-spin" aria-hidden />
      <p className="text-slate-500 text-sm">Loading routes from database…</p>
    </div>
  )
}

function PopularRoutesError({ message, onRetry }) {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <Card variant="glass" padding="lg" className="!border-red-500/20">
        <p className="text-red-400 text-sm mb-4">{message}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          iconLeft={<RefreshCw size={14} />}
        >
          Try again
        </Button>
      </Card>
    </div>
  )
}

function CategoryFilterBar({ routes, activeTag, onChange }) {
  return (
    <div className="sticky top-16 sm:top-20 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-8 sm:mb-10 backdrop-blur-md bg-slate-950/55 border-y border-white/5 py-3">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeTag === cat
          const count =
            cat === 'All'
              ? routes.length
              : routes.filter((r) => r.tag === cat).length
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
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
                    {TAG_EMOJIS[cat] || '\u2728'}
                  </span>
                )}
                {cat}
                <span
                  className={`text-[10px] font-bold tabular-nums ${
                    isActive ? 'opacity-90' : 'opacity-50'
                  }`}
                >
                  {count}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EmptyCategory({ tag, onClear }) {
  return (
    <div className="mt-2">
      <Card variant="glass" padding="lg" className="mx-auto max-w-md text-center !rounded-3xl">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
          <Compass size={22} className="text-cyan-300" aria-hidden />
        </div>
        <Heading level={3} size="sm" className="mb-1">
          No routes for &ldquo;{tag}&rdquo; yet
        </Heading>
        <p className="text-slate-500 text-sm mb-5">
          We&apos;re still curating this category. Try another vibe in the
          meantime.
        </p>
        <Button
          variant="primary"
          accent="blue"
          size="sm"
          onClick={onClear}
          iconRight={<ChevronRight size={14} />}
        >
          Show all routes
        </Button>
      </Card>
    </div>
  )
}
