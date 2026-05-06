import React, { useMemo } from 'react'
import { Train, Plane, BedDouble, Clock, Star, MapPin, ArrowRight } from 'lucide-react'

import { fmtInr, classLabel } from '../../data/bookingContent'

const TYPE_ICON = { train: Train, flight: Plane, hotel: BedDouble }

/**
 * Renders the list of inventory items returned by the provider for a
 * given route + travel-date pair. Selecting an item promotes it to the
 * `selectedOffer` slot and unlocks the "Continue" button.
 *
 * Train/flight items show a fares table (one row per class); hotel
 * items show a rooms table.
 */
export default function InventoryList({ type, items, selectedOfferId, onSelect, classCode }) {
  const Icon = TYPE_ICON[type] || Train
  const offers = useMemo(() => Array.isArray(items) ? items : [], [items])

  if (offers.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
        No inventory found for this route. Try changing the date or relax the search.
      </div>
    )
  }

  return (
    <ul className="grid gap-3" role="list">
      {offers.map((offer) => {
        const selected = offer.id === selectedOfferId
        const fareRow  = offer.fares?.[classCode]
        const roomRow  = offer.rooms?.[classCode]
        const headline = fareRow?.price ?? roomRow?.pricePerNight
        const seatsLeft = fareRow?.available ?? roomRow?.available

        return (
          <li key={offer.id}>
            <button
              type="button"
              onClick={() => onSelect(offer)}
              className={`w-full text-left rounded-2xl border p-4 sm:p-5 transition-all ${
                selected
                  ? 'border-emerald-400/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                  : 'border-white/10 bg-white/4 hover:border-white/25 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`shrink-0 grid place-items-center w-11 h-11 rounded-xl border ${
                    selected
                      ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                      : 'border-white/15 bg-white/5 text-slate-200'
                  }`}
                  aria-hidden
                >
                  <Icon size={18} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-base font-bold text-white truncate">
                    {offer.title}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                    {offer.departs && offer.arrives && (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} aria-hidden /> {offer.departs} → {offer.arrives}
                      </span>
                    )}
                    {Number.isFinite(offer.durationMins) && (
                      <span>{Math.floor(offer.durationMins / 60)}h {offer.durationMins % 60}m</span>
                    )}
                    {offer.runsOn && <span>{offer.runsOn}</span>}
                    {offer.stops != null && (
                      <span>{offer.stops === 0 ? 'Non-stop' : `${offer.stops} stop`}</span>
                    )}
                    {Number.isFinite(offer.rating) && (
                      <span className="inline-flex items-center gap-1 text-amber-300">
                        <Star size={11} aria-hidden /> {offer.rating}-star
                      </span>
                    )}
                    {offer.destination && type === 'hotel' && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} aria-hidden /> {offer.destination}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg sm:text-xl font-extrabold text-white">
                    {fmtInr(headline)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    {type === 'hotel' ? 'per night' : `${classLabel(type, classCode)}`}
                  </div>
                  {Number.isFinite(seatsLeft) && (
                    <div className="text-[10px] text-amber-300 mt-1">
                      {seatsLeft} {type === 'hotel' ? 'rooms' : 'seats'} left
                    </div>
                  )}
                </div>
              </div>

              {selected && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
                  Selected <ArrowRight size={12} aria-hidden />
                </div>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
