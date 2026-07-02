import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, AlertCircle, Train, Plane, BedDouble,
  Calendar, Users, Sparkles,
} from 'lucide-react'

import {
  fetchInventory, fetchQuote, fetchSeatMap, fetchPaymentMode,
  createDraftBooking, verifyPayment, openCheckout, bookingErrorMessage,
} from '../services/bookingService'
import {
  BOOKING_TYPES, BOOKING_TYPE_META, TRAIN_CLASSES, FLIGHT_CABINS, HOTEL_TIERS,
  STEPS, DEMO_BANNER_COPY, fmtInr, classLabel,
} from '../data/bookingContent'

import StepBar       from '../components/booking/StepBar'
import InventoryList from '../components/booking/InventoryList'
import SeatPicker    from '../components/booking/SeatPicker'
import PassengerForm from '../components/booking/PassengerForm'
import PaymentReview from '../components/booking/PaymentReview'
import Confirmation  from '../components/booking/Confirmation'

const TYPE_ICON = { train: Train, flight: Plane, hotel: BedDouble }

/* ────────────────────────────────────────────────────────────────────
 *  BookingFlow.jsx
 *
 *  Five-step wizard:
 *    1. inventory   — pick a train / flight / hotel from live results
 *    2. select      — pick a seat / room
 *    3. passenger   — enter traveller + contact details
 *    4. payment     — review + Razorpay Checkout
 *    5. confirmed   — booking ref + provider PNR + email status
 *
 *  Entry point: `/booking?type=train&from=Delhi&to=Mumbai&date=2026-06-12`
 *  Or: programmatic navigate with location.state = { type, from, to, ... }
 * ────────────────────────────────────────────────────────────────── */

const TODAY = new Date()
const DEFAULT_DATE = (() => {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
})()

function defaultClass(type) {
  if (type === 'flight') return 'economy'
  if (type === 'hotel')  return 'standard'
  return 'SL'
}

function readSearchParams(location) {
  // Support both ?query=string and React Router state.
  const qs = new URLSearchParams(location.search || '')
  const state = location.state || {}
  const type = state.type || qs.get('type') || 'train'
  const safeType = BOOKING_TYPES.includes(type) ? type : 'train'
  return {
    type:        safeType,
    origin:      state.from || qs.get('from') || qs.get('origin') || '',
    destination: state.to   || qs.get('to')   || qs.get('destination') || '',
    travelDate:  state.date || qs.get('date') || qs.get('travelDate') || DEFAULT_DATE,
    initialOfferId: state.offerId || qs.get('offer') || null,
    classCode:   state.classCode || qs.get('class') || defaultClass(safeType),
  }
}

