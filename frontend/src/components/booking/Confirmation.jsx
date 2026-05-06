import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Mail, Download, ArrowRight, Plane, Train, BedDouble } from 'lucide-react'

import { fmtInr, classLabel } from '../../data/bookingContent'

const TYPE_ICON = { train: Train, flight: Plane, hotel: BedDouble }

/**
 * Confirmation screen — the last step of the booking flow.
 *
 * Renders the final booking ref, provider PNR (when available),
 * trip summary, and a "What's next" panel.
 */
export default function Confirmation({ booking, providerMessage }) {
  if (!booking) return null
  const Icon = TYPE_ICON[booking.type] || Train
  const providerRef = booking.payload?.providerRef
  const passengers = Array.isArray(booking.payload?.passengers) ? booking.payload.passengers : []

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/40 mb-4">
          <CheckCircle2 size={32} className="text-emerald-300" aria-hidden />
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mb-2">
          You&apos;re booked!
        </h2>
        <p className="text-sm text-slate-400">
          Confirmation details are on screen and on the way to your inbox.
        </p>
      </div>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/4 to-white/4 p-5 sm:p-7">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-emerald-200">
              <Icon size={16} aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-wider">{booking.type}</span>
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white truncate">
              {booking.payload?.offer?.title || `${booking.origin} → ${booking.destination}`}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {booking.origin}{booking.destination ? ` → ${booking.destination}` : ''}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Booking ref</div>
            <div className="text-xl font-extrabold text-white tracking-wider">
              {booking.bookingRef}
            </div>
          </div>
        </header>

        <dl className="mt-5 grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
          {providerRef && (
            <>
              <dt className="text-slate-400">Provider PNR</dt>
              <dd className="text-white font-semibold">{providerRef}</dd>
            </>
          )}
          <dt className="text-slate-400">Class / room</dt>
          <dd className="text-white font-semibold">
            {classLabel(booking.type, booking.payload?.classCode)}
          </dd>
          <dt className="text-slate-400">Travel date</dt>
          <dd className="text-white font-semibold">
            {booking.travelDate
              ? new Date(booking.travelDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })
              : '—'}
          </dd>
          <dt className="text-slate-400">Total paid</dt>
          <dd className="text-white font-extrabold text-base">
            {fmtInr(booking.priceInr)}
          </dd>
        </dl>

        {passengers.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">
              Passengers
            </div>
            <ul className="space-y-1.5 text-sm" role="list">
              {passengers.map((p, idx) => (
                <li key={idx} className="flex items-center justify-between text-slate-300">
                  <span>{p.fullName || `Passenger ${idx + 1}`}</span>
                  <span className="text-slate-500 text-xs">{p.age || '—'} · {p.gender || '—'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {providerMessage && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 leading-relaxed">
            {providerMessage}
          </div>
        )}
      </section>

      <div className="grid sm:grid-cols-2 gap-3 mt-6">
        <Link
          to="/my-bookings"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 bg-white/4 hover:bg-white/8 text-white font-semibold text-sm transition-colors"
        >
          <Mail size={14} aria-hidden /> See all my bookings
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
        >
          Plan another trip <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-[12px] text-slate-400 hover:text-white transition-colors"
        >
          <Download size={12} aria-hidden /> Save / print this confirmation
        </button>
      </div>
    </div>
  )
}
