import React, { useState, useEffect } from 'react'
import {
  Train, Plane, Hotel, Building, UtensilsCrossed, Star,
  ChevronRight, ChevronDown, Check, Calendar, MapPin, ArrowLeft,
  Sparkles, Shield, Coffee, Wifi, Car, Waves, Mountain,
  Route, X, ExternalLink
} from 'lucide-react'
import PlaceMap from './PlaceMap'
import RouteDirectionMap from './RouteDirectionMap'

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
/*  Itinerary day accordion                                            */
/* ------------------------------------------------------------------ */
function ItineraryDay({ day, isGold, expanded, onToggle }) {
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
                    <span className="min-w-0">{act}</span>
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
/*  Plan card                                                          */
/* ------------------------------------------------------------------ */
function PlanCard({ plan, type, tripData, onBook }) {
  const isGold = type === 'gold'
  const [activeTab, setActiveTab] = useState('overview')
  const [openDay, setOpenDay] = useState(1)

  useEffect(() => { setOpenDay(1) }, [tripData.destination])

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
            <div>
              <div className="text-xs text-slate-500">Stay</div>
              <div className="text-xs font-semibold text-white leading-tight">{plan.accommodation}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 sm:py-3 px-1 text-[10px] xs:text-[11px] sm:text-xs font-semibold uppercase tracking-wide sm:tracking-wider transition-all duration-200 whitespace-nowrap ${
              activeTab === tab
                ? `${color.tab} border-b-2`
                : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'
            }`}
          >
            {tab === 'book' ? '🎟 Book' : tab}
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
          <div className="space-y-3 animate-fade-in">
            {plan.itinerary.map(day => (
              <ItineraryDay
                key={day.day}
                day={day}
                isGold={isGold}
                expanded={openDay === day.day}
                onToggle={() => setOpenDay(openDay === day.day ? 0 : day.day)}
              />
            ))}
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
            <div className="text-xs text-slate-500 mb-4 uppercase tracking-wider font-semibold">What's Included</div>
            {plan.perks.map((perk, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${color.bg} border ${color.border}`} style={{ animationDelay: `${i * 0.05}s` }}>
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
export default function ComparisonPage({ tripData, onBack }) {
  const [mode, setMode] = useState('both')
  const savings = tripData.gold.price - tripData.silver.price
  const savingsPct = Math.round((savings / tripData.gold.price) * 100)
  const [showCta, setShowCta] = useState(false)
  const [bookingModal, setBookingModal] = useState({ open: false, type: null })

  useEffect(() => {
    const timer = setTimeout(() => setShowCta(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const routeMaps = tripData.maps

  const openBooking = (type) => setBookingModal({ open: true, type })
  const closeBooking = () => setBookingModal({ open: false, type: null })

  return (
    <section className="min-h-[100dvh] mesh-bg pt-20 sm:pt-24 pb-32 sm:pb-36 px-3 sm:px-5 lg:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Back + Route header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6 sm:mb-8 animate-slide-up">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-400 hover:text-white transition-colors glass px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 w-full sm:w-auto"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white min-w-0">
              <MapPin size={16} className="text-green-400 shrink-0" />
              <span className="font-semibold truncate max-w-[40vw] sm:max-w-none">{tripData.origin}</span>
              <ChevronRight size={16} className="text-slate-500 shrink-0 hidden sm:inline" />
              <span className="text-slate-500 sm:hidden text-xs px-1" aria-hidden>→</span>
              <MapPin size={16} className="text-amber-400 shrink-0" />
              <span className="font-semibold truncate max-w-[40vw] sm:max-w-none">{tripData.destination}</span>
              <span className="text-slate-500 text-xs sm:text-sm w-full sm:w-auto sm:ml-2">• {tripData.duration}</span>
            </div>
          </div>

          {/* Toggle */}
          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 sm:gap-2 glass rounded-2xl p-1 border border-white/10 min-w-0">
              <span className="text-xs text-slate-500 px-2 font-medium hidden md:block shrink-0">Optimize:</span>
              {[
                { id: 'savings', label: '💰 Savings', color: 'from-green-500 to-emerald-600' },
                { id: 'both',    label: '⚖️ Both',    color: 'from-slate-600 to-slate-700' },
                { id: 'comfort', label: '👑 Comfort', color: 'from-amber-500 to-orange-500' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${
                    mode === opt.id
                      ? `bg-gradient-to-r ${opt.color} text-white shadow-lg`
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Route map ONLY (removed individual city maps) */}
        {routeMaps?.origin && routeMaps?.destination && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.08s' }}>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-2">
              <Route size={12} className="text-green-400" />
              Route — {routeMaps.origin.label} → {routeMaps.destination.label}
            </div>
            <RouteDirectionMap
              originCoords={routeMaps.origin}
              destCoords={routeMaps.destination}
            />
          </div>
        )}

        {/* Comparison grid — single column on mobile/tablet, side-by-side on xl */}
        <div className={`grid gap-4 sm:gap-5 lg:gap-6 animate-slide-up ${
          mode === 'savings' ? 'grid-cols-1 max-w-2xl mx-auto' :
          mode === 'comfort' ? 'grid-cols-1 max-w-2xl mx-auto' :
          'grid-cols-1 xl:grid-cols-2'
        }`} style={{ animationDelay: '0.2s' }}>
          {(mode === 'both' || mode === 'savings') && (
            <PlanCard plan={tripData.silver} type="silver" tripData={tripData} onBook={() => openBooking('silver')} />
          )}
          {(mode === 'both' || mode === 'comfort') && (
            <PlanCard plan={tripData.gold} type="gold" tripData={tripData} onBook={() => openBooking('gold')} />
          )}
        </div>

        {mode === 'both' && (
          <div className="xl:hidden flex items-center gap-4 -my-1 z-10 relative">
            <div className="flex-1 h-px bg-white/8" />
            <div className="glass rounded-full w-9 h-9 flex items-center justify-center border border-white/10 text-xs font-bold text-slate-500">VS</div>
            <div className="flex-1 h-px bg-white/8" />
          </div>
        )}
      </div>

      {/* Floating savings banner — compact on mobile */}
      {showCta && (
        <div className="floating-cta fixed bottom-0 left-0 right-0 z-40 safe-bottom">
          <div className="max-w-3xl mx-auto glass border border-white/10 rounded-t-2xl sm:rounded-2xl sm:m-3 sm:mb-4 p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4 shadow-2xl">
            {/* Left: savings info */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-base sm:text-xl shrink-0">💰</div>
              <div className="min-w-0">
                <div className="text-white font-bold text-xs sm:text-base leading-tight">
                  Save <span className="text-green-400 text-sm sm:text-lg font-bold">₹{savings.toLocaleString('en-IN')}</span>
                  <span className="text-slate-400 text-[10px] sm:text-sm ml-1 hidden xs:inline">({savingsPct}% less)</span>
                </div>
                <div className="text-slate-500 text-[10px] sm:text-xs hidden 2xs:block leading-tight mt-0.5">
                  {Math.round(savings / 500)} cups of chai ☕
                </div>
              </div>
            </div>
            {/* Right: action buttons */}
            <div className="flex gap-1.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openBooking('silver')}
                className="px-3 xs:px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-green-500/25 transition-all hover:-translate-y-0.5 whitespace-nowrap"
              >
                Book Silver
              </button>
              <button
                type="button"
                onClick={() => openBooking('gold')}
                className="px-3 xs:px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl glass border border-amber-500/30 text-amber-400 font-bold text-xs sm:text-sm hover:bg-amber-500/10 transition-all hover:-translate-y-0.5 whitespace-nowrap"
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
    </section>
  )
}
