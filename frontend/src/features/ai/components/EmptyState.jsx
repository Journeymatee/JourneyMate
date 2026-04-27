import React from 'react'
import { Compass, Plane, Wallet, CalendarRange } from 'lucide-react'
import QuickActions from './QuickActions'

const FEATURES = [
  { icon: Compass, label: 'Smart itineraries' },
  { icon: Plane, label: 'Route comparisons' },
  { icon: Wallet, label: 'Budget planning' },
  { icon: CalendarRange, label: 'Best season tips' },
]

export default function EmptyState({ onPick, disabled }) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/5 via-slate-900/0 to-amber-500/5 p-3 sm:p-4">
      <div>
        <p className="text-sm font-semibold text-white sm:text-base">Welcome back, traveler</p>
        <p className="mt-1 text-xs text-slate-300 sm:text-sm">
          I plan trips, weigh trade-offs, and surface live data — ready when you are.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FEATURES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] text-slate-200 sm:text-xs"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
              <Icon size={13} />
            </span>
            <span className="truncate">{label}</span>
          </div>
        ))}
      </div>

      <QuickActions onPick={onPick} disabled={disabled} label="Try a starter" />
    </div>
  )
}
