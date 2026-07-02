import React from 'react'
import { Trash2, UserPlus, Phone, Mail } from 'lucide-react'

/**
 * Passenger / contact details form.
 *
 * Maintains an array of `{ fullName, age, gender }` plus a contact
 * email + phone. Add/remove buttons honour the `capacity` cap from the
 * seat picker so we never collect more passengers than seats.
 *
 * Validation lives at the parent (BookingFlow) so the "Continue" CTA
 * can stay disabled until everyone is filled in.
 */
export default function PassengerForm({
  passengers,
  contactEmail,
  contactPhone,
  capacity,
  onChange,
  onContactChange,
}) {
  const updatePassenger = (idx, patch) => {
    const next = passengers.map((p, i) => (i === idx ? { ...p, ...patch } : p))
    onChange(next)
  }

  const addPassenger = () => {
    if (passengers.length >= capacity) return
    onChange([...passengers, { fullName: '', age: '', gender: 'M' }])
  }

  const removePassenger = (idx) => {
    if (passengers.length === 1) return
    onChange(passengers.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-5">
      <ul className="grid gap-3" role="list">
        {passengers.map((p, idx) => (
          <li
            key={idx}
            className="rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Passenger {idx + 1}
              </span>
              {passengers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePassenger(idx)}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200"
                >
                  <Trash2 size={12} aria-hidden /> Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_5rem_5rem] gap-2">
              <Field
                label="Full name (as on ID)"
                placeholder="Riya Mehta"
                value={p.fullName}
                onChange={(v) => updatePassenger(idx, { fullName: v })}
              />
              <Field
                label="Age"
                type="number"
                min={0}
                max={120}
                placeholder="28"
                value={p.age}
                onChange={(v) => updatePassenger(idx, { age: v })}
              />
              <Field
                label="Gender"
                as="select"
                value={p.gender || 'M'}
                onChange={(v) => updatePassenger(idx, { gender: v })}
                options={[
                  { value: 'M', label: 'Male' },
                  { value: 'F', label: 'Female' },
                  { value: 'O', label: 'Other' },
                ]}
              />
            </div>
          </li>
        ))}
      </ul>

      {passengers.length < capacity && (
        <button
          type="button"
          onClick={addPassenger}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm font-semibold hover:bg-emerald-500/15 transition-colors"
        >
          <UserPlus size={14} aria-hidden /> Add another passenger
        </button>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
          Contact for confirmation
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={contactEmail}
            onChange={(v) => onContactChange({ contactEmail: v })}
            iconLeft={<Mail size={13} className="text-slate-500" aria-hidden />}
          />
          <Field
            label="Phone (optional)"
            type="tel"
            placeholder="+91 98765 43210"
            value={contactPhone}
            onChange={(v) => onContactChange({ contactPhone: v })}
            iconLeft={<Phone size={13} className="text-slate-500" aria-hidden />}
          />
        </div>
      </div>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', placeholder,
  as = 'input', options = [], iconLeft, min, max,
}) {
  const id = `f_${label.replace(/\s+/g, '-').toLowerCase()}_${Math.random().toString(36).slice(2, 7)}`
  return (
    <label htmlFor={id} className="block">
      <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
        {label}
      </span>
      <div className="relative">
        {iconLeft && <span className="absolute left-2.5 top-1/2 -translate-y-1/2">{iconLeft}</span>}
        {as === 'select' ? (
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-xl border border-white/12 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30 ${
              iconLeft ? 'pl-8' : ''
            }`}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            placeholder={placeholder}
            min={min}
            max={max}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-xl border border-white/12 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30 ${
              iconLeft ? 'pl-8' : ''
            }`}
          />
        )}
      </div>
    </label>
  )
}
