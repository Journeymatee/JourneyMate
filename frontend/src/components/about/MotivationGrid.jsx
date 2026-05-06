import React from 'react'
import { Heart, Lightbulb, Quote } from 'lucide-react'
import SectionHeader from '../SectionHeader'
import { useInView } from '../../hooks/aboutHooks'
import { DEFAULT_ACCENT, ACCENT_CLASSES } from '../../data/aboutContent'

/**
 * `MotivationGrid` renders the "Why I built JourneyMate" section:
 *   header → 2-up card grid → closing pull-quote.
 *
 * `MotivationCard` is intentionally private here because its visual
 * shape is tied to this section. If we later need it elsewhere, we
 * can promote it without breaking any consumer.
 */
export default function MotivationGrid({ items, id = 'about-why' }) {
  return (
    <>
      <SectionHeader
        id={id}
        icon={<Lightbulb size={16} strokeWidth={2.4} />}
        accent="amber"
        eyebrow="The motivation"
        title="Why I built JourneyMate"
        divider
        className="!mb-3"
      />
      <p className="text-sm sm:text-base text-slate-400 max-w-2xl mb-8 leading-relaxed">
        Four reasons this app exists — what nudged me from
        <span className="text-slate-200">{' '}&ldquo;someone should make this&rdquo;{' '}</span>
        to opening a fresh React project at 1 a.m.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        {items.map((item, i) => (
          <MotivationCard key={item.id} item={item} index={i} />
        ))}
      </div>

      <ClosingQuote />
    </>
  )
}

function MotivationCard({ item, index }) {
  const [ref, inView] = useInView({ threshold: 0.18 })
  const accent = ACCENT_CLASSES[item.accent] || DEFAULT_ACCENT
  const Icon = item.Icon

  return (
    <article
      ref={ref}
      className={`group relative rounded-3xl border border-white/10 bg-white/4 backdrop-blur-md p-5 sm:p-6 overflow-hidden transition-all duration-700 ease-out hover:-translate-y-1 hover:border-white/20 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 90}ms` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 24px 48px -16px ${item.glow}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle, ${item.glow}, transparent 70%)` }}
      />

      <div className="relative flex items-start gap-4">
        <span
          className={`shrink-0 grid place-items-center w-12 h-12 rounded-2xl border ${accent.iconBg} backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`}
        >
          <Icon size={20} className={accent.icon} aria-hidden />
        </span>

        <div className="min-w-0">
          <div className={`text-[10px] uppercase tracking-[0.14em] font-semibold ${accent.eyebrow} mb-1`}>
            {item.eyebrow}
          </div>
          <h3 className={`font-display font-bold text-lg sm:text-xl leading-snug mb-2.5 ${accent.title}`}>
            {item.title}
          </h3>
          <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
            {item.body}
          </p>
        </div>
      </div>
    </article>
  )
}

function ClosingQuote() {
  return (
    <figure className="relative mt-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-amber-500/4 to-rose-500/4 backdrop-blur-md p-6 sm:p-8 overflow-hidden">
      <Quote
        size={64}
        className="absolute -top-4 -left-2 text-emerald-500/15 pointer-events-none"
        aria-hidden
      />
      <blockquote className="relative">
        <p className="font-display italic text-lg sm:text-xl text-white leading-snug mb-3">
          Travel planning shouldn&apos;t feel like spreadsheet work.
        </p>
        <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
          JourneyMate is the tool I built for myself because I was tired of
          the alternatives — and I&apos;m sharing it because everyone
          I&apos;ve shown it to wants one too.
        </p>
        <figcaption className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">
          <Heart size={11} className="fill-emerald-400 text-emerald-400" aria-hidden />
          Harsh, the founder
        </figcaption>
      </blockquote>
    </figure>
  )
}
