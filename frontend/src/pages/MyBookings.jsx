import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

import BookingsList from '../components/booking/BookingsList'

/* ────────────────────────────────────────────────────────────────────
 *  MyBookings.jsx
 *
 *  Standalone "/my-bookings" route. Kept as a deep-link target for
 *  bookmarks / confirmation-email links — the primary entry point now
 *  lives inside Live Search → Bookings tab, since the user removed the
 *  navbar link.
 *
 *  The list, filtering, refresh, and cancel logic all live in
 *  components/booking/BookingsList so this page and the Live Search
 *  tab share the same UI (DRY + a single place to evolve the design).
 * ────────────────────────────────────────────────────────────────── */

export default function MyBookings() {
  return (
    <main className="relative min-h-[100dvh] pt-24 sm:pt-28 pb-16">
      <Backdrop />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          to="/live-search?tab=bookings"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" aria-hidden />
          Back to Live Search
        </Link>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-3">
            <Sparkles size={11} aria-hidden /> My bookings
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
            All your trips, in one place
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Trains, flights and hotels you&apos;ve booked through JourneyMate.
          </p>
        </header>

        <BookingsList />
      </div>
    </main>
  )
}

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
