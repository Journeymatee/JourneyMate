import React from 'react'
import { Sparkles } from 'lucide-react'

const DEFAULT_PROMPTS = [
  'Plan a 3-day budget Goa trip from Delhi',
  'Compare train vs flight Mumbai → Bengaluru',
  'Best month to visit Manali, and why?',
  'Weekend ideas near Pune for couples',
]

export default function QuickActions({ prompts = DEFAULT_PROMPTS, onPick, disabled, label = 'Try one of these' }) {
  if (!prompts?.length) return null
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        <Sparkles size={12} className="text-amber-300" />
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick?.(prompt)}
            disabled={disabled}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-200 transition-colors hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
