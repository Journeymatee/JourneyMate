import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Train, Plane, BedDouble, Sparkles, Clock,
  CheckCircle2, XCircle, AlertTriangle, RefreshCcw, X,
} from 'lucide-react'

import { listMyBookings, cancelBooking, bookingErrorMessage } from '../../services/bookingService'
import { fmtInr, classLabel } from '../../data/bookingContent'

/* ────────────────────────────────────────────────────────────────────
 *  BookingsList — the user's confirmed / cancelled bookings.
 *
 *  Reusable surface that powers BOTH the standalone /my-bookings page
 *  AND the "Bookings" tab inside Live Search. The two callers differ
 *  only in chrome (the Live Search tab does not need a "Back" link or
 *  page-level hero), so we keep this component pure-content and let
 *  each caller wrap it with the right shell.
 *
 *  Props:
 *    - density: 'comfortable' | 'compact' — compact drops some padding
 *      so the component feels at home inside Live Search's tab body.
 *    - emptyCta — node rendered inside the empty-state card. Live
 *      Search passes a "Search trains" button; the standalone page
 *      passes a "Make your first booking" CTA.
 * ────────────────────────────────────────────────────────────────── */

const TYPE_ICON   = { train: Train, flight: Plane, hotel: BedDouble }
const TYPE_LABEL  = { train: 'Train', flight: 'Flight', hotel: 'Hotel' }

const STATUS_META = Object.freeze({
  pending:   { label: 'Pending',   color: 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-200',     Icon: Clock },
  confirmed: { label: 'Confirmed', color: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-200',         Icon: XCircle },
  failed:    { label: 'Failed',    color: 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-200',         Icon: AlertTriangle },
})

export default function BookingsList({ density = 'comfortable', emptyCta = null }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [busyId, setBusyId]     = useState(null)

  const reload = () => {
    setLoading(true)
    setError('')
    listMyBookings()
      .then(setBookings)
      .catch((err) => setError(bookingErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  const grouped = useMemo(() => {
    const upcoming = bookings.filter((b) => b.status !== 'cancelled')
    const archived = bookings.filter((b) => b.status === 'cancelled')
    return { upcoming, archived }
  }, [bookings])

  const onCancel = async (id) => {
    if (busyId) return
    setBusyId(id)
    setError('')
    try {
      const res = await cancelBooking(id)
      setBookings((rows) => rows.map((r) => (r.id === id ? res.booking : r)))
    } catch (err) {
      setError(bookingErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your bookings</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-500">
            Trains, flights and hotels you have booked through JourneyMate.
          </p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900/12 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-white/12 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
        >
          <RefreshCcw size={11} className={loading ? 'animate-spin' : ''} aria-hidden /> Refresh
        </button>
      </header>

      {loading && bookings.length === 0 && <SkeletonList />}

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-100/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/12 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && <EmptyState emptyCta={emptyCta} />}

      {!error && grouped.upcoming.length > 0 && (
        <Section title="Upcoming & confirmed" density={density}>
          <ul className="grid gap-3" role="list">
            {grouped.upcoming.map((b) => (
              <BookingCard
                key={b.id}
                b={b}
                onCancel={onCancel}
                cancelling={busyId === b.id}
                density={density}
              />
            ))}
          </ul>
        </Section>
      )}

      {!error && grouped.archived.length > 0 && (
        <Section title="Cancelled" density={density}>
          <ul className="grid gap-3 opacity-80" role="list">
            {grouped.archived.map((b) => (
              <BookingCard key={b.id} b={b} density={density} />
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

/* ─── subcomponents ────────────────────────────────────────────────── */

function Section({ title, children, density }) {
  return (
    <section className={density === 'compact' ? 'mb-5' : 'mb-8'}>
      <h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">
        {title}
      </h4>
      {children}
    </section>
  )
}

function SkeletonList() {
  return (
    <ul className="grid gap-3" role="list">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="rounded-2xl border border-slate-900/8 bg-white/85 p-4 animate-pulse h-[5.5rem] dark:border-white/8 dark:bg-white/[0.04]"
        />
      ))}
    </ul>
  )
}

function EmptyState({ emptyCta }) {
  return (
    <div className="rounded-3xl border border-slate-900/8 bg-white/85 p-8 sm:p-10 text-center dark:border-white/8 dark:bg-white/[0.04]">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-400/30 mb-3">
        <Sparkles size={18} className="text-emerald-700 dark:text-emerald-300" aria-hidden />
      </div>
      <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
        No bookings yet
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-4">
        When you book a train, flight or hotel through JourneyMate it&apos;ll
        show up here with full passenger and payment details.
      </p>
      {emptyCta || (
        <Link
          to="/booking?type=train"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
        >
          Make your first booking
        </Link>
      )}
    </div>
  )
}

function BookingCard({ b, onCancel, cancelling, density }) {
  const Icon       = TYPE_ICON[b.type] || Train
  const status     = STATUS_META[b.status] || STATUS_META.pending
  const StatusIcon = status.Icon
  const padding = density === 'compact' ? 'p-3 sm:p-4' : 'p-4 sm:p-5'

  return (
    <li className={`rounded-2xl border border-slate-900/8 bg-white/95 ${padding} dark:border-white/8 dark:bg-white/[0.05]`}>
      <div className="flex items-start gap-3">
        <span className="shrink-0 grid place-items-center w-11 h-11 rounded-xl border border-slate-900/12 bg-slate-100 text-slate-700 dark:border-white/15 dark:bg-white/5 dark:text-slate-200" aria-hidden>
          <Icon size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider">
              {TYPE_LABEL[b.type] || b.type}
            </span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono">{b.bookingRef}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
              <StatusIcon size={10} aria-hidden /> {status.label}
            </span>
            {b.paymentStatus && b.paymentStatus !== 'paid' && b.paymentStatus !== 'pending' && (
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold uppercase tracking-wider">
                {b.paymentStatus}
              </span>
            )}
          </div>

          <div className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {b.payload?.offer?.title || `${b.origin} → ${b.destination}`}
          </div>

          <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>{b.origin}{b.destination ? ` → ${b.destination}` : ''}</span>
            {b.travelDate && (
              <span>
                {new Date(b.travelDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            )}
            {b.payload?.classCode && <span>{classLabel(b.type, b.payload.classCode)}</span>}
            {b.payload?.providerRef && <span>PNR {b.payload.providerRef}</span>}
            {Array.isArray(b.payload?.passengers) && b.payload.passengers.length > 0 && (
              <span>{b.payload.passengers.length} pax</span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            {fmtInr(b.priceInr)}
          </div>
          {b.status === 'confirmed' && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(b.id)}
              disabled={cancelling}
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200 disabled:opacity-50"
            >
              <X size={11} aria-hidden /> {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}