export default function BookingFlow() {
  const navigate = useNavigate()
  const location = useLocation()
  const seed = useMemo(() => readSearchParams(location), [location])

  /* ─── Wizard state ─────────────────────────────────────────────── */
  const [stepIdx, setStepIdx]     = useState(0)
  const [type, setType]           = useState(seed.type)
  const [origin, setOrigin]       = useState(seed.origin)
  const [destination, setDest]    = useState(seed.destination)
  const [travelDate, setDate]     = useState(seed.travelDate)
  const [classCode, setClassCode] = useState(seed.classCode)
  const [items, setItems]         = useState([])
  const [selectedOffer, setOffer] = useState(null)
  const [seatMap, setSeatMap]     = useState(null)
  const [selectedSeats, setSeats] = useState([])
  const [passengers, setPaxList]  = useState([{ fullName: '', age: '', gender: 'M' }])
  const [contactEmail, setEmail]  = useState('')
  const [contactPhone, setPhone]  = useState('')
  const [quote, setQuote]         = useState(null)
  const [draft, setDraft]         = useState(null) // { booking, payment }
  const [confirmed, setConfirmed] = useState(null) // { booking, providerMessage }

  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [paying, setPaying]     = useState(false)
  const [paymentMode, setPaymentMode] = useState({ live: false })

  const meta = BOOKING_TYPE_META[type]
  const Icon = TYPE_ICON[type]

  /* ─── Effects ──────────────────────────────────────────────────── */

  // Detect whether we have real Razorpay keys configured.
  useEffect(() => {
    let mounted = true
    fetchPaymentMode()
      .then((m) => { if (mounted) setPaymentMode(m) })
      .catch(() => { if (mounted) setPaymentMode({ live: false }) })
    return () => { mounted = false }
  }, [])

  // Step 1: load inventory whenever the search criteria change.
  useEffect(() => {
    if (!origin || !destination) return undefined
    let cancelled = false
    setLoading(true)
    setError('')
    fetchInventory({ type, origin, destination, travelDate, checkIn: travelDate })
      .then((rows) => {
        if (cancelled) return
        setItems(rows)
        // Auto-select if URL specified an offerId.
        if (seed.initialOfferId) {
          const hit = rows.find((r) => r.id === seed.initialOfferId)
          if (hit) setOffer(hit)
        }
      })
      .catch((err) => {
        if (cancelled) return
        setError(bookingErrorMessage(err))
        setItems([])
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [type, origin, destination, travelDate, seed.initialOfferId])

  // Step 2: load seat map after the user picks an offer.
  useEffect(() => {
    if (!selectedOffer || stepIdx < 1) return undefined
    let cancelled = false
    setLoading(true)
    fetchSeatMap({ type, offer: selectedOffer, classCode })
      .then((m) => { if (!cancelled) setSeatMap(m) })
      .catch((err) => { if (!cancelled) setError(bookingErrorMessage(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedOffer, type, classCode, stepIdx])

  // Step 4: refresh the price quote whenever class / passengers change.
  useEffect(() => {
    if (!selectedOffer || stepIdx < 3) return undefined
    let cancelled = false
    setLoading(true)
    fetchQuote({
      type,
      offer: selectedOffer,
      classCode,
      passengerCount: passengers.length,
      nights: type === 'hotel' ? 1 : undefined,
    })
      .then((q) => { if (!cancelled) setQuote(q) })
      .catch((err) => { if (!cancelled) setError(bookingErrorMessage(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedOffer, type, classCode, passengers.length, stepIdx])

  /* ─── Derived gates ────────────────────────────────────────────── */

  const passengerValid = useMemo(() => {
    if (!Array.isArray(passengers) || passengers.length === 0) return false
    if (!contactEmail || !/^\S+@\S+\.\S+$/.test(contactEmail)) return false
    return passengers.every((p) =>
      String(p.fullName || '').trim().length >= 2 &&
      Number.isFinite(Number(p.age)) && Number(p.age) > 0 &&
      ['M', 'F', 'O'].includes(p.gender),
    )
  }, [passengers, contactEmail])

  const canContinue = (() => {
    if (stepIdx === 0) return Boolean(selectedOffer)
    if (stepIdx === 1) return selectedSeats.length > 0
    if (stepIdx === 2) return passengerValid
    return false
  })()

  /* ─── Step transitions ─────────────────────────────────────────── */

  const goNext = () => {
    if (!canContinue) return
    setError('')
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))
  }
  const goBack = () => {
    setError('')
    setStepIdx((i) => Math.max(0, i - 1))
  }

  // When the user changes class, reset seat selection (the price + seats both shift).
  const onClassChange = (next) => {
    setClassCode(next)
    setSeats([])
    setSeatMap(null)
  }

  /* ─── Pay handler ──────────────────────────────────────────────── */

  const onPay = useCallback(async () => {
    if (paying) return
    setError('')
    setPaying(true)
    try {
      const payload = {
        type,
        offer: selectedOffer,
        classCode,
        passengerCount: passengers.length,
        passengers: passengers.map((p) => ({
          fullName: String(p.fullName || '').trim(),
          age: Number(p.age),
          gender: p.gender,
        })),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || null,
        travelDate,
        nights: type === 'hotel' ? 1 : undefined,
        seats: selectedSeats,
      }
      const draftRes = await createDraftBooking(payload)
      setDraft(draftRes)

      const checkoutResult = await openCheckout({
        payment: draftRes.payment,
        booking: draftRes.booking,
        prefill: {
          name: passengers[0]?.fullName,
          email: contactEmail,
          phone: contactPhone,
        },
      })

      const verified = await verifyPayment(draftRes.booking.id, {
        paymentId: checkoutResult.paymentId,
        signature: checkoutResult.signature,
        recipientEmail: contactEmail,
      })

      setConfirmed(verified)
      setStepIdx(STEPS.length - 1)
    } catch (err) {
      if (err?.cancelled) {
        setError('Payment cancelled — you can try again any time.')
      } else {
        setError(bookingErrorMessage(err))
      }
    } finally {
      setPaying(false)
    }
  }, [
    paying, type, selectedOffer, classCode, passengers, contactEmail,
    contactPhone, travelDate, selectedSeats,
  ])

  /* ─── Render ───────────────────────────────────────────────────── */

  return (
    <main className="relative min-h-[100dvh] pt-24 sm:pt-28 pb-16">
      <Backdrop />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={() => (stepIdx > 0 && stepIdx < STEPS.length - 1 ? goBack() : navigate(-1))}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" aria-hidden />
          {stepIdx > 0 && stepIdx < STEPS.length - 1 ? 'Back' : 'Back to JourneyMate'}
        </button>

        <header className="mb-6 sm:mb-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-3`}>
            <Sparkles size={11} aria-hidden /> Live inventory · {meta?.eyebrow}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
            Book a <span className={`bg-gradient-to-r ${meta?.accent} bg-clip-text text-transparent`}>{meta?.short.toLowerCase()}</span> in three taps
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
            Pick your {type === 'hotel' ? 'room' : 'seat'}, enter passenger details, pay — confirmation hits your inbox in seconds.
          </p>
        </header>

        <DemoBanner liveMode={paymentMode.live} />

        <div className="mb-6">
          <StepBar currentIndex={stepIdx} />
        </div>

        {/* Search criteria bar — visible on every step but inventory. */}
        <SearchSummary
          type={type} origin={origin} destination={destination}
          travelDate={travelDate} classCode={classCode} passengers={passengers}
        />

        {/* Step bodies ─────────────────────────────────────────────── */}
        <section className="mt-6">
          {stepIdx === 0 && (
            <Step1Inventory
              type={type} setType={setType}
              origin={origin} setOrigin={setOrigin}
              destination={destination} setDestination={setDest}
              travelDate={travelDate} setTravelDate={setDate}
              classCode={classCode} onClassChange={onClassChange}
              loading={loading} error={error}
              items={items}
              selectedOffer={selectedOffer} onSelect={setOffer}
            />
          )}

          {stepIdx === 1 && selectedOffer && (
            <Step2SeatMap
              type={type}
              meta={meta}
              seatMap={seatMap}
              loading={loading}
              selectedSeats={selectedSeats}
              onChange={setSeats}
              capacity={passengers.length || 1}
              basePrice={selectedOffer?.fares?.[classCode]?.price ?? selectedOffer?.rooms?.[classCode]?.pricePerNight}
              onClassChange={onClassChange}
              classCode={classCode}
            />
          )}

          {stepIdx === 2 && (
            <PassengerForm
              passengers={passengers}
              onChange={setPaxList}
              contactEmail={contactEmail}
              contactPhone={contactPhone}
              onContactChange={({ contactEmail: e, contactPhone: p }) => {
                if (e !== undefined) setEmail(e)
                if (p !== undefined) setPhone(p)
              }}
              capacity={Math.max(selectedSeats.length, 1)}
            />
          )}

          {stepIdx === 3 && quote && (
            <PaymentReview
              type={type}
              offer={selectedOffer}
              classCode={classCode}
              passengers={passengers}
              contactEmail={contactEmail}
              quote={quote}
              demoMode={!paymentMode.live || draft?.payment?.demo}
              processing={paying}
              error={error}
              onPay={onPay}
            />
          )}

          {stepIdx === STEPS.length - 1 && confirmed?.booking && (
            <Confirmation
              booking={confirmed.booking}
              providerMessage={confirmed.providerMessage}
            />
          )}
        </section>

        {/* Step error display (steps 1-3 surface their own; step 4 has dedicated panel) */}
        {error && stepIdx !== 3 && stepIdx !== STEPS.length - 1 && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        {/* Continue / back nav (hidden on confirmation step) */}
        {stepIdx < STEPS.length - 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-white/8">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIdx === 0}
              className="px-4 py-2.5 rounded-xl border border-white/12 bg-white/4 text-sm font-semibold text-slate-200 hover:bg-white/8 disabled:opacity-40 transition-colors"
            >
              Back
            </button>
            {stepIdx < 3 && (
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-700 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all"
              >
                Continue <ArrowRight size={14} aria-hidden />
              </button>
            )}
          </div>
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
      <div
        className="absolute -bottom-32 right-0 w-[36rem] h-[36rem] rounded-full opacity-35 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)' }}
      />
    </div>
  )
}

function DemoBanner({ liveMode }) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 mb-6 text-amber-100">
      <div className="flex items-start gap-2">
        <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden />
        <div className="text-xs leading-relaxed">
          <strong className="font-bold">{DEMO_BANNER_COPY.title}.</strong> {DEMO_BANNER_COPY.body}
          {liveMode && <div className="mt-1 opacity-90">{DEMO_BANNER_COPY.payment}</div>}
        </div>
      </div>
    </div>
  )
}

function SearchSummary({ type, origin, destination, travelDate, classCode, passengers }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      <span className="inline-flex items-center gap-1.5 text-slate-200">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mr-1">From</span>
        <strong>{origin || '—'}</strong>
      </span>
      <span className="text-slate-600">·</span>
      <span className="inline-flex items-center gap-1.5 text-slate-200">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mr-1">To</span>
        <strong>{destination || '—'}</strong>
      </span>
      <span className="text-slate-600">·</span>
      <span className="inline-flex items-center gap-1.5 text-slate-200">
        <Calendar size={12} aria-hidden />
        {travelDate || '—'}
      </span>
      <span className="text-slate-600">·</span>
      <span className="inline-flex items-center gap-1.5 text-slate-200">
        <Users size={12} aria-hidden />
        {passengers.length || 1} {passengers.length === 1 ? 'pax' : 'pax'}
      </span>
      <span className="text-slate-600">·</span>
      <span className="inline-flex items-center gap-1.5 text-slate-200">
        <strong>{classLabel(type, classCode)}</strong>
      </span>
    </div>
  )
}

function Step1Inventory({
  type, setType, origin, setOrigin, destination, setDestination,
  travelDate, setTravelDate, classCode, onClassChange,
  loading, error, items, selectedOffer, onSelect,
}) {
  const classOptions = type === 'flight' ? FLIGHT_CABINS
                     : type === 'hotel'  ? HOTEL_TIERS
                     : TRAIN_CLASSES

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
        <div className="flex flex-wrap gap-2 mb-3" role="tablist">
          {BOOKING_TYPES.map((t) => {
            const active = t === type
            const TIcon = TYPE_ICON[t]
            return (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); onClassChange(defaultClass(t)) }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                    : 'border-white/12 bg-white/4 text-slate-300 hover:bg-white/8'
                }`}
              >
                <TIcon size={12} aria-hidden /> {BOOKING_TYPE_META[t].short}
              </button>
            )
          })}
        </div>

        <div className="grid sm:grid-cols-[1fr_1fr_10rem_8rem] gap-2">
          <input
            type="text"
            value={origin}
            placeholder={type === 'hotel' ? 'City' : 'From'}
            onChange={(e) => setOrigin(e.target.value)}
            className="rounded-xl border border-white/12 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30"
          />
          <input
            type="text"
            value={destination}
            placeholder={type === 'hotel' ? 'Property name (optional)' : 'To'}
            onChange={(e) => setDestination(e.target.value)}
            className="rounded-xl border border-white/12 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30"
          />
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="rounded-xl border border-white/12 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30"
          />
          <select
            value={classCode}
            onChange={(e) => onClassChange(e.target.value)}
            className="rounded-xl border border-white/12 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30"
          >
            {classOptions.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
          Searching live inventory…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <InventoryList
          type={type}
          items={items}
          selectedOfferId={selectedOffer?.id}
          onSelect={onSelect}
          classCode={classCode}
        />
      )}
    </div>
  )
}

function Step2SeatMap({ type, meta, seatMap, loading, selectedSeats, onChange, capacity, basePrice, onClassChange, classCode }) {
  const classOptions = type === 'flight' ? FLIGHT_CABINS
                     : type === 'hotel'  ? HOTEL_TIERS
                     : TRAIN_CLASSES
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Step 2
          </div>
          <div className="text-base font-bold text-white">{meta?.pickerCopy}</div>
        </div>
        <select
          value={classCode}
          onChange={(e) => onClassChange(e.target.value)}
          className="rounded-xl border border-white/12 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30"
        >
          {classOptions.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
          Loading seat map…
        </div>
      )}

      {!loading && (
        <SeatPicker
          type={type}
          seatMap={seatMap}
          selectedSeats={selectedSeats}
          onChange={onChange}
          capacity={capacity}
          basePrice={basePrice}
        />
      )}

      <p className="text-[11px] text-slate-500">
        Tap a {meta?.seatLabel.toLowerCase()} to select it. You can pick up to {capacity}.
      </p>
    </div>
  )
}
