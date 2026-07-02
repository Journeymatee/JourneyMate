import React from 'react'
import { Lock, AlertCircle } from 'lucide-react'

import { fmtInr, classLabel, DEMO_BANNER_COPY } from '../../data/bookingContent'

/**
 * Final review + Pay button.
 *
 * Shows the offer summary, the price breakdown, and a "Pay" button.
 * The actual Razorpay Checkout opening + verification flow lives in
 * the parent (`BookingFlow.jsx`) so this component stays a pure form.
 */
export default function PaymentReview({
  type, offer, classCode, passengers, contactEmail,
  quote, demoMode, processing, error, onPay,
}) {
  const total = quote?.total
  const breakdown = Array.isArray(quote?.breakdown) ? quote.breakdown : []

  return (
    <div className="grid lg:grid-cols-[1fr_22rem] gap-5">
      {/* ── Left: trip summary ───────────────────────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-white/4 p-4 sm:p-5 space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Trip summary</div>
          <div className="mt-1 text-base sm:text-lg font-bold text-white">{offer?.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {offer?.origin}{offer?.destination ? ` → ${offer.destination}` : ''}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-slate-400">Class / room</dt>
          <dd className="text-white text-right font-semibold">{classLabel(type, classCode)}</dd>
          <dt className="text-slate-400">Passengers</dt>
          <dd className="text-white text-right font-semibold">{passengers?.length || 1}</dd>
          {contactEmail && (
            <>
              <dt className="text-slate-400">Confirmation email</dt>
              <dd className="text-white text-right font-semibold truncate">{contactEmail}</dd>
            </>
          )}
        </dl>

        {Array.isArray(passengers) && passengers.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2">
              Travellers
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
      </section>

      {/* ── Right: pay panel ─────────────────────────────────────── */}
      <aside className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-white/4 to-white/4 p-4 sm:p-5 lg:sticky lg:top-24 h-max">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300 mb-2">
          You pay
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {fmtInr(total)}
        </div>

        <ul className="mt-4 space-y-1.5 text-sm" role="list">
          {breakdown.map((row) => (
            <li key={row.label} className="flex items-center justify-between text-slate-300">
              <span className="truncate pr-2">{row.label}</span>
              <span className="font-semibold text-white">{fmtInr(row.value)}</span>
            </li>
          ))}
        </ul>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onPay}
          disabled={processing || !total}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-700 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all"
        >
          <Lock size={14} aria-hidden />
          {processing ? 'Processing…' : `Pay ${fmtInr(total)}`}
        </button>

        <div className="mt-3 text-[10px] text-slate-400 text-center leading-relaxed">
          {demoMode
            ? DEMO_BANNER_COPY.payment
            : 'Secured by Razorpay · 256-bit TLS · UPI, cards, net banking'}
        </div>
      </aside>
    </div>
  )
}
