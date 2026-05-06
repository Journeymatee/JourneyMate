import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Train, Plane, Hotel, Globe2, Sparkles, Search, Clock, MapPin,
  ExternalLink, AlertCircle, Loader2, ArrowRight, Wifi,
  Tag, Send, Bot, Lock,
} from 'lucide-react'
import {
  searchTrains, searchFlights, searchHotels, searchWeb, checkTatkal, askAgent,
} from '../services/agentService'

/** "Book this in JourneyMate" — opens the in-app booking flow with the
 *  current search criteria pre-filled. The flow handles seat picking,
 *  passenger details, and Razorpay test-mode payment end-to-end. */
function BookInJourneyMateCta({ type, from, to, date, classCode }) {
  const params = new URLSearchParams()
  params.set('type', type)
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (date) params.set('date', date)
  if (classCode) params.set('class', classCode)
  return (
    <Link
      to={`/booking?${params.toString()}`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-transparent px-4 py-3 transition-all hover:border-emerald-400/60 hover:from-emerald-500/25 active:scale-[0.99]"
    >
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-200">
          New · One-tap booking
        </p>
        <p className="mt-0.5 text-sm font-bold text-white">
          Book this {type} inside JourneyMate
          <span className="ml-2 text-[11px] font-normal text-slate-300">
            seat picker · Razorpay · email confirmation
          </span>
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 text-emerald-200 text-xs font-bold whitespace-nowrap">
        <Lock size={12} aria-hidden /> Book now <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
      </span>
    </Link>
  )
}

/* ─────────────────────────── helpers ─────────────────────────── */

const todayIso = () => new Date().toISOString().slice(0, 10)
const tomorrowIso = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function ProviderBadge({ provider }) {
  if (!provider) return null
  const live = provider !== 'fallback'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
        live
          ? 'border-emerald-400/40 bg-emerald-100/60 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/12 dark:text-emerald-300'
          : 'border-amber-400/40 bg-amber-100/60 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/12 dark:text-amber-300'
      }`}
    >
      <span className={`relative flex h-1.5 w-1.5`}>
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />}
        <span className={`relative h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      </span>
      {live ? `Live · ${provider}` : 'Booking links'}
    </span>
  )
}

function NoteCard({ note }) {
  if (!note) return null
  return (
    <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-900/8 bg-slate-100/60 p-3 text-xs text-slate-600 dark:border-white/8 dark:bg-white/[0.03] dark:text-slate-400">
      <AlertCircle size={14} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-500" />
      <p className="leading-relaxed">{note}</p>
    </div>
  )
}

function ErrorBanner({ error, onDismiss }) {
  if (!error) return null
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-400/40 bg-rose-100/70 px-3.5 py-2.5 text-xs text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/12 dark:text-rose-300">
      <span className="flex items-start gap-2"><AlertCircle size={14} className="mt-0.5 shrink-0" />{error}</span>
      <button type="button" onClick={onDismiss} className="text-[10px] font-semibold uppercase tracking-wide text-rose-600/80 hover:text-rose-500 dark:text-rose-400/80 dark:hover:text-rose-300">Dismiss</button>
    </div>
  )
}

function PrimaryButton({ children, loading, ...rest }) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition-all hover:from-slate-800 hover:to-slate-600 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.97] touch-manipulation dark:from-white dark:to-slate-200 dark:text-slate-900 dark:hover:from-white dark:hover:to-white dark:shadow-white/15"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
      {children}
    </button>
  )
}

const inputClass =
  'w-full rounded-xl border border-slate-900/12 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm shadow-slate-900/[0.02] focus:border-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white/30 dark:focus:ring-white/10'
const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400'

/* ─────────────────────────── TABS ─────────────────────────── */

const TABS = [
  { id: 'trains',  label: 'Trains',  Icon: Train,   tint: 'from-cyan-500 to-blue-600',     blurb: 'IRCTC live data + Tatkal advisor' },
  { id: 'flights', label: 'Flights', Icon: Plane,   tint: 'from-violet-500 to-fuchsia-600', blurb: 'MMT, Skyscanner, Google Flights' },
  { id: 'hotels',  label: 'Hotels',  Icon: Hotel,   tint: 'from-amber-500 to-orange-600',  blurb: 'Booking.com, Agoda, OYO + map' },
  { id: 'web',     label: 'Web',     Icon: Globe2,  tint: 'from-emerald-500 to-teal-600',  blurb: 'Real-time web search' },
  { id: 'ask',     label: 'Ask AI',  Icon: Sparkles,tint: 'from-rose-500 to-pink-600',     blurb: 'Type any travel question' },
]

