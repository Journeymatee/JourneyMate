import React from 'react'
import { useInView } from '../../hooks/aboutHooks'
import StatBlock from './StatBlock'

/**
 * `StatStrip` is a thin glassmorphic strip that lays out an array of
 * `StatBlock`s. It is responsible for:
 *   - the surrounding container (border, blur, brand wash)
 *   - the responsive grid (3 cells on phones, same on desktop)
 *   - the in-view trigger that starts every block's count-up at once
 *
 * Why pass an array of stat descriptors instead of children?
 *   It enforces a uniform shape (Liskov Substitution) and makes it
 *   trivial to render any future combination from `aboutContent.js`.
 */
export default function StatStrip({ stats }) {
  const [strip, inView] = useInView({ threshold: 0.4 })

  return (
    <div
      ref={strip}
      className="relative grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-md max-w-md mx-auto lg:mx-0 mb-7 sm:mb-8"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(99,102,241,0.04) 50%, rgba(244,63,94,0.06))',
        }}
      />
      {stats.map((stat) => (
        <div key={stat.id} className="relative px-2 2xs:px-2.5 sm:px-3 py-3 sm:py-3.5 bg-slate-950/30">
          <StatBlock
            value={stat.value}
            label={stat.label}
            suffix={stat.suffix || ''}
            decimals={stat.decimals || 0}
            start={inView}
          />
        </div>
      ))}
    </div>
  )
}
