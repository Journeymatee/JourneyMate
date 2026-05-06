import React from 'react'
import { ArrowRight, MapPin, Phone, Send } from 'lucide-react'
import SectionHeader from '../SectionHeader'

/**
 * `ConnectGrid` renders the "Get in touch" section: a 2-up grid of
 * social cards plus the small India / phone footer chips.
 *
 * SocialCard is private to this file; it only makes sense inside
 * the Connect grid.
 */
export default function ConnectGrid({ socials, location, phone, id = 'about-connect' }) {
  return (
    <>
      <SectionHeader
        id={id}
        icon={<Send size={16} strokeWidth={2.4} />}
        accent="rose"
        eyebrow="Get in touch"
        title="Let's chat"
        subtitle="Pick the channel that suits you — I read every DM, comment, and email."
        divider
        className="!mb-8"
      />

      <div className="grid sm:grid-cols-2 gap-3">
        {socials.map((s) => (
          <SocialCard key={s.id} social={s} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        {[
          { id: 'loc', Icon: MapPin, label: location },
          { id: 'phone', Icon: Phone, label: phone },
        ]
          .filter((c) => c.label)
          .map(({ id: chipId, Icon, label }) => (
            <span
              key={chipId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300"
            >
              <Icon size={11} className="text-slate-500" aria-hidden />
              {label}
            </span>
          ))}
      </div>
    </>
  )
}

function SocialCard({ social: s }) {
  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex items-center gap-3 p-3.5 rounded-2xl border ${s.border} bg-gradient-to-br ${s.surface} ${s.text} transition-all duration-300 hover:-translate-y-0.5 overflow-hidden`}
      style={{ '--glow': s.glow }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 16px 32px -12px ${s.glow}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/8 border border-white/10 shrink-0">
        <s.Icon size={17} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold leading-tight">{s.label}</div>
        <div className="text-[11px] opacity-80 truncate">{s.handle}</div>
      </div>
      <ArrowRight
        size={14}
        className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
      />
    </a>
  )
}
