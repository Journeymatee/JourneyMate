import React from 'react'
import { useCountUp } from '../../hooks/aboutHooks'

/**
 * `StatBlock` renders a single big-number + label cell. It depends
 * solely on the `useCountUp` hook for animation, so it can be
 * dropped into any layout — strips, cards, kpi grids — without
 * changing the math (Open/Closed). The `start` prop lets the
 * parent gate the animation (e.g. wait until the parent scrolls
 * into view) which is Dependency Inversion in practice.
 */
export default function StatBlock({
  value,
  label,
  suffix = '',
  start = true,
  decimals = 0,
}) {
  const animated = useCountUp({ target: value, start, duration: 1600, decimals })
  const display =
    decimals > 0 ? animated.toFixed(decimals) : Math.round(animated).toLocaleString()

  return (
    <div className="text-center">
      <div
        className="text-[1.35rem] 2xs:text-2xl sm:text-3xl lg:text-[2.1rem] font-display font-extrabold tracking-tight bg-gradient-to-br from-emerald-300 via-amber-200 to-rose-300 bg-clip-text text-transparent leading-none"
        style={{ filter: 'drop-shadow(0 6px 18px rgba(34,197,94,0.18))' }}
      >
        {display}
        {suffix}
      </div>
      <div className="mt-1.5 text-[9px] 2xs:text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-slate-300/80 font-semibold">
        {label}
      </div>
    </div>
  )
}
