import React from 'react'

/**
 * `Stack` is a flex-column primitive — vertical layout with a
 * consistent gap. Use this whenever you find yourself writing
 * `flex flex-col gap-N` over and over.
 *
 * `Row` is its horizontal sibling, with sensible defaults for
 * `align` and `wrap` so most call sites stay terse.
 */

const GAPS = Object.freeze({
  none: 'gap-0',
  xs:   'gap-1',
  sm:   'gap-2',
  md:   'gap-3 sm:gap-4',
  lg:   'gap-4 sm:gap-6',
  xl:   'gap-6 sm:gap-8',
})

const ALIGNS = Object.freeze({
  start:    'items-start',
  center:   'items-center',
  end:      'items-end',
  stretch:  'items-stretch',
  baseline: 'items-baseline',
})

const JUSTIFIES = Object.freeze({
  start:   'justify-start',
  center:  'justify-center',
  end:     'justify-end',
  between: 'justify-between',
  around:  'justify-around',
})

export function Stack({
  as: Tag = 'div',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={[
        'flex flex-col',
        GAPS[gap] || GAPS.md,
        ALIGNS[align] || ALIGNS.stretch,
        JUSTIFIES[justify] || JUSTIFIES.start,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function Row({
  as: Tag = 'div',
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = true,
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={[
        'flex',
        wrap ? 'flex-wrap' : 'flex-nowrap',
        GAPS[gap] || GAPS.md,
        ALIGNS[align] || ALIGNS.center,
        JUSTIFIES[justify] || JUSTIFIES.start,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Stack
