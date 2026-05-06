import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'

/**
 * `FaqAccordion` renders a list of `{ id, q, a }` items as an
 * expand/collapse list. State is fully internal — the component is
 * a self-contained widget so any page can drop one in.
 *
 * Accessibility: each row uses `aria-expanded` + `aria-controls` and
 * the answer panel is focusable so screen readers can navigate it.
 */
export default function FaqAccordion({ items, accent = 'amber' }) {
  const [openId, setOpenId] = useState(null)
  const accentRing =
    accent === 'amber'
      ? 'border-amber-500/15 text-amber-500/60'
      : 'border-emerald-500/15 text-emerald-500/60'

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id
        const panelId = `faq-panel-${item.id}`
        return (
          <div
            key={item.id}
            className={`glass rounded-2xl border overflow-hidden ${accentRing}`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 text-white font-medium text-sm sm:text-base hover:bg-white/4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <span>{item.q}</span>
              <ArrowRight
                size={16}
                className={`shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-90' : ''
                } ${accentRing.split(' ')[1]}`}
                aria-hidden
              />
            </button>
            <div
              id={panelId}
              role="region"
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-40' : 'max-h-0'
              }`}
            >
              <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">
                {item.a}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
