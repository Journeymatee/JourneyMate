import React from 'react'

/**
 * `PageContainer` centralises the responsive padding + max-width that
 * every full-width product page should share. Pages compose the same
 * container instead of each duplicating the breakpoint scale, so
 * tightening the gutter or expanding the content area only touches
 * one file (Single Responsibility / Don't Repeat Yourself).
 *
 * Sizes (Open/Closed via the `size` prop):
 *   - 'narrow'  → reading surfaces (Privacy, Terms, etc.)
 *   - 'default' → product pages (the About page uses this)
 *   - 'wide'    → dashboards / data-heavy screens
 */
const SIZES = Object.freeze({
  narrow:  'max-w-3xl',
  default: 'max-w-6xl xl:max-w-[78rem] 2xl:max-w-[84rem]',
  wide:    'max-w-7xl xl:max-w-[88rem] 2xl:max-w-[96rem]',
})

export default function PageContainer({
  as: Tag = 'div',
  size = 'default',
  className = '',
  children,
  ...rest
}) {
  const widthClass = SIZES[size] || SIZES.default
  return (
    <Tag
      className={`relative mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 ${widthClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  )
}
