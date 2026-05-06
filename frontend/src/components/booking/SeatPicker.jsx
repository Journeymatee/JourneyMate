import React, { useMemo } from 'react'

import { fmtInr, classLabel } from '../../data/bookingContent'

/**
 * Polymorphic seat / room picker.
 *
 * Trains  → coaches[].seats[]  (we render each coach as its own block)
 * Flights → rows[].seats[]     (we render a fuselage grid with an aisle)
 * Hotels  → rooms[]            (we render a numbered floor grid)
 *
 * Seat objects all share the same `{ id, available, label?, number? }`
 * shape so the rendering layer can treat them uniformly. The parent
 * passes `selectedSeats` (an array of seat ids) and gets the list back
 * via `onChange`.
 */
export default function SeatPicker({ type, seatMap, selectedSeats, onChange, capacity = 1, basePrice }) {
  const safeSelected = useMemo(() => Array.isArray(selectedSeats) ? selectedSeats : [], [selectedSeats])

  const toggle = (seatId, isAvailable) => {
    if (!isAvailable) return
    if (safeSelected.includes(seatId)) {
      onChange(safeSelected.filter((id) => id !== seatId))
      return
    }
    if (safeSelected.length >= capacity) {
      // Replace the first seat — capacity is the cap.
      onChange([...safeSelected.slice(1), seatId])
      return
    }
    onChange([...safeSelected, seatId])
  }

  if (!seatMap) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
        Loading seat map…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
        <span><span className="inline-block w-3 h-3 rounded bg-emerald-500/70 border border-emerald-400/60 align-middle mr-1.5" aria-hidden />Available</span>
        <span><span className="inline-block w-3 h-3 rounded bg-amber-500/70 border border-amber-400/70 align-middle mr-1.5" aria-hidden />Selected</span>
        <span><span className="inline-block w-3 h-3 rounded bg-slate-700/70 border border-slate-600/60 align-middle mr-1.5" aria-hidden />Booked</span>
        {Number.isFinite(basePrice) && (
          <span className="ml-auto text-slate-300">
            {fmtInr(basePrice)} · {classLabel(type, seatMap.classCode)}
          </span>
        )}
      </div>

      {type === 'train' && Array.isArray(seatMap.coaches) && (
        <div className="space-y-5">
          {seatMap.coaches.map((coach) => (
            <CoachBlock
              key={coach.name}
              coach={coach}
              selected={safeSelected}
              onToggle={toggle}
            />
          ))}
        </div>
      )}

      {type === 'flight' && Array.isArray(seatMap.rows) && (
        <FlightGrid rows={seatMap.rows} selected={safeSelected} onToggle={toggle} />
      )}

      {type === 'hotel' && Array.isArray(seatMap.rooms) && (
        <RoomGrid rooms={seatMap.rooms} selected={safeSelected} onToggle={toggle} />
      )}
    </div>
  )
}

/* ─── Train coach ────────────────────────────────────────────────── */
function CoachBlock({ coach, selected, onToggle }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Coach {coach.name}
        </h4>
        <span className="text-[10px] text-slate-500">
          {coach.seats.filter((s) => s.available).length} available
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {coach.seats.map((seat) => {
          const sel = selected.includes(seat.id)
          const cls = sel
            ? 'bg-amber-500/80 border-amber-400 text-slate-950'
            : seat.available
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/30'
              : 'bg-slate-700/40 border-slate-600/60 text-slate-500 cursor-not-allowed'
          return (
            <button
              key={seat.id}
              type="button"
              disabled={!seat.available}
              onClick={() => onToggle(seat.id, seat.available)}
              className={`px-1 py-2 rounded-lg border text-[10px] font-bold transition-colors ${cls}`}
              aria-pressed={sel}
              aria-label={`Berth ${seat.number} ${seat.berth || ''} ${seat.available ? '' : '(booked)'}`}
            >
              <div>{seat.number}</div>
              {seat.berth && <div className="opacity-70">{seat.berth}</div>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ─── Flight cabin ───────────────────────────────────────────────── */
function FlightGrid({ rows, selected, onToggle }) {
  if (rows.length === 0) return null
  const cols = rows[0]?.seats?.length || 6
  const aislePos = cols >= 6 ? 3 : Math.floor(cols / 2)

  return (
    <section className="rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-5">
      <div className="text-center text-[10px] uppercase tracking-wider text-slate-500 mb-3">
        Front of cabin
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        {rows.map((row) => (
          <div
            key={row.row}
            className="grid items-center gap-1.5 sm:gap-2"
            style={{
              gridTemplateColumns: `1.4rem repeat(${aislePos}, 1fr) 0.5rem repeat(${cols - aislePos}, 1fr)`,
            }}
          >
            <span className="text-[10px] text-slate-500 text-right pr-1">{row.row}</span>
            {row.seats.map((seat, idx) => {
              const sel = selected.includes(seat.id)
              const cls = sel
                ? 'bg-amber-500/80 border-amber-400 text-slate-950'
                : seat.available
                  ? `${seat.kind === 'window' ? 'bg-sky-500/20 border-sky-400/45 text-sky-100'
                      : seat.kind === 'aisle' ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100'
                      : 'bg-violet-500/15 border-violet-400/35 text-violet-100'} hover:brightness-125`
                  : 'bg-slate-700/40 border-slate-600/60 text-slate-500 cursor-not-allowed'
              const aisleSpacer = idx === aislePos
              return (
                <React.Fragment key={seat.id}>
                  {aisleSpacer && <span aria-hidden />}
                  <button
                    type="button"
                    disabled={!seat.available}
                    onClick={() => onToggle(seat.id, seat.available)}
                    className={`px-1 py-1.5 rounded-md border text-[10px] font-bold transition-colors ${cls}`}
                    aria-pressed={sel}
                    aria-label={`Seat ${seat.label} ${seat.kind} ${seat.available ? '' : '(booked)'}`}
                  >
                    {seat.label.replace(/^\d+/, '')}
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Hotel rooms ────────────────────────────────────────────────── */
function RoomGrid({ rooms, selected, onToggle }) {
  // Group rooms by floor for readability.
  const byFloor = useMemo(() => {
    const acc = new Map()
    rooms.forEach((r) => {
      const list = acc.get(r.floor) || []
      list.push(r)
      acc.set(r.floor, list)
    })
    return Array.from(acc.entries()).sort(([a], [b]) => a - b)
  }, [rooms])

  return (
    <div className="space-y-3">
      {byFloor.map(([floor, list]) => (
        <section key={floor} className="rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Floor {floor}
            </h4>
            <span className="text-[10px] text-slate-500">
              {list.filter((r) => r.available).length} available
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
            {list.map((room) => {
              const sel = selected.includes(room.id)
              const cls = sel
                ? 'bg-amber-500/80 border-amber-400 text-slate-950'
                : room.available
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/30'
                  : 'bg-slate-700/40 border-slate-600/60 text-slate-500 cursor-not-allowed'
              return (
                <button
                  key={room.id}
                  type="button"
                  disabled={!room.available}
                  onClick={() => onToggle(room.id, room.available)}
                  className={`px-1 py-2 rounded-lg border text-[11px] font-bold transition-colors ${cls}`}
                  aria-pressed={sel}
                >
                  {room.number}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
