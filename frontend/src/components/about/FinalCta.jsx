import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plane } from 'lucide-react'

/**
 * `FinalCta` is the closing call-to-action block at the bottom of
 * the About page. Tiny, but extracted so the page composition stays
 * a clean list of named sections rather than inline anonymous JSX.
 */
export default function FinalCta({
  to = '/',
  label = 'Try JourneyMate',
  caption = 'Ready to plan your next trip?',
}) {
  return (
    <section className="text-center pt-10 border-t border-white/8">
      <p className="text-sm text-slate-400 mb-5">{caption}</p>
      <Link
        to={to}
        className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
      >
        <Plane size={15} aria-hidden />
        {label}
        <ArrowRight size={14} aria-hidden />
      </Link>
    </section>
  )
}
