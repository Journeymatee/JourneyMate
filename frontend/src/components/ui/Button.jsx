import React, { forwardRef } from 'react'
import { Link } from 'react-router-dom'

/**
 * `Button` is the single source of truth for clickable actions in the
 * product. It is polymorphic — render as a `<button>`, an `<a>`, or
 * a react-router `<Link>` depending on the props it receives:
 *
 *   <Button onClick={...}>      → <button>
 *   <Button href="https://...">  → <a target="_blank">
 *   <Button to="/pricing">      → <Link to="/pricing">
 *
 * SOLID notes
 *  - SRP: this file only knows how to render an action surface.
 *  - OCP: extending the visual style means adding a key to
 *    `VARIANTS` / `SIZES` / `ACCENTS`; no consumer call site changes.
 *  - LSP: every `<Button>` instance is interchangeable regardless of
 *    which variant or size the call site picks.
 *  - ISP: the props surface is small and orthogonal — variant, size,
 *    accent, iconLeft, iconRight, plus the polymorphic target.
 */

const VARIANTS = Object.freeze({
  primary:
    'text-slate-950 font-bold shadow-lg hover:-translate-y-0.5',
  secondary:
    'text-white font-semibold border border-white/15 bg-white/[0.06] backdrop-blur-md hover:bg-white/[0.10] hover:border-white/25',
  subtle:
    'text-slate-300 border border-white/10 bg-white/[0.04] backdrop-blur-md hover:text-white hover:border-white/25 hover:bg-white/[0.08]',
  ghost:
    'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 backdrop-blur-sm',
})

const SIZES = Object.freeze({
  sm: 'text-xs px-3 py-2 rounded-xl gap-1.5',
  md: 'text-sm px-4 sm:px-5 py-2.5 rounded-2xl gap-2',
  lg: 'text-sm sm:text-base px-6 sm:px-7 py-3.5 rounded-2xl gap-2',
})

/**
 * Per-accent overrides that compose with `primary`. Other variants
 * pick the accent purely through icon colour, so the surface stays
 * neutral and theme-friendly.
 */
const PRIMARY_ACCENTS = Object.freeze({
  emerald: {
    background: 'linear-gradient(135deg, #34d399 0%, #fbbf24 100%)',
    boxShadow:
      '0 12px 28px -10px rgba(34,197,94,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    hoverOverlay: 'linear-gradient(135deg, #6ee7b7, #fcd34d)',
  },
  amber: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    boxShadow:
      '0 12px 28px -10px rgba(245,158,11,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    hoverOverlay: 'linear-gradient(135deg, #fbbf24, #fb7185)',
  },
  rose: {
    background: 'linear-gradient(135deg, #fb7185 0%, #a855f7 100%)',
    boxShadow:
      '0 12px 28px -10px rgba(244,63,94,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    hoverOverlay: 'linear-gradient(135deg, #fda4af, #c084fc)',
  },
  blue: {
    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
    boxShadow:
      '0 12px 28px -10px rgba(56,189,248,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
    hoverOverlay: 'linear-gradient(135deg, #7dd3fc, #818cf8)',
  },
})

const Button = forwardRef(function Button(
  {
    children,
    variant = 'secondary',
    size = 'md',
    accent = 'emerald',
    iconLeft = null,
    iconRight = null,
    to,
    href,
    onClick,
    type = 'button',
    className = '',
    fullWidth = false,
    target,
    rel,
    ...rest
  },
  ref,
) {
  const accentTheme = PRIMARY_ACCENTS[accent] || PRIMARY_ACCENTS.emerald
  const isPrimary = variant === 'primary'

  const baseClass =
    'group relative inline-flex items-center justify-center transition-all overflow-hidden whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'

  const composed = [
    baseClass,
    SIZES[size] || SIZES.md,
    VARIANTS[variant] || VARIANTS.secondary,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inlineStyle = isPrimary
    ? { background: accentTheme.background, boxShadow: accentTheme.boxShadow }
    : undefined

  const content = (
    <>
      {isPrimary && (
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: accentTheme.hoverOverlay }}
        />
      )}
      {iconLeft != null && (
        <span className="relative shrink-0" aria-hidden>
          {iconLeft}
        </span>
      )}
      <span className="relative">{children}</span>
      {iconRight != null && (
        <span
          className="relative shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        >
          {iconRight}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={composed} style={inlineStyle} {...rest}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        target={target ?? (href.startsWith('http') ? '_blank' : undefined)}
        rel={
          rel ??
          (href.startsWith('http') ? 'noopener noreferrer' : undefined)
        }
        className={composed}
        style={inlineStyle}
        {...rest}
      >
        {content}
      </a>
    )
  }
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      className={composed}
      style={inlineStyle}
      {...rest}
    >
      {content}
    </button>
  )
})

export default Button
