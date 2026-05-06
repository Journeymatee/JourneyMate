import React from 'react'

/**
 * `Heading` is the typography primitive for product page titles and
 * section titles. It enforces the Tailwind responsive type ramp the
 * site has already adopted, so any future tweak (e.g. tightening the
 * hero clamp) only touches this file (Single Responsibility).
 *
 * Sizes (Open/Closed via the `size` prop):
 *   - 'sm'      – small section titles
 *   - 'md'      – medium section titles
 *   - 'lg'      – large section titles
 *   - 'xl'      – page titles (default)
 *   - 'display' – hero titles
 *
 * The `level` prop (1–6) controls the rendered tag for accessibility
 * independently of the visual size — that decoupling is what makes
 * the primitive Liskov-substitutable across heading hierarchies.
 *
 * `accent` lets you mark a slice of the title as a brand-gradient
 * shimmer without re-implementing the same span every time.
 */

const SIZES = Object.freeze({
  sm:      'text-lg sm:text-xl lg:text-2xl',
  md:      'text-xl sm:text-2xl lg:text-3xl',
  lg:      'text-2xl sm:text-3xl lg:text-4xl',
  xl:      'text-3xl xs:text-4xl sm:text-5xl lg:text-6xl',
  display: 'text-4xl xs:text-5xl sm:text-6xl lg:text-7xl xl:text-8xl',
})

export default function Heading({
  level = 2,
  size = 'xl',
  accent = null,
  accentText = '',
  children,
  className = '',
  ...rest
}) {
  const Tag = `h${Math.min(Math.max(level, 1), 6)}`
  const composed = [
    'font-display font-bold text-white leading-tight tracking-[-0.02em]',
    SIZES[size] || SIZES.xl,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (accent && accentText) {
    return (
      <Tag className={composed} {...rest}>
        {children}
        <span className={`shimmer-${accent}`}>{accentText}</span>
      </Tag>
    )
  }
  return (
    <Tag className={composed} {...rest}>
      {children}
    </Tag>
  )
}
