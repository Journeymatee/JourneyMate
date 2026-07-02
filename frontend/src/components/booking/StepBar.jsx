import React from 'react'
import { Check } from 'lucide-react'

import { STEPS } from '../../data/bookingContent'

/**
 * Horizontal step indicator for the booking wizard.
 *
 * `currentIndex` is the active step (0-based). Steps before the current
 * one show a check mark; the current step is highlighted; future steps
 * are dimmed. The component is purely presentational — clicking a step
 * does NOT navigate (the parent owns that logic, since some steps need
 * gating like "passenger form must be valid").
 */
export default function StepBar({ currentIndex }) {
  return (
    <ol className="flex items-center justify-between gap-2 max-w-3xl mx-auto" role="list">
      {STEPS.map((step, idx) => {
        const isPast = idx < currentIndex
        const isNow = idx === currentIndex
        return (
          <li key={step.id} className="flex-1 flex flex-col items-center text-center min-w-0">
            <span
              className={`grid place-items-center w-9 h-9 rounded-full border-2 transition-colors ${
                isPast
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                  : isNow
                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                    : 'border-white/15 bg-white/5 text-slate-500'
              }`}
              aria-current={isNow ? 'step' : undefined}
            >
              {isPast
                ? <Check size={16} strokeWidth={3} aria-hidden />
                : <span className="text-sm font-bold">{idx + 1}</span>}
            </span>
            <span
              className={`mt-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate w-full ${
                isPast || isNow ? 'text-white' : 'text-slate-500'
              }`}
            >
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <span
                aria-hidden
                className={`hidden sm:block absolute h-px w-8 ${isPast ? 'bg-emerald-400' : 'bg-white/15'}`}
                style={{ display: 'none' }} // tracked by parent grid; left here as marker
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
