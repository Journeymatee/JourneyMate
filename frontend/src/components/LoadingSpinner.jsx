import React, { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'

/**
 * LoadingSpinner — context-aware progress for /trips/search.
 *
 * Free-tier API hosts (Render etc.) cold-boot for ~30–55 s after idle, so the
 * loader transitions through staged messages tied to elapsed time, instead of
 * looking frozen. After ~10 s a one-tap "Cancel" appears so the user is never
 * trapped on this screen.
 *
 * Props:
 *   from, to – route labels
 *   onCancel – optional () => void; when provided, a Cancel button appears
 *              after STAGES[1].at ms.
 */

const STAGES = [
  { at:  0,     title: 'Finding Best Plans',     sub: 'Comparing Silver & Gold options…' },
  { at:  3000,  title: 'Crunching the numbers',  sub: 'Pricing transport, stays & food…'  },
  { at: 10000,  title: 'Server is warming up',   sub: 'First request after idle takes a moment.' },
  { at: 25000,  title: 'Still working',          sub: 'Free-tier dynos can take 30–60 s to wake up.' },
  { at: 50000,  title: 'Almost there',           sub: 'We\'re retrying automatically — please don\'t refresh.' },
  { at: 90000,  title: 'This is unusually slow', sub: 'Tap Cancel and try again — your data is safe.' },
]

function pickStage(elapsed) {
  let active = STAGES[0]
  for (const s of STAGES) if (elapsed >= s.at) active = s
  return active
}

export default function LoadingSpinner({ from, to, onCancel }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setElapsed(Date.now() - start), 500)
    return () => clearInterval(id)
  }, [])

  const stage = pickStage(elapsed)
  const seconds = Math.floor(elapsed / 1000)
  const showCancel = elapsed >= 10000 && typeof onCancel === 'function'
  const progressPct = Math.min(95, 8 + (elapsed / 600))

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Animated logo */}
        <div className="relative mb-8 flex items-center justify-center">
          <div
            className="absolute w-28 h-28 rounded-full border border-green-500/20 animate-ping"
            style={{ animationDuration: '2s' }}
          />
          <div
            className="absolute w-20 h-20 rounded-full border border-amber-500/15 animate-ping"
            style={{ animationDuration: '2s', animationDelay: '0.5s' }}
          />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/15 to-amber-500/15 border border-white/10 flex items-center justify-center">
            <img src="/logo.svg" alt="JourneyMate" className="w-12 h-12 rounded-2xl animate-pulse" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/60" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.66s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '1.33s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white/50" />
          </div>
        </div>

        <h2 className="font-display font-bold text-2xl text-white mb-2 transition-all duration-300">
          {stage.title}
        </h2>

        {(from || to) && (
          <p className="text-slate-400 mb-2">
            {from} <span className="text-slate-600">→</span> {to}
          </p>
        )}

        <p className="text-slate-500 text-sm transition-all duration-300 min-h-[1.25rem]">
          {stage.sub}
        </p>

        {/* Elapsed counter — appears after 5 s so quick searches don't see it */}
        {seconds >= 5 && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Loader2 size={11} className="animate-spin" />
            <span>{seconds}s elapsed</span>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-6 w-64 mx-auto h-1 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-amber-500 rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%`, backgroundSize: '200% auto' }}
          />
        </div>

        {/* Cancel — appears after 10 s */}
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all duration-200"
          >
            <X size={14} />
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
