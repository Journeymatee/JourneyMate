import React from 'react'

/**
 * `SectionShell` enforces consistent vertical rhythm + accessible
 * landmark semantics on long-form pages. Sections are the heaviest
 * unit on most pages, so giving them a single, themable home means
 * we never have to remember `mb-20 sm:mb-24` margins again.
 *
 * Single Responsibility: it ONLY handles spacing + the
 * `aria-labelledby` wiring; visual content is fully owned by the
 * caller. That keeps the shell trivially reusable across pages.
 *
 * Density (Open/Closed via the `density` prop):
 *   - 'cozy'    → small mobile-friendly section gap
 *   - 'default' → most editorial sections
 *   - 'roomy'   → marquee sections (heroes, big features)
 */
const DENSITY = Object.freeze({
  cozy:    'mb-12 sm:mb-14 lg:mb-16',
  default: 'mb-16 sm:mb-20 lg:mb-24',
  roomy:   'mb-20 sm:mb-24 lg:mb-28 xl:mb-32',
})

export default function SectionShell({
  as: Tag = 'section',
  density = 'default',
  labelledBy,
  className = '',
  children,
  ...rest
}) {
  const spacing = DENSITY[density] || DENSITY.default
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={`${spacing} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  )
}
