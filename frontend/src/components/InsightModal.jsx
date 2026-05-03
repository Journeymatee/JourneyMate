import React, { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

/**
 * Generic centered-modal used by the TripInsightsBar tiles. Keeps the
 * comparison page chrome compact — the heavy panels only render when the user
 * actually wants to look at them.
 *
 * Behaviour:
 *   • Click backdrop → close.
 *   • Press Escape → close.
 *   • Body scroll is locked while open so the viewport doesn't bounce around.
 */
export default function InsightModal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  accent = 'cyan',
  children,
}) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.()
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return undefined
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, handleKey])

  if (!open) return null

  const accentClass =
    accent === 'amber'
      ? 'text-amber-300 bg-amber-500/12 border-amber-400/30'
      : accent === 'fuchsia'
      ? 'text-fuchsia-300 bg-fuchsia-500/12 border-fuchsia-400/30'
      : accent === 'emerald'
      ? 'text-emerald-300 bg-emerald-500/12 border-emerald-400/30'
      : accent === 'violet'
      ? 'text-violet-300 bg-violet-500/12 border-violet-400/30'
      : 'text-cyan-300 bg-cyan-500/12 border-cyan-400/30'

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        role="presentation"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed z-[90] left-1/2 top-1/2 w-[min(100vw-1.5rem,38rem)] max-h-[88vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/12 bg-slate-950/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-white/8 px-5 py-4">
          {Icon && (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accentClass}`}>
              <Icon size={18} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-white tracking-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-400 truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-white/8 hover:text-white transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrolls if content is long */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </div>
      </div>
    </>
  )
}
