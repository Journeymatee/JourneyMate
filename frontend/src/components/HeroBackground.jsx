import React, { useEffect, useState } from 'react'

const DEFAULT_SLIDES = [
  {
    src: '/photos/hero-himalaya.png',
    alt: 'Himalayan peaks at sunset with Tibetan prayer flags fluttering across the valley',
    focal: 'object-center',
  },
  {
    src: '/photos/hero-kerala.png',
    alt: 'Traditional houseboat drifting through Kerala backwaters at golden hour',
    focal: 'object-center',
  },
  {
    src: '/photos/hero-goa.png',
    alt: 'Goan beach with palm trees silhouetted against an orange sunset',
    focal: 'object-center',
  },
]

const SLIDE_INTERVAL_MS = 7000

/**
 * Cinematic rotating background for the hero section.
 * - Crossfades between travel photos every ~7s with a subtle Ken Burns zoom.
 * - Respects prefers-reduced-motion (no zoom, no rotation).
 * - Pauses while the tab is hidden to save bandwidth.
 */
export default function HeroBackground({ slides = DEFAULT_SLIDES, interval = SLIDE_INTERVAL_MS, overlay = true }) {
  const [active, setActive] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(mql.matches)
    update()
    mql.addEventListener?.('change', update)
    return () => mql.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || reduceMotion) return undefined
    let timer

    const tick = () => {
      timer = setTimeout(() => {
        if (typeof document === 'undefined' || !document.hidden) {
          setActive((prev) => (prev + 1) % slides.length)
        }
        tick()
      }, interval)
    }

    tick()
    return () => clearTimeout(timer)
  }, [slides.length, interval, reduceMotion])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {slides.map((slide, i) => {
        const isActive = i === active
        return (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchpriority={i === 0 ? 'high' : 'low'}
            className={`absolute inset-0 h-full w-full object-cover ${slide.focal || 'object-center'} transition-opacity duration-[1500ms] ease-in-out ${
              isActive ? 'opacity-100' : 'opacity-0'
            } ${reduceMotion ? '' : isActive ? 'animate-[heroZoom_8s_ease-out_forwards]' : 'scale-100'}`}
          />
        )
      })}

      {overlay && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/70 to-slate-950/85" />
          <div className="absolute inset-0 bg-slate-950/35" />
        </>
      )}

      {/* keyframes injected once globally (idempotent) */}
      <style>{`
        @keyframes heroZoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  )
}
