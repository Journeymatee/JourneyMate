import React from 'react'
import { Calendar } from 'lucide-react'
import SectionHeader from '../SectionHeader'
import { useInView } from '../../hooks/aboutHooks'

/**
 * `Timeline` renders the career story as a vertical guideline with
 * a list of `StoryItem`s.  StoryItem is private to this file because
 * its layout is meaningless outside of a Timeline (high cohesion).
 *
 * - SRP: it only orchestrates the timeline visuals.
 * - OCP: callers extend the timeline by adding entries to
 *   `STORY` in `aboutContent.js` — never by modifying this file.
 */
export default function Timeline({ items, id = 'about-journey' }) {
  return (
    <>
      <SectionHeader
        id={id}
        icon={<Calendar size={16} strokeWidth={2.4} />}
        accent="emerald"
        eyebrow="My timeline"
        title="The journey so far"
        subtitle="From the lecture halls of NIT Agartala to shipping JourneyMate from Hyderabad."
        divider
        className="!mb-8"
      />

      <ol className="relative">
        <span
          aria-hidden
          className="absolute left-[1.4rem] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/40 via-amber-500/30 to-transparent"
        />
        {items.map((item) => (
          <StoryItem key={item.id} item={item} />
        ))}
      </ol>
    </>
  )
}

function StoryItem({ item }) {
  const [ref, inView] = useInView({ threshold: 0.25 })
  const Icon = item.Icon
  return (
    <li
      ref={ref}
      className={`relative pl-14 pb-8 last:pb-0 transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <span
        className={`absolute left-0 top-0 grid place-items-center w-11 h-11 rounded-2xl border ${item.border} ${item.bg} backdrop-blur-md`}
      >
        <Icon size={17} className={item.color} aria-hidden />
      </span>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
        {item.year}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
        {item.title}
      </h3>
      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
        {item.body}
      </p>
    </li>
  )
}
