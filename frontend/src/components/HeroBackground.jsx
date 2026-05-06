import React, { useEffect, useState } from 'react'

/**
 * Hero rotation — six curated landscapes covering very different moods so
 * the carousel never feels repetitive:
 *   1. Western Ghats monsoon (Maharashtra)
 *   2. Himalayan hilltop monastery with prayer flags
 *   3. Araku Valley sunrise terraces (Andhra Pradesh)
 *   4. Konkan / tropical-coast sunset with palms & fishing boats
 *   5. Pakhal Lake sunset (Telangana)
 *   6. Himalayan valley at dawn with prayer flags strung over the viewpoint
 *
 * The order alternates green ↔ warm ↔ blue tones so adjacent crossfades
 * always shift the dominant colour of the frame.
 */
const DEFAULT_SLIDES = [
  {
    src: '/destinations/state-maharashtra.png',
    alt: 'Western Ghats in Maharashtra during monsoon — emerald cliffs draped in waterfalls and rolling clouds',
    focal: 'object-center',
  },
  {
    src: '/photos/Generated_image11.png',
    alt: 'Himalayan hilltop monastery with golden roofs, snow peaks behind and prayer flags strung across the ridge',
    focal: 'object-center',
  },
  {
    src: '/destinations/state-andhra.png',
    alt: 'Araku Valley terraces in Andhra Pradesh at sunrise — rice terraces, mist between hills and a winding road',
    focal: 'object-center',
  },
  {
    src: '/photos/Generated_image2.png',
    alt: 'Tropical Indian coast at sunset — palm trees framing fishing boats silhouetted against an orange sky',
    focal: 'object-center',
  },
  {
    src: '/destinations/state-telangana.png',
    alt: 'Pakhal Lake in Telangana at sunset — calm water reflecting orange sky with sailboats and egrets',
    focal: 'object-center',
  },
  {
    src: '/photos/Generated_image.png',
    alt: 'Himalayan valley viewpoint at dawn — prayer flags fluttering over forested slopes with snow peaks lit pink',
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
          {/* Light vertical veil — keeps the photo clear and vibrant. The
           * heavy lifting for text readability is done by text-shadow halos
           * on .hero-title / .hero-subtitle / shimmer drop-shadows, NOT by
           * darkening the photo. */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/55 to-slate-950/75" />
          <div className="absolute inset-0 bg-slate-950/15" />
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