/* ─────────────────────────── TRAINS ─────────────────────────── */

function TrainsTab() {
  const [form, setForm] = useState({ from: '', to: '', date: tomorrowIso(), klass: 'SL' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [tatkal, setTatkal] = useState(null)
  const [tatkalLoading, setTatkalLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setData(null)
    setTatkal(null)
    try {
      const res = await searchTrains(form)
      setData(res)
      setTatkalLoading(true)
      try {
        const t = await checkTatkal({ journey_date: res.date, klass: form.klass })
        setTatkal(t)
      } finally { setTatkalLoading(false) }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <ErrorBanner error={error} onDismiss={() => setError(null)} />
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <label className={labelClass}>From</label>
          <input className={inputClass} placeholder="Delhi or NDLS" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} required />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>To</label>
          <input className={inputClass} placeholder="Mumbai or BCT" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Date</label>
          <input type="date" className={inputClass} value={form.date} min={todayIso()} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Class</label>
          <select className={inputClass} value={form.klass} onChange={(e) => setForm({ ...form, klass: e.target.value })}>
            <option value="SL">Sleeper (SL)</option>
            <option value="2S">2S</option>
            <option value="3A">AC 3-tier</option>
            <option value="2A">AC 2-tier</option>
            <option value="1A">AC 1st</option>
            <option value="CC">Chair Car</option>
            <option value="EC">Exec Chair</option>
          </select>
        </div>
        <div className="sm:col-span-4 flex justify-end">
          <PrimaryButton loading={loading} type="submit">Search trains</PrimaryButton>
        </div>
      </form>

      {tatkal?.ok && (
        <div className="mt-5 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-50/90 to-orange-50/70 p-4 dark:border-amber-400/30 dark:from-amber-500/[0.06] dark:to-orange-500/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tatkal advisor</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">{tatkal.tatkal_window?.class_group} · opens {tatkal.tatkal_window?.opens_at} on {tatkal.tatkal_window?.opens_on}</p>
            </div>
            <span className="rounded-full border border-amber-500/40 bg-white/80 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-slate-900/60 dark:text-amber-300">{tatkal.chance?.label}</span>
          </div>
          <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">{tatkal.chance?.detail}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-500">Tip: {tatkal.tip}</p>
        </div>
      )}
      {tatkalLoading && !tatkal && (
        <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-900/8 bg-slate-100/60 px-3 py-2 text-xs text-slate-600 dark:border-white/8 dark:bg-white/[0.03] dark:text-slate-400">
          <Loader2 size={12} className="animate-spin" /> Computing Tatkal chance…
        </div>
      )}

      {data && (
        <div className="mt-6">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {data.from?.label} <ArrowRight size={14} className="inline mx-1" /> {data.to?.label}
                <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-500">on {data.date}</span>
              </h3>
            </div>
            <ProviderBadge provider={data.provider} />
          </header>

          <BookInJourneyMateCta
            type="train"
            from={data.from?.label || form.from}
            to={data.to?.label || form.to}
            date={data.date || form.date}
          />
          <div className="mb-4" />

          {data.trains?.length > 0 ? (
            <ul className="grid gap-3">
              {data.trains.map((t, i) => (
                <li key={`${t.train_number || i}`} className="rounded-2xl border border-slate-900/8 bg-white/85 p-4 transition-colors hover:border-slate-900/20 dark:border-white/8 dark:bg-white/[0.04] dark:hover:border-white/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{t.train_name || 'Train'} <span className="ml-1 text-xs font-normal tabular-nums text-slate-500 dark:text-slate-500">#{t.train_number}</span></p>
                      <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                        {t.departure} → {t.arrival}
                        {t.duration ? <span className="ml-2 inline-flex items-center gap-1 text-slate-500 dark:text-slate-500"><Clock size={10} />{t.duration}</span> : null}
                        {t.distance_km ? <span className="ml-2 text-slate-500 dark:text-slate-500 tabular-nums">{t.distance_km} km</span> : null}
                      </p>
                    </div>
                    {Array.isArray(t.classes) && t.classes.length > 0 && (
                      <div className="flex flex-wrap justify-end gap-1">
                        {t.classes.slice(0, 4).map((c) => (
                          <span key={c} className="rounded-md border border-slate-900/10 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-slate-900/8 bg-slate-100/60 p-3 text-xs text-slate-600 dark:border-white/8 dark:bg-white/[0.03] dark:text-slate-400">No live train list returned. Use the platform links below — they're pre-filled.</p>
          )}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {data.deep_links?.map((dl) => (
              <a key={dl.url} href={dl.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 rounded-xl border border-slate-900/8 bg-white/85 px-3.5 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-slate-900/20 hover:shadow-md active:scale-[0.98] touch-manipulation dark:border-white/8 dark:bg-white/[0.04] dark:hover:border-white/20">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900 dark:text-white">{dl.name} <span className="ml-1 rounded-md border border-slate-900/10 bg-slate-100 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">{dl.tag}</span></p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-500">{dl.note}</p>
                </div>
                <ExternalLink size={14} className="shrink-0 text-slate-400 transition-colors group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-white" />
              </a>
            ))}
          </div>
          <NoteCard note={data.note} />
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── FLIGHTS ─────────────────────────── */

function FlightsTab() {
  const [form, setForm] = useState({ from: '', to: '', date: tomorrowIso(), return_date: '', passengers: 1, cabin: 'economy' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await searchFlights(form)
      setData(res)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <ErrorBanner error={error} onDismiss={() => setError(null)} />
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label className={labelClass}>From</label>
          <input className={inputClass} placeholder="Delhi or DEL" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} required />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>To</label>
          <input className={inputClass} placeholder="Goa or GOI" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Departure</label>
          <input type="date" className={inputClass} value={form.date} min={todayIso()} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Return</label>
          <input type="date" className={inputClass} value={form.return_date} min={form.date || todayIso()} onChange={(e) => setForm({ ...form, return_date: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Passengers</label>
          <input type="number" min="1" max="9" className={inputClass} value={form.passengers} onChange={(e) => setForm({ ...form, passengers: Number(e.target.value) || 1 })} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Cabin</label>
          <select className={inputClass} value={form.cabin} onChange={(e) => setForm({ ...form, cabin: e.target.value })}>
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex items-end justify-end">
          <PrimaryButton loading={loading} type="submit">Search flights</PrimaryButton>
        </div>
      </form>

      {data && (
        <div className="mt-6">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {data.from?.label} ({data.from?.code}) <ArrowRight size={14} className="inline mx-1" /> {data.to?.label} ({data.to?.code})
                <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-500">on {data.date}{data.return_date ? ` · return ${data.return_date}` : ''}</span>
              </h3>
            </div>
            <ProviderBadge provider={data.provider} />
          </header>

          <BookInJourneyMateCta
            type="flight"
            from={data.from?.label || form.from}
            to={data.to?.label || form.to}
            date={data.date || form.date}
            classCode={form.cabin === 'premium_economy' ? 'premium' : form.cabin === 'first' ? 'business' : form.cabin}
          />
          <div className="mb-4" />

          {data.offers?.length > 0 ? (
            <ul className="grid gap-3">
              {data.offers.map((o, i) => (
                <li key={i} className="rounded-2xl border border-slate-900/8 bg-white/85 p-4 dark:border-white/8 dark:bg-white/[0.04]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{o.airline} {o.flight_number ? `· ${o.flight_number}` : ''}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{o.departure} → {o.arrival} {o.stops ? `· ${o.stops} stop(s)` : '· non-stop'}</p>
                    </div>
                    {o.price ? (
                      <span className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{o.currency || '₹'} {o.price}</span>
                    ) : null}
                  </div>
                  {o.seats_left ? <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">{o.seats_left} seats left at this fare</p> : null}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {data.deep_links?.map((dl) => (
              <a key={dl.url} href={dl.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 rounded-xl border border-slate-900/8 bg-white/85 px-3.5 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:border-slate-900/20 hover:shadow-md active:scale-[0.98] touch-manipulation dark:border-white/8 dark:bg-white/[0.04] dark:hover:border-white/20">
                <p className="truncate font-bold text-slate-900 dark:text-white">{dl.name} <span className="ml-1 rounded-md border border-slate-900/10 bg-slate-100 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">{dl.tag}</span></p>
                <ExternalLink size={14} className="shrink-0 text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-white" />
              </a>
            ))}
          </div>
          <NoteCard note={data.note} />
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── HOTELS ─────────────────────────── */

function HotelsTab() {
  const [form, setForm] = useState({ destination: '', check_in: todayIso(), check_out: tomorrowIso(), guests: 2, type: 'any' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await searchHotels(form)
      setData(res)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <ErrorBanner error={error} onDismiss={() => setError(null)} />
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label className={labelClass}>Destination</label>
          <input className={inputClass} placeholder="Goa, Manali, Jaipur…" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Check-in</label>
          <input type="date" className={inputClass} value={form.check_in} min={todayIso()} onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Check-out</label>
          <input type="date" className={inputClass} value={form.check_out} min={form.check_in || todayIso()} onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Guests</label>
          <input type="number" min="1" max="8" className={inputClass} value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) || 2 })} />
        </div>
        <div className="sm:col-span-1">
          <label className={labelClass}>Type</label>
          <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="any">Any</option>
            <option value="hotel">Hotel</option>
            <option value="resort">Resort</option>
            <option value="hostel">Hostel</option>
            <option value="guest_house">Guest house</option>
          </select>
        </div>
        <div className="sm:col-span-6 flex justify-end">
          <PrimaryButton loading={loading} type="submit">Find stays</PrimaryButton>
        </div>
      </form>

      {data && (
        <div className="mt-6">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Stays in {data.destination}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-500">{data.check_in} → {data.check_out} · {data.guests} guest(s)</p>
            </div>
            <ProviderBadge provider={data.provider} />
          </header>

          <BookInJourneyMateCta
            type="hotel"
            from={data.destination || form.destination}
            to={data.destination || form.destination}
            date={data.check_in || form.check_in}
          />
          <div className="mb-4" />

          {data.stays?.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {data.stays.map((s, i) => (
                <li key={`${s.name}-${i}`} className="rounded-2xl border border-slate-900/8 bg-white/85 p-4 dark:border-white/8 dark:bg-white/[0.04]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-500">
                        <Tag size={10} />{s.type?.replace('_', ' ')}{s.stars ? ` · ${'★'.repeat(s.stars)}` : ''}
                      </p>
                      {s.address && <p className="mt-1 truncate text-[11px] text-slate-600 dark:text-slate-400"><MapPin size={10} className="inline mr-0.5" />{s.address}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.booking_links?.map((bl) => (
                      <a key={bl.url} href={bl.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-900/10 bg-slate-100/70 px-2 py-1 text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 active:scale-[0.97] touch-manipulation dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
                        <ExternalLink size={10} />{bl.label}
                      </a>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {data.destination_links?.length > 0 && (
            <>
              <h4 className="mt-6 mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-500">Search every hotel in {data.destination}</h4>
              <div className="grid gap-2 sm:grid-cols-3">
                {data.destination_links.map((dl) => (
                  <a key={dl.url} href={dl.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 rounded-xl border border-slate-900/8 bg-white/85 px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-slate-900/20 hover:shadow-md active:scale-[0.98] touch-manipulation dark:border-white/8 dark:bg-white/[0.04] dark:hover:border-white/20">
                    <p className="font-bold text-slate-900 dark:text-white">{dl.label}</p>
                    <ExternalLink size={12} className="text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-white" />
                  </a>
                ))}
              </div>
            </>
          )}
          <NoteCard note={data.note} />
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── WEB ─────────────────────────── */

function WebTab() {
  const [form, setForm] = useState({ query: '', topic: 'general' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await searchWeb({ query: form.query, topic: form.topic })
      setData(res)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <ErrorBanner error={error} onDismiss={() => setError(null)} />
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label className={labelClass}>Search the web</label>
          <input className={inputClass} placeholder="cheap flights to Goa in December, visa for Bali, weather in Manali…" value={form.query} onChange={(e) => setForm({ ...form, query: e.target.value })} required />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Topic</label>
          <select className={inputClass} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
            <option value="general">General</option>
            <option value="news">News (recent)</option>
          </select>
        </div>
        <div className="sm:col-span-6 flex justify-end">
          <PrimaryButton loading={loading} type="submit">Search</PrimaryButton>
        </div>
      </form>

      {data && (
        <div className="mt-6">
          <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Results</h3>
            <ProviderBadge provider={data.provider} />
          </header>
          {data.answer && (
            <div className="mb-4 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 p-4 text-sm text-slate-800 dark:border-emerald-400/30 dark:from-emerald-500/[0.08] dark:to-teal-500/[0.04] dark:text-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-1">AI summary</p>
              <p className="leading-relaxed">{data.answer}</p>
            </div>
          )}
          <ul className="grid gap-3">
            {(data.results || []).map((r, i) => (
              <li key={`${r.url}-${i}`} className="rounded-2xl border border-slate-900/8 bg-white/85 p-4 dark:border-white/8 dark:bg-white/[0.04]">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="group">
                  <p className="truncate text-sm font-bold text-slate-900 group-hover:underline dark:text-white">{r.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-emerald-700 dark:text-emerald-400">{r.url}</p>
                  {r.snippet && <p className="mt-2 line-clamp-3 text-xs text-slate-600 dark:text-slate-400">{r.snippet}</p>}
                </a>
              </li>
            ))}
          </ul>
          <NoteCard note={data.note} />
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── ASK AI ─────────────────────────── */

function AskTab() {
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || loading) return
    const userMsg = { role: 'user', content: message.trim() }
    setHistory((h) => [...h, userMsg])
    setMessage('')
    setLoading(true)
    setError(null)
    try {
      const res = await askAgent({ message: userMsg.content, history })
      setHistory((h) => [...h, { role: 'assistant', content: res.answer || '…', meta: res }])
    } catch (err) {
      setError(err.message)
      setHistory((h) => [...h, { role: 'assistant', content: '⚠️ ' + err.message }])
    } finally { setLoading(false) }
  }

  const examples = useMemo(() => [
    'Trains from Delhi to Mumbai tomorrow with sleeper class',
    'Hotels in Manali for 3 guests under ₹3000/night',
    'Cheapest flights from Bengaluru to Goa next weekend',
    'What time does Tatkal open for AC class?',
  ], [])

  return (
    <div>
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {history.length === 0 && (
        <div className="mb-5 rounded-2xl border border-slate-900/8 bg-gradient-to-br from-rose-50/70 to-pink-50/40 p-4 dark:border-white/8 dark:from-rose-500/[0.06] dark:to-pink-500/[0.03]">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-rose-600 dark:text-rose-400" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">Ask the live booking agent anything</p>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Type any travel question — the agent picks the right tool (trains / flights / hotels / web) and replies with live data and booking links.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {examples.map((ex) => (
              <button key={ex} type="button" onClick={() => setMessage(ex)} className="rounded-full border border-slate-900/10 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-slate-900/30 hover:bg-white active:scale-[0.97] touch-manipulation dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-white/30 dark:hover:bg-white/[0.08]">
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      <ul className="mb-4 space-y-3">
        {history.map((m, i) => (
          <li key={i} className={`rounded-2xl border p-3.5 ${
            m.role === 'user'
              ? 'border-slate-900/12 bg-slate-100/80 dark:border-white/12 dark:bg-white/[0.06]'
              : 'border-rose-300/50 bg-gradient-to-br from-rose-50/60 to-pink-50/30 dark:border-rose-400/25 dark:from-rose-500/[0.05] dark:to-pink-500/[0.02]'
          }`}>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-500">{m.role === 'user' ? 'You' : 'Agent'}</p>
            <p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">{m.content}</p>
            {m.role === 'assistant' && Array.isArray(m.meta?.steps) && m.meta.steps.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300">Tools used ({m.meta.steps.length})</summary>
                <ul className="mt-2 space-y-2">
                  {m.meta.steps.map((s, k) => (
                    <li key={k} className="rounded-lg border border-slate-900/8 bg-white/70 px-2.5 py-2 text-[11px] dark:border-white/8 dark:bg-white/[0.04]">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{s.tool}</p>
                      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-[10px] text-slate-500 dark:text-slate-500">{JSON.stringify(s.args, null, 2)}</pre>
                      {Array.isArray(s.result?.deep_links) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {s.result.deep_links.slice(0, 4).map((dl) => (
                            <a key={dl.url} href={dl.url} target="_blank" rel="noopener noreferrer" className="rounded border border-slate-900/10 bg-slate-100 px-1.5 py-0.5 font-bold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/10">{dl.name}</a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className={inputClass}
          placeholder="Ask anything — trains, flights, hotels, visas, prices…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition-all hover:from-rose-400 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.97] touch-manipulation"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </form>
    </div>
  )
}

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function LiveBookingAgent() {
  const [tab, setTab] = useState('trains')

  useEffect(() => {
    document.title = 'Live booking agent · JourneyMate'
  }, [])

  const ActiveTab = useMemo(() => ({
    trains: TrainsTab,
    flights: FlightsTab,
    hotels: HotelsTab,
    web: WebTab,
    ask: AskTab,
  }[tab]), [tab])

  return (
    <main className="min-h-screen pb-20 pt-24 sm:pt-28">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {/* ──────────── Hero ──────────── */}
        <header className="relative mb-8 overflow-hidden rounded-3xl border border-slate-900/8 bg-gradient-to-br from-white/80 via-white/50 to-white/30 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-md dark:border-white/8 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/30 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/30 to-cyan-400/20 blur-3xl dark:from-emerald-500/20 dark:to-cyan-500/15" aria-hidden />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-gradient-to-br from-rose-400/30 to-violet-400/20 blur-3xl dark:from-rose-500/20 dark:to-violet-500/15" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-100/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/12 dark:text-emerald-300">
              <Wifi size={10} />Real-time
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
              Live booking agent
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Real-time train, flight & hotel data from the open web — plus a natural-language assistant that picks the right tool for any travel question.
            </p>

            <ul className="mt-4 grid gap-2 text-[11px] sm:grid-cols-3">
              {[
                { Icon: Train, t: 'Trains', d: 'IRCTC live availability + Tatkal advisor' },
                { Icon: Plane, t: 'Flights', d: 'Pre-filled MMT, Skyscanner, Google Flights' },
                { Icon: Hotel, t: 'Hotels & resorts', d: 'OSM + Booking.com / Agoda / OYO' },
              ].map(({ Icon, t, d }) => (
                <li key={t} className="flex items-start gap-2 rounded-xl border border-slate-900/8 bg-white/70 p-2.5 dark:border-white/8 dark:bg-white/[0.04]">
                  <Icon size={14} className="mt-0.5 shrink-0 text-slate-700 dark:text-slate-300" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white">{t}</p>
                    <p className="truncate text-slate-600 dark:text-slate-400">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </header>

        {/* ──────────── Tabs ──────────── */}
        <nav className="mb-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate-900/8 bg-white/80 p-1.5 backdrop-blur-md dark:border-white/8 dark:bg-white/[0.04]" aria-label="Agent tools">
          {TABS.map(({ id, label, Icon, tint, blurb }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all active:scale-[0.97] touch-manipulation ${
                  active
                    ? `bg-gradient-to-br ${tint} text-white shadow-md`
                    : 'text-slate-600 hover:bg-slate-900/[0.04] hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
                }`}
                title={blurb}
              >
                <Icon size={14} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* ──────────── Active tab body ──────────── */}
        <section className="rounded-3xl border border-slate-900/8 bg-white/85 p-5 shadow-md shadow-slate-900/5 backdrop-blur-md dark:border-white/8 dark:bg-white/[0.04] sm:p-6">
          <ActiveTab />
        </section>

        <footer className="mt-6 text-center text-[11px] text-slate-500 dark:text-slate-500">
          Live data is best-effort. Always confirm prices and seat availability on the official booking site before paying.
        </footer>
      </div>
    </main>
  )
}
