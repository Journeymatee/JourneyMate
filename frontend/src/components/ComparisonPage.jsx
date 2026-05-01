import React, { useState, useEffect } from 'react'
import {
  Train, Plane, Hotel, Building, UtensilsCrossed, Star,
  ChevronRight, ChevronDown, Check, Calendar, MapPin, ArrowLeft,
  Sparkles, Shield, Coffee, Wifi, Car, Waves, Mountain,
  Route, X, ExternalLink, History, Clock, Ruler, Landmark, Loader2, AlertCircle,
  SlidersHorizontal, Scale, ChefHat
} from 'lucide-react'
import PlaceMap from './PlaceMap'
import RouteDirectionMap from './RouteDirectionMap'
import WeatherPanel from './WeatherPanel'
import { TripTypePicker, VibeChips } from './TripVibePicker'
import { findTripType, VIBES_BY_TYPE } from '../data/tripVibes'
import { getPlaceArticle } from '../services/travelService'

/* ------------------------------------------------------------------ */
/*  Perk icon helper                                                   */
/* ------------------------------------------------------------------ */
const PERK_ICONS = {
  'WiFi': Wifi, 'WiFi Available': Wifi, 'Free WiFi at Hostel': Wifi,
  'Airport Transfers': Car, 'Spa Access': Sparkles, 'Concierge': Star,
  'Concierge Service': Star, 'Daily Breakfast': Coffee, 'Breakfast Included': Coffee,
  'Free Breakfast': Coffee, 'Complimentary Breakfast': Coffee,
  'Beach Butler': Waves, 'Mountain': Mountain, 'Common Areas': Building,
  'default': Shield,
}
const PerkIcon = ({ perk }) => {
  const key = Object.keys(PERK_ICONS).find(k => k !== 'default' && perk.includes(k))
  const Icon = key ? PERK_ICONS[key] : PERK_ICONS.default
  return <Icon size={14} />
}

/* ------------------------------------------------------------------ */
/*  Booking platforms drawer                                           */
/* ------------------------------------------------------------------ */
function buildPlatforms(from, to, type) {
  const slug = (s) => (s || '').toLowerCase().replace(/\s+/g, '-')
  const enc  = (s) => encodeURIComponent(s || '')
  const f = from || '', t = to || ''

  const trains = [
    {
      name: 'IRCTC',          emoji: '🚂',
      tag: 'Official',        tagBg: 'bg-green-500/20 text-green-400',
      note: 'Official Indian Railways — lowest base price',
      url: 'https://www.irctc.co.in/nget/train-search',
      badge: 'Official',
    },
    {
      name: 'ixigo Trains',   emoji: '🟣',
      tag: 'Pre-filled',      tagBg: 'bg-blue-500/20 text-blue-400',
      note: 'Shows all trains + live seat availability',
      url: `https://www.ixigo.com/trains/${slug(f)}-to-${slug(t)}/10085`,
    },
    {
      name: 'Cleartrip',      emoji: '🔵',
      tag: 'Pre-filled',      tagBg: 'bg-blue-500/20 text-blue-400',
      note: 'Clean UI, easy seat selection',
      url: `https://www.cleartrip.com/trains/results/?from=${enc(f)}&to=${enc(t)}`,
    },
    {
      name: 'RailYatri',      emoji: '🔴',
      tag: 'Pre-filled',      tagBg: 'bg-blue-500/20 text-blue-400',
      note: 'PNR status + train tracking',
      url: `https://www.railyatri.in/train-between-stations?src=${enc(f)}&dst=${enc(t)}`,
    },
    {
      name: 'MakeMyTrip Rail', emoji: '🟠',
      note: 'Rewards + easy refunds',
      url: 'https://www.makemytrip.com/railways/',
    },
  ]

  const buses = [
    {
      name: 'RedBus',         emoji: '🚌',
      tag: 'Largest',         tagBg: 'bg-red-500/20 text-red-400',
      note: 'India\'s #1 bus booking platform',
      url: `https://www.redbus.in/bus-tickets/${slug(f)}-to-${slug(t)}/`,
    },
    {
      name: 'AbhiBus',        emoji: '🟢',
      note: 'Budget sleeper & AC buses',
      url: `https://www.abhibus.com/${slug(f)}-to-${slug(t)}-bus-tickets`,
    },
    {
      name: 'IntrCity SmartBus', emoji: '🏎️',
      note: 'Premium intercity buses',
      url: `https://www.intrcity.com/`,
    },
  ]

  const budgetHotels = [
    {
      name: 'OYO Rooms',      emoji: '🏠',
      tag: 'Budget',          tagBg: 'bg-red-500/20 text-red-400',
      note: 'Rooms from ₹499/night',
      url: `https://www.oyorooms.com/search/?location=${enc(t)}`,
    },
    {
      name: 'Zostel',         emoji: '⛺',
      tag: 'Backpacker',      tagBg: 'bg-green-500/20 text-green-400',
      note: 'Hostels, dorms & social stays',
      url: `https://www.zostel.com/zostel/${slug(t)}/`,
    },
    {
      name: 'MakeMyTrip Hotels', emoji: '🏨',
      note: 'Best deal guarantee + verified properties',
      url: `https://www.makemytrip.com/hotels/${slug(t)}-hotels.html`,
    },
    {
      name: 'Goibibo Hotels', emoji: '🏩',
      note: 'GoCash cashback on every booking',
      url: `https://www.goibibo.com/hotels/hotels-in-${slug(t)}/`,
    },
    {
      name: 'ixigo Hotels',   emoji: '🟣',
      note: 'Cheapest rate finder',
      url: `https://www.ixigo.com/hotels/search?destination=${enc(t)}`,
    },
  ]

  const flights = [
    {
      name: 'Google Flights',  emoji: '✈️',
      tag: 'Best Prices',      tagBg: 'bg-blue-500/20 text-blue-400',
      note: 'Compare all airlines — find cheapest dates',
      url: `https://www.google.com/travel/flights?q=flights+from+${enc(f)}+to+${enc(t)}`,
      badge: 'Cheapest',
    },
    {
      name: 'Skyscanner',      emoji: '🔍',
      tag: 'Pre-filled',       tagBg: 'bg-blue-500/20 text-blue-400',
      note: 'Flexible date search + price calendar',
      url: `https://www.skyscanner.co.in/transport/flights/${enc(f)}/${enc(t)}/`,
    },
    {
      name: 'IndiGo',          emoji: '💙',
      tag: 'Budget Airline',   tagBg: 'bg-indigo-500/20 text-indigo-400',
      note: 'India\'s largest low-cost carrier',
      url: 'https://www.goindigo.in/',
    },
    {
      name: 'SpiceJet',        emoji: '🔴',
      note: 'Low-cost with good network',
      url: 'https://www.spicejet.com/',
    },
    {
      name: 'MakeMyTrip Flights', emoji: '🟠',
      note: 'Instant booking + easy cancellation',
      url: 'https://www.makemytrip.com/flights/',
    },
    {
      name: 'Air India',       emoji: '🇮🇳',
      note: 'National carrier — widest routes',
      url: 'https://www.airindia.in/',
    },
  ]

  const luxuryHotels = [
    {
      name: 'Booking.com',    emoji: '🏨',
      tag: 'Free Cancel',     tagBg: 'bg-amber-500/20 text-amber-400',
      note: 'Largest hotel inventory worldwide',
      url: `https://www.booking.com/search.html?ss=${enc(t)}`,
    },
    {
      name: 'MakeMyTrip Luxury', emoji: '🌟',
      note: 'Curated premium properties',
      url: `https://www.makemytrip.com/hotels/${slug(t)}-hotels.html`,
    },
    {
      name: 'Goibibo Premium', emoji: '⭐',
      note: 'Verified luxury hotels + GoCash',
      url: `https://www.goibibo.com/hotels/hotels-in-${slug(t)}/`,
    },
    {
      name: 'Airbnb',         emoji: '🏡',
      tag: 'Unique Stays',    tagBg: 'bg-rose-500/20 text-rose-400',
      note: 'Villas, heritage homes, private pools',
      url: `https://www.airbnb.co.in/s/${enc(t)}/homes`,
    },
    {
      name: 'Taj Hotels',     emoji: '👑',
      note: 'India\'s iconic luxury hotel group',
      url: `https://www.tajhotels.com/en-in/search/?q=${enc(t)}`,
    },
  ]

  if (type === 'gold') {
    return [
      { title: 'Flights', emoji: '✈️', platforms: flights, accent: 'amber' },
      { title: 'Luxury Hotels', emoji: '🏨', platforms: luxuryHotels, accent: 'amber' },
    ]
  }
  return [
    { title: 'Trains', emoji: '🚂', platforms: trains, accent: 'green' },
    { title: 'Buses', emoji: '🚌', platforms: buses, accent: 'green' },
    { title: 'Budget Hotels', emoji: '🏠', platforms: budgetHotels, accent: 'green' },
  ]
}

