import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * `BackLink` is the "← Back to …" pill that sits above any sub-page.
 * Promoted out of the about/ folder so every page gets a consistent
 * visual + interaction (focus ring, hover lift, theme-aware glass).
 */
export default function BackLink({
  to = '/',
  label = 'Back to JourneyMate',
  className = '',
}) {
  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center gap-2 px-3 py-1.5 -ml-3',
        'rounded-full text-sm text-slate-300 hover:text-white',
        'hover:bg-white/[0.06] border border-transparent hover:border-white/10',
        'backdrop-blur-sm transition-all mb-8 group',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
      {label}
    </Link>
  )
}
