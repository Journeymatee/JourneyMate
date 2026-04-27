import React, { useEffect, useState } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'
import ChatPanel from './ChatPanel'

const DESKTOP_QUERY = '(min-width: 640px)'

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia(DESKTOP_QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mql = window.matchMedia(DESKTOP_QUERY)
    const handler = (event) => setIsDesktop(event.matches)
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') {
        if (expanded) setExpanded(false)
        else setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, expanded])

  // Lock body scroll while panel is open on mobile to avoid the underlying page scrolling.
  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    if (open && !isDesktop) {
      const previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previous
      }
    }
    return undefined
  }, [open, isDesktop])

  const closePanel = () => {
    setOpen(false)
    setExpanded(false)
  }

  const openPanel = () => setOpen(true)

  // Sizing: mobile = bottom sheet, desktop = docked panel, expanded = wide centered overlay.
  const containerClass = !isDesktop
    ? 'fixed inset-x-0 bottom-0 z-[80] h-[88vh] max-h-[88dvh] rounded-t-3xl border border-white/10 border-b-0 overflow-hidden animate-[slideUp_0.25s_ease-out]'
    : expanded
      ? 'fixed inset-4 z-[80] mx-auto my-auto h-[min(720px,90vh)] w-[min(960px,92vw)] rounded-3xl border border-white/10 overflow-hidden animate-[fadeIn_0.2s_ease-out]'
      : 'fixed bottom-24 right-4 sm:right-6 z-[80] h-[min(640px,80vh)] w-[min(420px,calc(100vw-2rem))] rounded-3xl border border-white/10 overflow-hidden animate-[fadeIn_0.2s_ease-out]'

  return (
    <>
      {open && !isDesktop && (
        <button
          type="button"
          aria-label="Close chat overlay"
          onClick={closePanel}
          className="fixed inset-0 z-[79] bg-slate-950/60 backdrop-blur-sm"
        />
      )}
      {open && isDesktop && expanded && (
        <button
          type="button"
          aria-label="Close chat overlay"
          onClick={closePanel}
          className="fixed inset-0 z-[79] bg-slate-950/40 backdrop-blur-sm"
        />
      )}

      {open && (
        <div className={containerClass} role="dialog" aria-modal="true" aria-label="JourneyMate AI chat">
          {!isDesktop && (
            <div className="flex justify-center pt-1.5" aria-hidden="true">
              <span className="h-1 w-10 rounded-full bg-white/20" />
            </div>
          )}
          <div className={`${!isDesktop ? 'h-[calc(100%-0.5rem)]' : 'h-full'} min-h-0`}>
            <ChatPanel
              onClose={closePanel}
              expanded={expanded}
              onToggleExpand={() => setExpanded((prev) => !prev)}
              canExpand={isDesktop}
            />
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={openPanel}
          aria-label="Open JourneyMate AI assistant"
          className="group fixed bottom-5 right-4 z-[78] inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-950/95 px-4 py-3 text-emerald-200 shadow-xl shadow-black/50 transition-transform hover:-translate-y-0.5 hover:bg-slate-900 sm:bottom-6 sm:right-6"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
            <MessageCircle size={16} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </span>
          <span className="text-sm font-semibold text-white">Chat with AI</span>
          <Sparkles size={14} className="text-amber-300 transition-transform group-hover:rotate-12" />
        </button>
      )}
    </>
  )
}
