import React from 'react'
import { Compass } from 'lucide-react'
import SectionHeader from '../SectionHeader'
import { useInView } from '../../hooks/aboutHooks'

/**
 * `PhilosophyGrid` lists the engineering principles in a 4-up grid
 * that gracefully collapses to 2-up on tablets and 1-up on phones.
 * Cards are simple text+icon, so they live as a private subcomponent.
 */
export default function PhilosophyGrid({ items, id = 'about-philosophy' }) {
  return (
    <>
      <SectionHeader
        id={id}
        icon={<Compass size={16} strokeWidth={2.4} />}
        accent="violet"
        eyebrow="My principles"
        title="How I think about building"
        subtitle="Four rules I keep coming back to whenever I sit down to ship something new."
        divider
        className="!mb-6"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {items.map((item, i) => (
          <PhilosophyCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </>
  )
}

function PhilosophyCard({ item, index }) {
  const [ref, inView] = useInView({ threshold: 0.25 })
  const Icon = item.Icon
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-md p-5 transition-all duration-700 hover:-translate-y-1 hover:border-emerald-400/30 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <span
        aria-hidden
        className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <div className="grid place-items-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-3">
        <Icon size={17} className="text-emerald-300" aria-hidden />
      </div>
      <h3 className="font-bold text-base text-white tracking-tight mb-1.5">
        {item.title}
      </h3>
      <p className="text-[13.5px] text-slate-400 leading-relaxed">
        {item.body}
      </p>
    </div>
  )
}