function BookingSheet({ open, onClose, origin, destination, type }) {
  const sections = buildPlatforms(origin, destination, type)
  const isGold = type === 'gold'

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Slide-up sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col bg-slate-950 border-t border-white/10 rounded-t-3xl max-h-[88vh] animate-slide-up shadow-2xl">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              {isGold ? '👑 Book Gold Experience' : '💰 Book Budget Trip'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {origin} → {destination} · Pick your platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-5 py-5 space-y-7">
          {sections.map((sec) => (
            <div key={sec.title}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{sec.emoji}</span>
                <h3 className={`font-bold text-sm uppercase tracking-wider ${sec.accent === 'amber' ? 'text-amber-400' : 'text-green-400'}`}>
                  {sec.title}
                </h3>
                <div className="flex-1 h-px bg-white/6 ml-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sec.platforms.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group ${
                      sec.accent === 'amber'
                        ? 'bg-amber-500/5 border-amber-500/15 hover:border-amber-500/35 hover:bg-amber-500/8'
                        : 'bg-green-500/5 border-green-500/15 hover:border-green-500/35 hover:bg-green-500/8'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 leading-none">{p.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-sm font-bold text-white">{p.name}</span>
                          {p.badge && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap ${
                              p.badge === 'Official' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>{p.badge}</span>
                          )}
                          {p.tag && !p.badge && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap border ${p.tagBg} border-current/20`}>{p.tag}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[160px] sm:max-w-none">{p.note}</p>
                      </div>
                    </div>

                    <div className={`shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                      sec.accent === 'amber'
                        ? 'bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/30'
                        : 'bg-green-500/15 text-green-400 group-hover:bg-green-500/30'
                    }`}>
                      <span>Book</span>
                      <ExternalLink size={10} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}

          <p className="text-[10px] text-slate-700 text-center pb-2">
            All links open in a new tab. Prices vary by date & availability. JourneyMate is not affiliated with these platforms.
          </p>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Wikipedia / history modal (fetches on demand or uses preload)      */
/* ------------------------------------------------------------------ */
function PlaceHistoryModal({ open, onClose, searchQuery, preload }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!open) {
      setArticle(null)
      setErr(null)
      return
    }
    if (preload) {
      setArticle(preload)
      setErr(null)
      setLoading(false)
      return
    }
    if (!searchQuery || searchQuery.length < 2) {
      setArticle(null)
      return
    }
    let cancel = false
    setLoading(true)
    setErr(null)
    setArticle(null)
    getPlaceArticle(searchQuery)
      .then((d) => {
        if (cancel) return
        setArticle(d.article)
      })
      .catch((e) => {
        if (cancel) return
        const st = e?.response?.status
        if (st === 404) {
          setErr({ type: 'not_found' })
        } else {
          setErr({ type: 'other' })
        }
      })
      .finally(() => {
        if (!cancel) setLoading(false)
      })
    return () => { cancel = true }
  }, [open, searchQuery, preload])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const wikiSearchUrl = searchQuery
    ? `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(searchQuery)}&title=Special%3ASearch&fulltext=1`
    : 'https://en.wikipedia.org/wiki/Main_Page'

  return (
    <>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[80]" onClick={onClose} role="presentation" />
      <div
        className="fixed z-[90] left-1/2 top-1/2 w-[min(100vw-1.5rem,28rem)] sm:w-[min(100vw-2rem,32rem)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 glass border border-white/12 rounded-2xl shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ph-title"
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
              <History size={18} className="text-amber-400" />
            </div>
            <h2 id="ph-title" className="text-base font-bold text-white leading-tight pr-1">
              {article?.title || (loading ? 'Loading…' : 'Place history')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 min-h-0">
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin" />
              Fetching from Wikipedia…
            </div>
          )}
          {err && !loading && (
            <div className="flex flex-col gap-2 text-rose-200/95 text-sm p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>
                  {err.type === 'not_found'
                    ? 'No automatic match on English Wikipedia for that phrase.'
                    : 'Could not reach the server or Wikipedia. Check your connection or try again.'}
                </span>
              </div>
              <a
                href={wikiSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 pl-0.5 text-amber-400 text-xs font-semibold hover:text-amber-300"
              >
                Search on Wikipedia
                <ExternalLink size={12} />
              </a>
            </div>
          )}
          {article && !loading && (
            <div className="space-y-3">
              {article.thumbnail && (
                <img
                  src={article.thumbnail}
                  alt=""
                  className="w-full max-h-40 object-cover rounded-xl border border-white/10"
                />
              )}
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {article.extract || 'No preview available.'}
              </p>
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300"
                >
                  Open full article on Wikipedia
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </div>
        <p className="text-[10px] text-slate-600 border-t border-white/8 p-3 shrink-0">
          Text: Wikipedia (CC BY-SA). This feature uses the MediaWiki &apos;search + summary&apos; flow.
        </p>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Real data strip: driving time/distance, intro, top sights         */
/* ------------------------------------------------------------------ */
function PlaceIntelSection({ placeIntel, destination, onOpenHistory, onOpenWithPreload }) {
  if (!placeIntel) return null
  const { osrm, wikipedia, topSights } = placeIntel
  const hasAny = osrm || wikipedia || (Array.isArray(topSights) && topSights.length > 0)
  if (!hasAny) return null

  return (
    <div className="mb-6 sm:mb-8 rounded-2xl border border-white/10 glass p-4 sm:p-5 animate-slide-up w-full min-w-0" style={{ animationDelay: '0.12s' }}>
      <div className="flex items-center gap-2 mb-4">
        <Landmark size={16} className="text-emerald-400" />
        <h3 className="text-sm font-bold text-white tracking-wide">Compare — live place data</h3>
      </div>

      {osrm && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-200">
            <Ruler size={12} className="text-cyan-400" />
            <span className="text-slate-500">By road (approx.):</span>
            <span className="font-semibold text-white">{osrm.distanceKm} km</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-200">
            <Clock size={12} className="text-cyan-400" />
            <span className="text-slate-500">Drive time (approx.):</span>
            <span className="font-semibold text-white">{osrm.durationMin} min</span>
          </div>
        </div>
      )}

      {wikipedia && (
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/8 mb-4">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">About the destination</p>
          <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
            {wikipedia.extract}
          </p>
          <button
            type="button"
            onClick={() => onOpenWithPreload(wikipedia)}
            className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
          >
            <History size={12} />
            Read place history
          </button>
        </div>
      )}

      {Array.isArray(topSights) && topSights.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-semibold mb-2">Places to visit nearby (from OpenStreetMap)</p>
          <ul className="space-y-1.5">
            {topSights.map((s) => (
              <li
                key={s.name}
                className="flex items-center justify-between gap-2 text-xs sm:text-sm text-slate-300 pl-0"
              >
                <span className="min-w-0 truncate">{s.name}</span>
                <button
                  type="button"
                  onClick={() => onOpenHistory(`${s.name} ${destination} India`, null)}
                  className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-semibold hover:bg-amber-500/20"
                >
                  <History size={12} />
                  History
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Famous street food — trigger button + popup modal                  */
/*                                                                     */
/*  The whole feature now lives INSIDE the Itinerary tab as a small    */
/*  attention-grabbing trigger; clicking it opens a full-screen modal  */
/*  with the curated list (street + fine-dining) and the tier filter.  */
/* ------------------------------------------------------------------ */

/** A small attention banner inside the itinerary tab — opens the modal. */
function StreetFoodTrigger({ destination, count, hasFine, isGold, onOpen }) {
  if (!count) return null
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group w-full mb-3 flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isGold
          ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-amber-500/25 hover:border-amber-500/40 hover:shadow-amber-500/10'
          : 'bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border-orange-500/25 hover:border-orange-500/40 hover:shadow-orange-500/10'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isGold
            ? 'bg-amber-500/20 border border-amber-500/30'
            : 'bg-orange-500/20 border border-orange-500/30'
        }`}
      >
        <ChefHat size={18} className={isGold ? 'text-amber-300' : 'text-orange-300'} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-white leading-tight">
            Famous street food in {destination}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-orange-500/20 text-orange-200 border border-orange-500/40 whitespace-nowrap">
            Must try
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug mt-0.5 truncate">
          {count} curated pick{count === 1 ? '' : 's'}
          {hasFine ? ' · includes fine-dining' : ''} · tap to view
        </p>
      </div>
      <ChevronRight
        size={16}
        className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
          isGold ? 'text-amber-300' : 'text-orange-300'
        }`}
      />
    </button>
  )
}

/** Inner panel — filter pills + dish grid + footer tip. */
function StreetFoodPanel({ items, destination }) {
  // Always default to 'all' — the user's plan view should NOT lock the filter.
  // This way the modal always shows every dish on open and the user can refine.
  const [tier, setTier] = useState('all')

  const counts = {
    all: items.length,
    street: items.filter((i) => i.tier !== 'fine').length,
    fine: items.filter((i) => i.tier === 'fine').length,
  }
  const visible = tier === 'all' ? items : items.filter((i) => (i.tier || 'street') === tier)

  // Always render all 3 tiers so the UI is consistent across destinations;
  // a tier with 0 items renders disabled but stays visible for clarity.
  const TIERS = [
    { id: 'all',    label: 'All',         count: counts.all,    icon: null },
    { id: 'street', label: 'Street',      count: counts.street, icon: null },
    { id: 'fine',   label: 'Fine dining', count: counts.fine,   icon: null },
  ]

  return (
    <>
      <p className="mb-4 text-xs text-slate-500 leading-snug">
        Local favourites picked from markets, dhabas and old-city lanes — eat where the locals do.
      </p>

      <div
        className="grid grid-cols-3 gap-1 w-full min-w-0 p-1 rounded-2xl bg-slate-900/60 border border-white/10 mb-4"
        role="group"
        aria-label="Filter by food tier"
      >
        {TIERS.map((t) => {
          const disabled = t.count === 0 && t.id !== 'all'
          return (
            <button
              key={t.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setTier(t.id)}
              aria-pressed={tier === t.id}
              className={`min-w-0 py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold text-center leading-snug transition-all duration-300 ${
                tier === t.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                  : disabled
                  ? 'text-slate-600 cursor-not-allowed opacity-50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="truncate inline-block max-w-full align-middle">{t.label}</span>
              <span className="ml-1 text-[10px] opacity-80">({t.count})</span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-xs text-slate-500 italic px-1 py-4">
          No {tier === 'fine' ? 'fine-dining' : 'street-food'} picks listed for this place — try
          the All tab.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {visible.map((item, i) => {
            const isFine = item.tier === 'fine'
            return (
              <div
                key={`${item.name}-${i}`}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  isFine
                    ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/10'
                    : 'bg-orange-500/5 border-orange-500/15 hover:border-orange-500/30 hover:bg-orange-500/8'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg leading-none shrink-0 ${
                    isFine
                      ? 'bg-amber-500/15 border-amber-500/30'
                      : 'bg-orange-500/15 border-orange-500/25'
                  }`}
                >
                  {item.emoji || '🍽️'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="text-sm font-semibold text-white leading-tight truncate">
                      {item.name}
                    </span>
                    {isFine && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                        Fine
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-snug mt-0.5">
                      {item.description}
                    </p>
                  )}
                  {item.where && (
                    item.mapsUrl ? (
                      <a
                        href={item.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-1 inline-flex items-start gap-1 text-[10px] sm:text-[11px] leading-snug font-medium hover:underline ${
                          isFine ? 'text-amber-300/90 hover:text-amber-200' : 'text-orange-300/90 hover:text-orange-200'
                        }`}
                        title="Open on Google Maps"
                      >
                        <MapPin size={10} className="mt-0.5 shrink-0" />
                        <span className="min-w-0 break-words">{item.where}</span>
                        <ExternalLink size={9} className="mt-0.5 shrink-0 opacity-70" />
                      </a>
                    ) : (
                      <p
                        className={`text-[10px] sm:text-[11px] leading-snug mt-1 flex items-start gap-1 ${
                          isFine ? 'text-amber-300/90' : 'text-orange-300/90'
                        }`}
                      >
                        <MapPin size={10} className="mt-0.5 shrink-0" />
                        <span className="min-w-0 break-words">{item.where}</span>
                      </p>
                    )
                  )}
                  {item.affiliateUrl && (
                    <a
                      href={item.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                        isFine
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                      }`}
                      title={item.affiliatePartner ? `Book on ${item.affiliatePartner}` : 'Reserve a table'}
                    >
                      {isFine ? 'Reserve' : 'Book'}
                      {item.affiliatePartner && (
                        <span className="opacity-80 normal-case font-semibold">· {item.affiliatePartner}</span>
                      )}
                      <ExternalLink size={9} className="shrink-0 opacity-80" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-3 text-[10px] text-slate-600 leading-snug">
        Tip: many top stalls are cash-only and busiest 7–10 PM. Pin locations open on Google Maps.
      </p>
    </>
  )
}

/** Centered popup, fully responsive — sits above every other UI layer. */
function StreetFoodModal({ open, onClose, streetFood, destination }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    // Compensate for scrollbar disappearing when we lock body scroll so the
    // page underneath doesn't visibly shift sideways.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [open, onClose])

  if (!open) return null
  const items = Array.isArray(streetFood) ? streetFood : []
  const fineCount = items.filter((i) => i.tier === 'fine').length
  const streetCount = items.length - fineCount

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="street-food-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-default"
      />

      {/* Centered dialog */}
      <div
        className="relative glass border border-white/15 shadow-2xl shadow-black/60
                   w-full max-w-3xl
                   max-h-[min(88vh,46rem)]
                   flex flex-col overflow-hidden
                   rounded-2xl sm:rounded-3xl
                   animate-scale-in"
        style={{ animationDuration: '180ms' }}
      >
        {/* Sticky header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-slate-950/50 backdrop-blur-sm shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
            <ChefHat size={18} className="text-orange-200" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              id="street-food-modal-title"
              className="text-base sm:text-lg font-bold text-white leading-tight truncate font-display"
            >
              Famous food in {destination}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 flex-wrap">
              <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-200 border border-orange-500/40">
                Must try
              </span>
              <span className="leading-tight">
                {streetCount} street
                {fineCount > 0 ? <> · {fineCount} fine-dining</> : null}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pt-4 sm:pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] min-h-0"
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center mb-3">
                <ChefHat size={22} className="text-orange-300" />
              </div>
              <p className="text-sm text-slate-300 font-semibold mb-1">No picks yet</p>
              <p className="text-xs text-slate-500 max-w-xs">
                We don&apos;t have a curated street-food list for this destination yet — try a nearby city.
              </p>
            </div>
          ) : (
            <StreetFoodPanel items={items} destination={destination} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Itinerary day accordion                                            */
/* ------------------------------------------------------------------ */
function ItineraryDay({ day, isGold, expanded, onToggle, onHistoryForActivity, destinationName }) {
  const accent = isGold ? 'amber' : 'green'
  return (
    <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
      isGold
        ? 'bg-amber-500/5 border-amber-500/15 hover:border-amber-500/30'
        : 'bg-green-500/5 border-green-500/15 hover:border-green-500/30'
    } ${expanded ? 'ring-1 ring-white/15 shadow-xl' : 'hover:scale-[1.005]'}`}>

      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 sm:p-4 text-left group"
        aria-expanded={expanded}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
          isGold ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
        }`}>D{day.day}</div>
        <span className="font-semibold text-sm text-white leading-snug flex-1 min-w-0">{day.title}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''} group-hover:text-slate-300`} />
      </button>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              <ul className="space-y-1.5 lg:col-span-2">
                {day.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <ChevronRight size={12} className={`mt-0.5 shrink-0 ${isGold ? 'text-amber-500' : 'text-green-500'}`} />
                    <span className="min-w-0 flex-1 leading-snug">{act}</span>
                    {onHistoryForActivity && destinationName && (
                      <button
                        type="button"
                        onClick={() => onHistoryForActivity(act)}
                        className={`shrink-0 p-0.5 rounded border border-dashed ${
                          isGold ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                        }`}
                        title="History of this place"
                        aria-label={`History: ${act}`}
                      >
                        <History size={12} className="block" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {day.map && (
                <div className="lg:col-span-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
                    <MapPin size={10} className={isGold ? 'text-amber-400' : 'text-green-400'} />
                    {day.map.label}
                  </div>
                  <div className={expanded ? 'h-[280px] sm:h-[300px]' : 'h-[200px]'}>
                    <PlaceMap lat={day.map.lat} lng={day.map.lng} label={day.map.label} accent={accent} className="h-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!expanded && day.map && (
        <div className="px-3 sm:px-4 pb-3 text-[11px] text-slate-500 flex items-center gap-1.5">
          <MapPin size={10} className={isGold ? 'text-amber-400/70' : 'text-green-400/70'} />
          Tap to reveal map & activities
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Travellers & vibe modal — focused full-screen edit experience      */
/* ------------------------------------------------------------------ */
/**
 * Two-step modal (Who → Vibes) that mirrors the home wizard but lives at
 * page-level so the Compare layout stays focused on the trip itself.
 *
 * - Body scroll is locked while open, scrollbar gutter compensated for.
 * - Esc / backdrop tap close. Done button confirms with the parent's setter
 *   pattern (already debounced upstream via the auto-refetch effect).
 */
function TravellersModal({ open, onClose, tripType, vibes, onTripType, onVibes }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!open) return undefined
    setStep(tripType ? 1 : 0)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    const sb = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (sb > 0) document.body.style.paddingRight = `${sb}px`
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
    }
  }, [open, onClose, tripType])

  if (!open) return null
  const tripMeta = findTripType(tripType)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="travellers-modal-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-default"
      />

      <div
        className="relative glass border border-white/15 shadow-2xl shadow-black/60
                   w-full max-w-2xl
                   max-h-[min(88vh,42rem)]
                   flex flex-col overflow-hidden
                   rounded-2xl sm:rounded-3xl
                   animate-scale-in"
        style={{ animationDuration: '180ms' }}
      >
        {/* Sticky header with progress + close */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-slate-950/50 backdrop-blur-sm shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-pink-500/20 border border-fuchsia-400/30 flex items-center justify-center shrink-0 text-base">
            <span aria-hidden>{tripMeta?.icon || '✨'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="travellers-modal-title" className="text-base sm:text-lg font-bold text-white leading-tight truncate font-display">
              {step === 0 ? "Who's coming on this trip?" : 'Pick the vibes you love'}
            </h3>
            <div className="flex items-center gap-1.5 mt-1" aria-hidden>
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    step === i ? 'w-5 bg-fuchsia-300' : i < step ? 'w-3 bg-white/55' : 'w-3 bg-white/15'
                  }`}
                />
              ))}
              <span className="ml-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Step {step + 1} / 2
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5 min-h-0">
          {step === 0 ? (
            <TripTypePicker
              value={tripType}
              onChange={(next) => {
                onTripType(next)
                if (next !== tripType) onVibes([])
              }}
              size="md"
              showHeader={false}
            />
          ) : (
            <>
              {tripMeta && (
                <div className="inline-flex items-center gap-1.5 mb-4 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/30">
                  <span aria-hidden>{tripMeta.icon}</span>
                  <span>{tripMeta.short} trip</span>
                </div>
              )}
              {!tripType ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/85 leading-relaxed">
                  Pick a travel group on the previous step to see relevant room vibes.
                </div>
              ) : (
                <VibeChips
                  tripType={tripType}
                  value={vibes}
                  onChange={onVibes}
                  label={`${tripMeta?.short || 'Trip'} vibes`}
                />
              )}
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 bg-slate-950/50 backdrop-blur-sm shrink-0">
          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-white font-semibold transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 font-semibold">
              Updates apply automatically
            </span>
          )}
          {step === 0 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 shadow-lg shadow-fuchsia-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Check size={16} /> Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Plan card                                                          */
/* ------------------------------------------------------------------ */
function PlanCard({ plan, type, tripData, onBook, onHistoryForActivity, onOpenFood, tripType = null, vibes = [] }) {
  const isGold = type === 'gold'
  const [activeTab, setActiveTab] = useState('overview')
  const [openDay, setOpenDay] = useState(1)

  useEffect(() => { setOpenDay(1) }, [tripData.destination, plan?.itinerary?.length, tripData?.requestedDays])

  const streetFoodList = Array.isArray(tripData.streetFood) ? tripData.streetFood : []
  const streetFoodCount = streetFoodList.length
  const streetFoodHasFine = streetFoodList.some((i) => i.tier === 'fine')

  // The backend already applies pricing, accommodation copy, and perks for
  // (tripType, vibes). The only thing we still derive client-side is a small
  // "Tuned for" badge built from the *labels* of the active selection.
  const tunedBadge = (() => {
    if (!tripType || !Array.isArray(vibes) || vibes.length === 0) return null
    const list = VIBES_BY_TYPE[tripType] || []
    const selected = list.filter((v) => vibes.includes(v.id))
    if (selected.length === 0) return null
    return selected.map((v) => `${v.icon} ${v.label}`).join(' · ')
  })()

  const color = isGold ? {
    primary: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    gradient: 'from-amber-500/20 to-orange-500/10',
    button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/25 hover:shadow-amber-500/40',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    tab: 'text-amber-400 border-amber-400',
    icon: 'text-amber-400',
    check: 'text-amber-400',
    ring: 'ring-amber-500/20',
    glow: 'shadow-amber-500/10',
    cardGlass: 'glass-gold',
  } : {
    primary: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/25',
    gradient: 'from-green-500/20 to-emerald-500/10',
    button: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-green-500/25 hover:shadow-green-500/40',
    badge: 'bg-green-500/15 text-green-400 border-green-500/30',
    tab: 'text-green-400 border-green-400',
    icon: 'text-green-400',
    check: 'text-green-400',
    ring: 'ring-green-500/20',
    glow: 'shadow-green-500/10',
    cardGlass: 'glass-silver',
  }

  const tabs = ['overview', 'itinerary', 'book']

  return (
    <div className={`plan-card ${isGold ? 'plan-card-gold' : 'plan-card-silver'} ${color.cardGlass} rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ${color.ring} shadow-2xl ${color.glow} flex flex-col`}>

      {/* Card header */}
      <div className={`bg-gradient-to-br ${color.gradient} p-4 sm:p-6 border-b ${color.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${color.badge} border mb-3`}>
              {isGold ? <><Star size={11} /> Premium Gold</> : <><Shield size={11} /> Smart Silver</>}
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
              {isGold ? '👑 Luxury' : '💰 Budget'}
            </h3>
            <p className="text-slate-400 text-sm mt-1 max-w-[20rem]">
              {isGold ? 'Premium comfort, curated experiences' : 'Smart savings, authentic travel'}
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs text-slate-500 mb-1">Total Cost</div>
            <div className={`font-display font-bold text-2xl sm:text-3xl ${color.primary} price-animate`}>
              ₹{plan.price.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500">per person</div>
            {tripData?.requestedDays != null && (
              <p className="text-[10px] text-slate-500 mt-1 max-w-[12rem] sm:max-w-none sm:text-right leading-snug">
                For {tripData.requestedDays} day{tripData.requestedDays === 1 ? '' : 's'} of places — shorter trips cost less
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${color.bg} border ${color.border}`}>
            {isGold ? <Plane size={16} className={color.icon} /> : <Train size={16} className={color.icon} />}
            <div>
              <div className="text-xs text-slate-500">Transport</div>
              <div className="text-xs font-semibold text-white leading-tight">{plan.transport}</div>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${color.bg} border ${color.border}`}>
            {isGold ? <Hotel size={16} className={color.icon} /> : <Building size={16} className={color.icon} />}
            <div className="min-w-0">
              <div className="text-xs text-slate-500">Stay</div>
              <div className="text-xs font-semibold text-white leading-tight truncate">{plan.accommodation}</div>
            </div>
          </div>
        </div>

        {tunedBadge && (
          <div className="mt-2.5 flex items-start gap-2 text-[11px] text-fuchsia-100/85 bg-fuchsia-500/10 border border-fuchsia-400/25 rounded-xl px-3 py-2">
            <span className="font-bold uppercase tracking-wider text-fuchsia-200/80 text-[9px] shrink-0 mt-0.5">Tuned for</span>
            <span className="leading-snug min-w-0 break-words">{tunedBadge}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/8 min-w-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-0 py-2.5 sm:py-3 px-0.5 sm:px-1 text-[9px] 2xs:text-[10px] sm:text-xs font-semibold uppercase tracking-tight sm:tracking-wider transition-all duration-200 ${
              activeTab === tab
                ? `${color.tab} border-b-2`
                : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
            }`}
          >
            <span className="line-clamp-2 sm:line-clamp-none break-words hyphens-auto">
              {tab === 'book' ? '🎟 Book' : tab}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 p-4 sm:p-5 overflow-auto min-h-0">

        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {[
              { label: 'Transport', value: plan.transport_detail, icon: isGold ? Plane : Train },
              { label: 'Accommodation', value: plan.accommodation_detail, icon: isGold ? Hotel : Building },
              { label: 'Dining', value: plan.dining_detail, icon: UtensilsCrossed },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className={`flex gap-3 p-3 rounded-xl ${color.bg} border ${color.border}`}>
                <div className={`w-9 h-9 rounded-lg ${color.bg} border ${color.border} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={color.icon} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                  <div className="text-sm text-white leading-snug">{value}</div>
                </div>
              </div>
            ))}
            <div className={`flex items-center gap-3 p-3 rounded-xl ${color.bg} border ${color.border}`}>
              <div className={`w-9 h-9 rounded-lg ${color.bg} border ${color.border} flex items-center justify-center shrink-0`}>
                <Calendar size={16} className={color.icon} />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-0.5">Duration</div>
                <div className="text-sm text-white">{tripData.duration}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="animate-fade-in">
            <StreetFoodTrigger
              destination={tripData.destination}
              count={streetFoodCount}
              hasFine={streetFoodHasFine}
              isGold={isGold}
              onOpen={() => onOpenFood && onOpenFood(type)}
            />
            <div className="space-y-3">
              {plan.itinerary.map(day => (
                <ItineraryDay
                  key={day.day}
                  day={day}
                  isGold={isGold}
                  expanded={openDay === day.day}
                  onToggle={() => setOpenDay(openDay === day.day ? 0 : day.day)}
                  onHistoryForActivity={onHistoryForActivity}
                  destinationName={tripData.destination}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'book' && (
          <div className="space-y-5 animate-fade-in">
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose a platform below to book your {isGold ? 'luxury' : 'budget'} trip from <strong className="text-white">{tripData.origin}</strong> to <strong className="text-white">{tripData.destination}</strong>. Links marked <span className={`font-semibold ${isGold ? 'text-amber-400' : 'text-green-400'}`}>Pre-filled</span> open directly with your cities already selected.
            </p>

            {buildPlatforms(tripData.origin, tripData.destination, type).map((sec) => (
              <div key={sec.title}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span>{sec.emoji}</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${sec.accent === 'amber' ? 'text-amber-400' : 'text-green-400'}`}>{sec.title}</span>
                </div>
                <div className="space-y-2">
                  {sec.platforms.map((p) => (
                    <a
                      key={p.name}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all hover:-translate-y-0.5 group ${
                        sec.accent === 'amber'
                          ? 'bg-amber-500/5 border-amber-500/15 hover:border-amber-500/30'
                          : 'bg-green-500/5 border-green-500/15 hover:border-green-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{p.emoji}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-white">{p.name}</span>
                            {p.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase">{p.badge}</span>
                            )}
                            {p.tag && !p.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${p.tagBg}`}>{p.tag}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{p.note}</p>
                        </div>
                      </div>
                      <div className={`shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg ${
                        sec.accent === 'amber' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                      } group-hover:opacity-90`}>
                        Open <ExternalLink size={10} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'perks' && (
          <div className="space-y-2 animate-fade-in">
            <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider font-semibold flex items-center gap-2">
              <span>What&apos;s Included</span>
              {tunedBadge && (
                <span className="ml-auto inline-flex text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/30">
                  Tuned · {(vibes || []).length} vibe{(vibes || []).length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            {(plan.perks || []).map((perk, i) => (
              <div
                key={`${perk}-${i}`}
                className={`flex items-center gap-3 p-3 rounded-xl border ${color.bg} ${color.border}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-7 h-7 rounded-lg ${color.bg} border ${color.border} flex items-center justify-center shrink-0`}>
                  <PerkIcon perk={perk} />
                </div>
                <span className="text-sm text-white">{perk}</span>
                <Check size={14} className={`ml-auto shrink-0 ${color.check}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-4 sm:p-5 border-t border-white/8">
        <button
          type="button"
          onClick={onBook}
          className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold text-sm text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${color.button}`}
        >
          {isGold ? '👑 Book Gold Experience' : '💰 Book & Save Now'}
        </button>
        <p className="text-center text-xs text-slate-500 mt-2">
          {isGold ? 'Includes concierge support & premium transfers' : 'Best price guarantee • Free cancellation'}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main comparison page                                               */
/* ------------------------------------------------------------------ */
/** 1 day = one-day visit plan; max 5 days of places to visit. */
const DAY_OPTIONS = [1, 2, 3, 4, 5]

export default function ComparisonPage({
  tripData,
  onBack,
  onChangeDays,
  daysLoading = false,
  selectedDays: selectedDaysProp,
  tripType = null,
  vibes = [],
  onTripTypeChange,
  onVibesChange,
}) {
  // Local fallbacks let the page work standalone (e.g. previews) without
  // requiring the parent to wire the trip-type props in.
  const [localTripType, setLocalTripType] = useState(tripType)
  const [localVibes, setLocalVibes] = useState(vibes)
  useEffect(() => { setLocalTripType(tripType) }, [tripType])
  useEffect(() => { setLocalVibes(vibes) }, [vibes])
  const handleTripType = onTripTypeChange || setLocalTripType
  const handleVibes = onVibesChange || setLocalVibes
  const activeTripType = onTripTypeChange ? tripType : localTripType
  const activeVibes = onVibesChange ? vibes : localVibes
  const activeTripTypeMeta = findTripType(activeTripType)
  /** 'silver' | 'both' | 'gold' — one tier at a time or side-by-side */
  const [planView, setPlanView] = useState('both')
  const plansSectionRef = React.useRef(null)
  /** Bumped on every plan-view toggle so each PlanCard remounts (state resets,
   *  animations replay) — the user perceives this as a clean "refresh". */
  const [plansEpoch, setPlansEpoch] = useState(0)
  const switchPlanView = React.useCallback((next) => {
    setPlanView((prev) => {
      if (prev !== next) setPlansEpoch((n) => n + 1)
      return next
    })
    requestAnimationFrame(() => {
      const el = plansSectionRef.current
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }, [])

  /** Food modal lives at the page level (not inside PlanCard) so it can
   *  centre on the whole viewport AND so we can hide the *other* plan card
   *  while it's open — the user's intent: "Silver food → Gold disappears". */
  const [foodModal, setFoodModal] = useState({ open: false, source: null, prevView: null })
  const openFood = React.useCallback((sourceType) => {
    setFoodModal((cur) => ({ open: true, source: sourceType || null, prevView: cur.prevView ?? planView }))
    if (sourceType === 'silver' || sourceType === 'gold') {
      setPlanView(sourceType)
    }
  }, [planView])
  const closeFood = React.useCallback(() => {
    setFoodModal((cur) => {
      // Restore whichever view the user was on before opening the modal.
      if (cur.prevView && cur.prevView !== planView) {
        setPlanView(cur.prevView)
      }
      return { open: false, source: null, prevView: null }
    })
  }, [planView])
  const selectedDays = (() => {
    const n = Number(selectedDaysProp ?? tripData.requestedDays ?? 5)
    if (!Number.isFinite(n)) return 5
    return Math.min(5, Math.max(1, n))
  })()
  const savings = tripData.gold.price - tripData.silver.price
  const savingsPct = Math.round((savings / tripData.gold.price) * 100)
  const [showCta, setShowCta] = useState(false)
  const [bookingModal, setBookingModal] = useState({ open: false, type: null })
  const [historyModal, setHistoryModal] = useState({ open: false, q: '', preload: null })
  const [travellersModalOpen, setTravellersModalOpen] = useState(false)

  const openHistoryByQuery = (q) => {
    setHistoryModal({ open: true, q, preload: null })
  }
  const openHistoryWithPreload = (article) => {
    setHistoryModal({ open: true, q: '', preload: article })
  }
  const closeHistory = () => setHistoryModal((s) => ({ ...s, open: false }))
  const onItineraryHistory = (act) => {
    openHistoryByQuery(`${act} ${tripData.destination} India`.trim())
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowCta(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const routeMaps = tripData.maps

  const openBooking = (type) => setBookingModal({ open: true, type })
  const closeBooking = () => setBookingModal({ open: false, type: null })

  return (
    <section className="min-h-[100dvh] mesh-bg pt-20 sm:pt-24 pb-36 sm:pb-40 px-2.5 sm:px-5 lg:px-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full min-w-0">

        {/* Back + Route header */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-8 animate-slide-up">
          <div className="flex flex-col gap-2 sm:gap-3 min-w-0 w-full">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-400 hover:text-white transition-colors glass px-3.5 sm:px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 w-full xs:w-auto shrink-0"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex flex-wrap items-baseline gap-x-1.5 sm:gap-x-2 gap-y-1 text-white min-w-0 text-sm sm:text-base">
                <MapPin size={16} className="text-green-400 shrink-0" />
                <span className="font-semibold break-words min-w-0 max-w-full">{tripData.origin}</span>
                <ChevronRight size={14} className="text-slate-500 shrink-0 hidden sm:block" />
                <span className="text-slate-500 sm:hidden" aria-hidden>·</span>
                <MapPin size={16} className="text-amber-400 shrink-0" />
                <span className="font-semibold break-words min-w-0 max-w-full">{tripData.destination}</span>
                <span className="text-slate-500 text-xs sm:text-sm w-full sm:w-auto sm:ml-1">• {tripData.duration}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Section: Customize your trip ----------------------------------- */}
        <div
          className="mb-6 sm:mb-8 rounded-2xl border border-white/10 glass p-4 sm:p-5 animate-slide-up w-full min-w-0"
          style={{ animationDelay: '0.06s' }}
        >
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={16} className="text-violet-300 shrink-0" />
            <h3 className="text-sm font-bold tracking-wide text-white">Customize your trip</h3>
            {activeTripTypeMeta && (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/30">
                <span aria-hidden>{activeTripTypeMeta.icon}</span>
                <span>{activeTripTypeMeta.short}</span>
              </span>
            )}
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Choose who you&apos;re travelling with, your room vibe, and how many days of places — every plan card updates instantly.
          </p>

          <div className="w-full min-w-0 flex flex-col gap-4">
            {/* Travellers & vibe — opens a focused modal to keep this page tidy */}
            <div className="w-full min-w-0 pb-1 border-b border-white/8">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Travellers &amp; vibe
              </div>
              <button
                type="button"
                onClick={() => setTravellersModalOpen(true)}
                className="w-full min-w-0 group flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl border bg-white/5 hover:bg-white/8 border-white/10 hover:border-fuchsia-400/40 transition-all text-left"
              >
                <span
                  className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-pink-500/20 border border-fuchsia-400/30 flex items-center justify-center text-base"
                  aria-hidden
                >
                  {activeTripTypeMeta?.icon || '✨'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs sm:text-sm font-semibold text-white truncate">
                    {activeTripTypeMeta ? `${activeTripTypeMeta.label}` : 'Choose travellers & vibe'}
                  </span>
                  <span className="block text-[11px] text-slate-400 truncate">
                    {activeTripTypeMeta
                      ? (activeVibes && activeVibes.length > 0
                          ? (VIBES_BY_TYPE[activeTripType] || [])
                              .filter((v) => activeVibes.includes(v.id))
                              .map((v) => v.label)
                              .join(' · ')
                          : 'No vibes yet — tap to add')
                      : 'Tune budget, rooms & perks for your trip'}
                  </span>
                </span>
                <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-200 border border-fuchsia-400/30 group-hover:bg-fuchsia-500/20">
                  Edit
                  <ChevronRight size={12} />
                </span>
              </button>
            </div>
            {/* View: one tier or compare — 3-up grid on narrow screens avoids horizontal scroll */}
            <div className="w-full min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                View
              </div>
              <div
                className="grid grid-cols-3 gap-1 w-full min-w-0 p-1 rounded-2xl bg-slate-900/60 border border-white/10"
                style={{ maxWidth: '100%' }}
              >
                {[
                  { id: 'silver', label: 'Silver',  compact: 'Silver',  color: 'from-green-500 to-emerald-600' },
                  { id: 'both',   label: 'Compare', compact: 'Both',    color: 'from-slate-600 to-slate-700' },
                  { id: 'gold',   label: 'Gold',   compact: 'Gold',   color: 'from-amber-500 to-orange-500' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => switchPlanView(opt.id)}
                    className={`min-w-0 py-2.5 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold text-center leading-snug transition-all duration-300 ${
                      planView === opt.id
                        ? `bg-gradient-to-r ${opt.color} text-white shadow-lg`
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={opt.id === 'both' ? 'Show Silver and Gold side by side' : `Show ${opt.label} only`}
                  >
                    <span className="sm:hidden block">{opt.compact}</span>
                    <span className="hidden sm:block">
                      {opt.id === 'silver' && '🛡 '}
                      {opt.id === 'both' && '⚖ '}
                      {opt.id === 'gold' && '👑 '}
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {onChangeDays && (
              <div className="w-full min-w-0 space-y-2 pt-1 border-t border-white/8">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1.5 gap-y-0 pt-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    Days of places to visit
                  </div>
                  {daysLoading && (
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 sm:justify-end">
                      <Loader2 size={14} className="animate-spin shrink-0" /> Updating…
                    </span>
                  )}
                </div>
                <div
                  className="grid w-full min-w-0 grid-cols-5 gap-1.5 sm:gap-2"
                  role="group"
                  aria-label="Choose how many days of places to visit, from 1 to 5"
                >
                  {DAY_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      disabled={daysLoading}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (daysLoading) return
                        if (Number(d) === Number(selectedDays)) return
                        onChangeDays(Number(d))
                      }}
                      className={`min-h-11 min-w-0 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-all border touch-manipulation ${
                        selectedDays === d
                          ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20 active:scale-95'
                      } ${daysLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Shorter trips cost less. Pick anywhere from 1 to 5 days.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section: Route map -------------------------------------------- */}
        {routeMaps?.origin && routeMaps?.destination && (
          <div
            className="mb-6 sm:mb-8 rounded-2xl border border-white/10 glass p-4 sm:p-5 animate-slide-up w-full min-w-0"
            style={{ animationDelay: '0.08s' }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Route size={16} className="text-green-400 shrink-0" />
              <h3 className="text-sm font-bold tracking-wide text-white">Route on map</h3>
            </div>
            <p className="mb-4 text-xs text-slate-500 break-words leading-snug">
              {routeMaps.origin.label} → {routeMaps.destination.label}
            </p>
            <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-white/8">
              <RouteDirectionMap
                originCoords={routeMaps.origin}
                destCoords={routeMaps.destination}
              />
            </div>
          </div>
        )}

        <WeatherPanel
          weather={tripData.placeIntel?.weather}
          destinationLabel={tripData.destination}
        />

        <PlaceIntelSection
          placeIntel={tripData.placeIntel}
          destination={tripData.destination}
          onOpenHistory={(q) => openHistoryByQuery(q)}
          onOpenWithPreload={openHistoryWithPreload}
        />

        {/* Section header: Plan comparison -------------------------------- */}
        <div
          ref={plansSectionRef}
          className="mb-3 sm:mb-4 mt-1 flex items-center gap-2 animate-slide-up scroll-mt-24"
          style={{ animationDelay: '0.18s' }}
        >
          <Scale size={16} className="text-cyan-300 shrink-0" />
          <h3 className="text-sm font-bold tracking-wide text-white">
            {planView === 'both' ? 'Compare your plans' : planView === 'gold' ? 'Your Gold plan' : 'Your Silver plan'}
          </h3>
          <div className="flex-1 h-px bg-white/8 ml-2" />
          {planView === 'both' && (
            <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
              Save ₹{savings.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Plans: stack with VS between on small screens; 2 columns from xl up */}
        <div
          className={`flex flex-col gap-4 sm:gap-5 lg:gap-6 animate-slide-up w-full min-w-0 ${
            planView === 'both' ? 'xl:grid xl:grid-cols-2 xl:items-start' : 'max-w-2xl mx-auto w-full'
          }`}
          style={{ animationDelay: '0.2s' }}
        >
          {(planView === 'both' || planView === 'silver') && (
            <div className="min-w-0 w-full">
              <PlanCard
                key={`silver-${plansEpoch}`}
                plan={tripData.silver}
                type="silver"
                tripData={tripData}
                onBook={() => openBooking('silver')}
                onHistoryForActivity={onItineraryHistory}
                onOpenFood={openFood}
                tripType={activeTripType}
                vibes={activeVibes}
              />
            </div>
          )}
          {planView === 'both' && (
            <div className="flex items-center gap-3 py-0.5 shrink-0 xl:hidden w-full" aria-hidden="true">
              <div className="flex-1 h-px bg-white/8 min-w-0" />
              <div className="glass rounded-full w-9 h-9 flex items-center justify-center border border-white/10 text-xs font-bold text-slate-500 shrink-0">VS</div>
              <div className="flex-1 h-px bg-white/8 min-w-0" />
            </div>
          )}
          {(planView === 'both' || planView === 'gold') && (
            <div className="min-w-0 w-full">
              <PlanCard
                key={`gold-${plansEpoch}`}
                plan={tripData.gold}
                type="gold"
                tripData={tripData}
                onBook={() => openBooking('gold')}
                onHistoryForActivity={onItineraryHistory}
                onOpenFood={openFood}
                tripType={activeTripType}
                vibes={activeVibes}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating savings banner — compact on mobile */}
      {showCta && (
        <div className="floating-cta fixed bottom-3 sm:bottom-4 left-0 right-0 z-40 flex justify-center px-2.5 sm:px-4 safe-bottom">
          <div className="w-full max-w-3xl glass border border-white/15 rounded-2xl p-2.5 sm:p-4 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2.5 sm:gap-4 shadow-2xl shadow-black/40 min-w-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 pr-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-base sm:text-xl shrink-0">💰</div>
              <div className="min-w-0 flex-1">
                <div className="text-white font-bold text-xs sm:text-base leading-tight break-words">
                  Save <span className="text-green-400 text-sm sm:text-lg font-bold">₹{savings.toLocaleString('en-IN')}</span>
                  <span className="text-slate-400 text-[10px] sm:text-sm ml-1 hidden xs:inline">({savingsPct}% less)</span>
                </div>
                <div className="text-slate-500 text-[10px] sm:text-xs hidden 2xs:block leading-tight mt-0.5">
                  {Math.round(savings / 500)} cups of chai ☕
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 shrink-0 w-full xs:w-auto">
              <button
                type="button"
                onClick={() => openBooking('silver')}
                className="flex-1 xs:flex-initial min-h-11 min-w-0 touch-manipulation px-3 sm:px-5 py-2.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-green-500/25 transition-all active:scale-[0.98] sm:hover:-translate-y-0.5"
              >
                Book Silver
              </button>
              <button
                type="button"
                onClick={() => openBooking('gold')}
                className="flex-1 xs:flex-initial min-h-11 min-w-0 touch-manipulation px-3 sm:px-5 py-2.5 sm:py-2.5 rounded-xl glass border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm hover:bg-amber-500/10 transition-all active:scale-[0.98] sm:hover:-translate-y-0.5"
              >
                Gold 👑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking sheet — rendered at top level to avoid z-index issues */}
      <BookingSheet
        open={bookingModal.open}
        onClose={closeBooking}
        origin={tripData.origin}
        destination={tripData.destination}
        type={bookingModal.type}
      />
      <PlaceHistoryModal
        open={historyModal.open}
        onClose={closeHistory}
        searchQuery={historyModal.q}
        preload={historyModal.preload}
      />
      {/* Famous food popup — page-level so it's centered on the whole viewport */}
      <StreetFoodModal
        open={foodModal.open}
        onClose={closeFood}
        streetFood={tripData.streetFood}
        destination={tripData.destination}
      />
      {/* Travellers & vibe — focused page so the Compare layout stays clean */}
      <TravellersModal
        open={travellersModalOpen}
        onClose={() => setTravellersModalOpen(false)}
        tripType={activeTripType}
        vibes={activeVibes}
        onTripType={handleTripType}
        onVibes={handleVibes}
      />
    </section>
  )
}
