import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, MapPin, Maximize2 } from 'lucide-react'
import { onPhotoError } from '../utils/getStatePhoto'

/**
 * PhotoLightbox — click any thumbnail rendered by the wrapping component to
 * pop the full-size image in a centered, scroll-locked, escape-dismissable
 * dialog.
 *
 * Used wherever we render cropped state-iconic photos so users can still see
 * the full landscape (Comparison hero band, PopularRoutes cards, etc.).
 *
 * Usage:
 *   <PhotoLightbox
 *     src="/destinations/state-sikkim.png"
 *     alt="Yumthang Valley — Sikkim"
 *     caption="Yumthang Valley"
 *     subcaption="Sikkim · alpine"
 *     className="w-full h-32 sm:h-44 lg:h-56 object-cover"
 *   />
 *
 * The wrapper uses a button so it's keyboard-focusable and announces itself
 * to assistive tech as "view photo, button".
 */

/* ───────────────────── tiny shared hooks ───────────────────── */

function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [active])
}

function useEscapeToClose(active, onClose) {
  useEffect(() => {
    if (!active) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, onClose])
}

/**
 * Tiny entrance-state machine — `mounted` tracks "should be in the DOM",
 * `visible` tracks "should the open-state classes be applied". We need both
 * so the component can fade-out before unmounting.
 */
function useEntranceState(isOpen, durationMs = 200) {
  const [mounted, setMounted] = useState(isOpen)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    }
    setVisible(false)
    const t = setTimeout(() => setMounted(false), durationMs)
    return () => clearTimeout(t)
  }, [isOpen, durationMs])

  return { mounted, visible }
}

/* ───────────────────── lightbox dialog ───────────────────── */

function LightboxDialog({ open, onClose, src, alt, caption, subcaption, badge }) {
  const { mounted, visible } = useEntranceState(open, 220)
  const dialogRef = useRef(null)

  useBodyScrollLock(open)
  useEscapeToClose(open, onClose)

  // Send focus to the close button when the dialog opens — keyboard users
  // shouldn't have to tab through the entire page to dismiss.
  useEffect(() => {
    if (!visible) return
    const btn = dialogRef.current?.querySelector('[data-lightbox-close]')
    btn?.focus({ preventScroll: true })
  }, [visible])

  if (!mounted) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Photo'}
      ref={dialogRef}
      className={`fixed inset-0 z-[200] flex items-center justify-center px-3 sm:px-6 py-4 sm:py-8 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop — click to close */}
      <button
        type="button"
        aria-label="Close photo"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm cursor-zoom-out"
      />

      {/* Image card — sits above the backdrop */}
      <div
        className={`relative max-w-[96vw] max-h-[92vh] flex flex-col items-center transition-transform duration-200 ${
          visible ? 'scale-100' : 'scale-[0.96]'
        }`}
      >
        <img
          src={src}
          alt={alt || ''}
          onError={onPhotoError}
          className="block max-w-full max-h-[78vh] sm:max-h-[80vh] w-auto h-auto object-contain rounded-2xl shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] border border-white/10"
        />

        {/* Caption strip — only shows if any of the labels were passed in */}
        {(caption || subcaption || badge) && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 max-w-full px-3 sm:px-4 py-2 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10">
            {subcaption && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs uppercase tracking-[0.18em] font-bold text-cyan-300/95">
                <MapPin size={11} className="shrink-0" />
                {subcaption}
              </span>
            )}
            {caption && (
              <span className="text-sm sm:text-base font-bold text-white truncate max-w-[60vw]">
                {caption}
              </span>
            )}
            {badge && (
              <span className="hidden sm:inline-flex shrink-0 ml-auto px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase tracking-wider font-semibold text-slate-200 border border-white/10">
                {badge}
              </span>
            )}
          </div>
        )}

        {/* Close button — anchored to the top-right of the dialog */}
        <button
          type="button"
          data-lightbox-close
          onClick={onClose}
          aria-label="Close photo"
          className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <X size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>,
    document.body
  )
}

/* ───────────────────── public wrapper ───────────────────── */

/**
 * Renders a thumbnail that opens a lightbox on click.
 *
 * Props:
 *   src         — image URL (required)
 *   alt         — accessible label (defaults to caption)
 *   caption     — bold line under the full image
 *   subcaption  — small uppercase line above the caption
 *   badge       — optional pill on the right of the caption strip
 *   className   — passed to the inner <img> for sizing/cropping
 *   wrapperClassName — passed to the outer <button> wrapper
 *   showHint    — show a subtle "tap to expand" overlay on hover
 *   imgProps    — extra props forwarded to the thumbnail <img>
 */
export default function PhotoLightbox({
  src,
  alt,
  caption,
  subcaption,
  badge,
  className = '',
  wrapperClassName = '',
  showHint = true,
  imgProps = {},
  children,
}) {
  const [open, setOpen] = useState(false)

  const onOpen = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])

  if (!src) return null

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label={alt ? `View full photo: ${alt}` : 'View full photo'}
        className={`relative block w-full overflow-hidden cursor-zoom-in group/lightbox text-left p-0 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-0 ${wrapperClassName}`}
      >
        <img
          src={src}
          alt={alt || caption || ''}
          loading="lazy"
          onError={onPhotoError}
          className={className}
          {...imgProps}
        />

        {children /* lets the caller layer their own gradient/caption over the thumbnail */}

        {showHint && (
          <span
            aria-hidden
            className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-slate-950/65 backdrop-blur text-white border border-white/15 opacity-0 group-hover/lightbox:opacity-100 transition-opacity duration-200"
          >
            <Maximize2 size={11} strokeWidth={2.4} />
            View full
          </span>
        )}
      </button>

      <LightboxDialog
        open={open}
        onClose={onClose}
        src={src}
        alt={alt}
        caption={caption}
        subcaption={subcaption}
        badge={badge}
      />
    </>
  )
}
