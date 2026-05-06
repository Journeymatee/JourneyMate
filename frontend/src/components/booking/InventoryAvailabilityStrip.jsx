import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Loader2, Sparkles, ArrowRight, AlertCircle, Lock, Star,
} from 'lucide-react'

import { fetchInventory, bookingErrorMessage } from '../../services/bookingService'
import { fmtInr, classLabel } from '../../data/bookingContent'

/* ────────────────────────────────────────────────────────────────────
 *  InventoryAvailabilityStrip
 *
 *  Shown inside each Live Search tab. Hits the booking inventory API
 *  (the same one the BookingFlow wizard uses) so the user can see
 *  seats / rooms left **per class** and jump straight to the seat
 *  picker by tapping a class chip.
 *
 *  Why parallel to the live agent results, not merged?
 *    The live agent (Tavily / IRCTC / Amadeus when configured) returns
 *    real train numbers and airline IATA codes — but does not always
 *    return availability. The booking inventory is the source of truth
 *    for seat counts inside JourneyMate. Showing both in parallel keeps
 *    each surface honest:
 *      - Live agent  → "what's running today" + deep links to MMT/IRCTC
 *      - This strip  → "what we can book for you right now"
 * ────────────────────────────────────────────────────────────────── */

export default function InventoryAvailabilityStrip({ type, origin, destination, date }) {
  const [state, setState] = useState({ loading: false, error: '', items: [] })

  useEffect(() => {
    if (!origin) return undefined
    if (type !== 'hotel' && !destination) return undefined

    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: '' }))
    fetchInventory({
      type,
      origin,
      destination,
      travelDate: date,
      checkIn: date,
    })
      .then((rows) => { if (!cancelled) setState({ loading: false, error: '', items: rows }) })
      .catch((err) => {
        if (cancelled) return
        setState({ loading: false, error: bookingErrorMessage(err), items: [] })
      })
    return () => { cancelled = true }
  }, [type, origin, destination, date])

  if (!origin) return null

  return (
    <section className="mt-6 rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-50 via-cyan-50/60 to-white p-3.5 sm:p-4 dark:border-emerald-400/30 dark:from-emerald-500/10 dark:via-cyan-500/8 dark:to-transparent">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-200">
            <Sparkles size={10} aria-hidden /> Live availability
          </div>
          <h4 className="mt-1.5 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Bookable now in JourneyMate
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Tap any class to skip straight to seat selection. Numbers update in real time.
          </p>
        </div>
        {state.loading && (
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-500 shrink-0">
            <Loader2 size={11} className="animate-spin" aria-hidden /> Checking
          </span>
        )}
      </header>

      {state.error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-100/80 px-3 py-2 text-xs text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/12 dark:text-rose-300 flex items-start gap-2">
          <AlertCircle size={12} className="mt-0.5 shrink-0" aria-hidden />
          <span>{state.error}</span>
        </div>
      )}

      {!state.error && state.items.length === 0 && state.loading && <SkeletonRows />}

      {!state.error && state.items.length === 0 && !state.loading && (
        <p className="text-xs text-slate-500 dark:text-slate-500 italic">
          No JourneyMate inventory for this route yet. Use the search results below.
        </p>
      )}

      {!state.error && state.items.length > 0 && (
        <ul className="grid gap-2" role="list">
          {state.items.map((offer) => (
            <InventoryRow
              key={offer.id}
              type={type}
              offer={offer}
              origin={origin}
              destination={destination}
              date={date}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

/* ─── subcomponents ────────────────────────────────────────────────── */

function SkeletonRows() {
  return (
    <ul className="grid gap-2" role="list">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-16 rounded-xl border border-slate-900/8 bg-white/70 animate-pulse dark:border-white/8 dark:bg-white/[0.04]"
        />
      ))}
    </ul>
  )
}

function bookingHref({ type, offerId, origin, destination, date, classCode }) {
  const params = new URLSearchParams()
  params.set('type', type)
  if (offerId)     params.set('offer', offerId)
  if (origin)      params.set('from', origin)
  if (destination) params.set('to', destination)
  if (date)        params.set('date', date)
  if (classCode)   params.set('class', classCode)
  return `/booking?${params.toString()}`
}

function InventoryRow({ type, offer, origin, destination, date }) {
  const isHotel = type === 'hotel'
  const fareEntries = isHotel
    ? Object.entries(offer.rooms || {})
    : Object.entries(offer.fares || {})

  return (
    <li className="rounded-xl border border-slate-900/10 bg-white/95 px-3 py-2.5 sm:px-3.5 sm:py-3 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{offer.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-500">
            {offer.departs && offer.arrives && (
              <span className="tabular-nums">{offer.departs} → {offer.arrives}</span>
            )}
            {Number.isFinite(offer.durationMins) && (
              <span>{Math.floor(offer.durationMins / 60)}h {offer.durationMins % 60}m</span>
            )}
            {Number.isFinite(offer.distanceKm) && <span className="tabular-nums">{offer.distanceKm} km</span>}
            {offer.runsOn && <span>{offer.runsOn}</span>}
            {offer.stops != null && <span>{offer.stops === 0 ? 'Non-stop' : `${offer.stops} stop`}</span>}
            {Number.isFinite(offer.rating) && (
              <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-300">
                <Star size={10} className="fill-current" aria-hidden /> {offer.rating}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {fareEntries.map(([code, fare]) => (
          <ClassChip
            key={code}
            type={type}
            code={code}
            fare={fare}
            href={bookingHref({
              type,
              offerId: offer.id,
              origin,
              destination,
              date,
              classCode: code,
            })}
          />
        ))}
      </div>
    </li>
  )
}

/**
 * Class / room chip with seat-availability badge. Tapping it deep-links
 * into the booking flow with the offer + class pre-selected so the
 * wizard lands directly on the seat picker.
 */
function ClassChip({ type, code, fare, href }) {
  const seats   = fare.available
  const price   = fare.price ?? fare.pricePerNight
  const soldOut = seats === 0
  const isHotel = type === 'hotel'

  const baseCls = 'group inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] sm:text-xs font-bold transition-all'
  const liveCls = 'border-emerald-500/45 bg-white text-emerald-800 hover:bg-emerald-50 hover:border-emerald-500/70 hover:-translate-y-0.5 active:scale-[0.97] dark:border-emerald-400/35 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20'
  const deadCls = 'border-slate-900/15 bg-slate-100 text-slate-400 cursor-not-allowed dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-600'

  const inner = (
    <>
      <span>{classLabel(type, code)}</span>
      <span className="font-mono font-semibold opacity-90">
        {fmtInr(price)}{isHotel ? ' /night' : ''}
      </span>
      <SeatsBadge count={seats} label={isHotel ? 'rooms' : 'seats'} />
      {!soldOut && (
        <span className="hidden sm:inline-flex items-center gap-0.5 ml-0.5">
          <Lock size={10} aria-hidden />
          <span>Book</span>
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
        </span>
      )}
    </>
  )

  if (soldOut) {
    return <span className={`${baseCls} ${deadCls}`} aria-disabled>{inner}</span>
  }

  return (
    <Link to={href} className={`${baseCls} ${liveCls}`}>
      {inner}
    </Link>
  )
}

/**
 * Colour-graded seat-availability badge:
 *   0          → "Sold out"      (rose)
 *   1-5        → "X left"        (amber)
 *   6-19       → "X seats"       (cyan)
 *   ≥20        → "X seats"       (emerald)
 *   non-finite → "—"             (slate)
 */
function SeatsBadge({ count, label = 'seats' }) {
  let colour
  let text
  if (!Number.isFinite(count)) {
    colour = 'border-slate-900/15 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-400'
    text = '—'
  } else if (count <= 0) {
    colour = 'border-rose-500/45 bg-rose-100 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-200'
    text = 'Sold out'
  } else if (count < 6) {
    colour = 'border-amber-500/45 bg-amber-100 text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-200'
    text = `${count} left`
  } else if (count < 20) {
    colour = 'border-cyan-500/45 bg-cyan-100 text-cyan-700 dark:border-cyan-400/40 dark:bg-cyan-500/15 dark:text-cyan-200'
    text = `${count} ${label}`
  } else {
    colour = 'border-emerald-500/45 bg-emerald-100 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200'
    text = `${count} ${label}`
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${colour}`}>
      {text}
    </span>
  )
}
