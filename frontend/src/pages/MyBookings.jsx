import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Train, Plane, BedDouble, Sparkles, Clock,
  CheckCircle2, XCircle, AlertTriangle, RefreshCcw, X,
} from 'lucide-react'

import { listMyBookings, cancelBooking, bookingErrorMessage } from '../services/bookingService'
import { fmtInr, classLabel } from '../data/bookingContent'

const TYPE_ICON   = { train: Train, flight: Plane, hotel: BedDouble }
const TYPE_LABEL  = { train: 'Train', flight: 'Flight', hotel: 'Hotel' }

const STATUS_META = {
  pending:   { label: 'Pending',   color: 'border-amber-500/40 bg-amber-500/15 text-amber-200',     Icon: Clock },
  confirmed: { label: 'Confirmed', color: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'border-rose-500/40 bg-rose-500/15 text-rose-200',         Icon: XCircle },
  failed:    { label: 'Failed',    color: 'border-rose-500/40 bg-rose-500/15 text-rose-200',         Icon: AlertTriangle },
}

/* ────────────────────────────────────────────────────────────────────
 *  MyBookings.jsx
 *
 *  Shows the signed-in user's bookings (most recent first), with a
 *  status pill, ref, total paid, and a one-click cancel for confirmed
 *  bookings. Supports reloading and pulls data directly from
 *  `/api/bookings`.
 * ────────────────────────────────────────────────────────────────── */

export default function MyBookings() {
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
    <main className="relative min-h-[100dvh] pt-24 sm:pt-28 pb-16">
      <Backdrop />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" aria-hidden />
          Back to JourneyMate
        </Link>

        <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-3">
              <Sparkles size={11} aria-hidden /> My bookings
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              All your trips, in one place
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Trains, flights and hotels you&apos;ve booked through JourneyMate.
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 bg-white/4 text-xs font-semibold text-slate-200 hover:bg-white/8 transition-colors"
          >
            <RefreshCcw size={12} aria-hidden /> Refresh
          </button>
        </header>

        {loading && <SkeletonList />}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && <EmptyState />}

        {!loading && !error && grouped.upcoming.length > 0 && (
          <Section title="Upcoming & confirmed">
            <ul className="grid gap-3" role="list">
              {grouped.upcoming.map((b) => (
                <BookingCard
                  key={b.id}
                  b={b}
                  onCancel={onCancel}
                  cancelling={busyId === b.id}
                />
              ))}
            </ul>
          </Section>
        )}

        {!loading && !error && grouped.archived.length > 0 && (
          <Section title="Cancelled">
            <ul className="grid gap-3 opacity-80" role="list">
              {grouped.archived.map((b) => (
                <BookingCard key={b.id} b={b} />
              ))}
            </ul>
          </Section>
        )}
      </div>
    </main>
  )
}

/* ─── Subcomponents ────────────────────────────────────────────────── */

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)' }}
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">
        {title}
      </h2>
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
          className="rounded-2xl border border-white/10 bg-white/4 p-4 animate-pulse h-[5.5rem]"
        />
      ))}
    </ul>
  )
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/4 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 mb-4">
        <Sparkles size={20} className="text-emerald-300" aria-hidden />
      </div>
      <h3 className="font-display text-2xl font-bold text-white tracking-tight mb-1.5">
        No bookings yet
      </h3>
      <p className="text-sm text-slate-400 max-w-sm mx-auto mb-5">
        When you book a train, flight or hotel through JourneyMate it&apos;ll
        show up here with full passenger and payment details.
      </p>
      <Link
        to="/booking?type=train"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all"
      >
        Make your first booking
      </Link>
    </div>
  )
}

function BookingCard({ b, onCancel, cancelling }) {
  const Icon   = TYPE_ICON[b.type] || Train
  const status = STATUS_META[b.status] || STATUS_META.pending
  const StatusIcon = status.Icon

  return (
    <li className="rounded-2xl border border-white/10 bg-white/4 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="shrink-0 grid place-items-center w-11 h-11 rounded-xl border border-white/15 bg-white/5 text-slate-200" aria-hidden>
          <Icon size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-500 font-bold uppercase tracking-wider">{TYPE_LABEL[b.type] || b.type}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono">{b.bookingRef}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
              <StatusIcon size={10} aria-hidden /> {status.label}
            </span>
            {b.paymentStatus && b.paymentStatus !== 'paid' && b.paymentStatus !== 'pending' && (
              <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                {b.paymentStatus}
              </span>
            )}
          </div>

          <div className="mt-1 text-sm sm:text-base font-bold text-white truncate">
            {b.payload?.offer?.title || `${b.origin} → ${b.destination}`}
          </div>

          <div className="mt-1 text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>{b.origin}{b.destination ? ` → ${b.destination}` : ''}</span>
            {b.travelDate && (
              <span>
                {new Date(b.travelDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            )}
            {b.payload?.classCode && <span>{classLabel(b.type, b.payload.classCode)}</span>}
            {b.payload?.providerRef && <span>PNR {b.payload.providerRef}</span>}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-base sm:text-lg font-extrabold text-white">
            {fmtInr(b.priceInr)}
          </div>
          {b.status === 'confirmed' && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(b.id)}
              disabled={cancelling}
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200 disabled:opacity-50"
            >
              <X size={11} aria-hidden /> {cancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}
