import React, { forwardRef } from 'react'

/**
 * `Card` is the universal surface primitive — every panel, tile, and
 * grid cell on the site should compose this instead of redefining
 * the same `rounded-Xxl border border-white/10 bg-white/4 …` chain.
 *
 * SOLID notes
 *  - SRP: this owns surface styling only; layout/content is up to the
 *    caller.
 *  - OCP: variants and paddings are dictionary-driven, so adding a
 *    new look is a one-line change.
 *  - LSP: every variant accepts the same props and is interchangeable.
 *
 * Variants
 *   - 'glass'   default — frosted glass on dark, white on light
 *   - 'flat'    flat translucent surface, no border
 *   - 'tinted'  small brand-tinted gradient surface for callouts
 *
 * Padding sizes follow the same scale as the other primitives.
 */

const VARIANTS = Object.freeze({
  glass:
    'rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md',
  flat:
    'rounded-3xl bg-white/[0.04] backdrop-blur-md',
  tinted:
    'rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-amber-500/4 to-rose-500/4 backdrop-blur-md',
  raised:
    'rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(2,6,23,0.6)]',
})

const PADDINGS = Object.freeze({
  none: '',
  sm:   'p-4 sm:p-5',
  md:   'p-5 sm:p-6 lg:p-7',
  lg:   'p-6 sm:p-8 lg:p-10',
})

const Card = forwardRef(function Card(
  {
    as: Tag = 'div',
    variant = 'glass',
    padding = 'md',
    interactive = false,
    className = '',
    children,
    ...rest
  },
  ref,
) {
  const composed = [
    VARIANTS[variant] || VARIANTS.glass,
    PADDINGS[padding] || PADDINGS.md,
    interactive
      ? 'transition-all hover:-translate-y-0.5 hover:border-white/20'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag ref={ref} className={composed} {...rest}>
      {children}
    </Tag>
  )
})

export default Card
