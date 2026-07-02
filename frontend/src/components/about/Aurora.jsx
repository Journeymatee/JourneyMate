import React from 'react'

/**
 * `Aurora` paints the page-wide ambient background:
 *   1. a deep cool-tone gradient base
 *   2. a softly-masked dot grid
 *   3. four drifting colour orbs (emerald, rose, indigo, sky)
 *   4. a top fade so the navbar reads cleanly
 *
 * All visual styling lives in `index.css` under `.about-aurora__*`
 * which has paired `[data-theme='light']` overrides — that means
 * Aurora is fully theme-aware without needing to touch this file.
 *
 * Single Responsibility: this component is purely structural; it
 * wires up classes and animations and nothing else.
 */
export default function Aurora() {
  return (
    <div
      className="about-aurora pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="about-aurora__base absolute inset-0" />
      <div className="about-aurora__grid absolute inset-0" />
      <div
        className="about-aurora__orb about-aurora__orb--emerald absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full blur-3xl"
        style={{ animation: 'drift1 22s ease-in-out infinite alternate', willChange: 'transform' }}
      />
      <div
        className="about-aurora__orb about-aurora__orb--rose absolute top-1/3 -right-32 w-[36rem] h-[36rem] rounded-full blur-3xl"
        style={{ animation: 'drift2 28s ease-in-out infinite alternate', willChange: 'transform' }}
      />
      <div
        className="about-aurora__orb about-aurora__orb--indigo absolute -bottom-40 left-1/3 w-[42rem] h-[42rem] rounded-full blur-3xl"
        style={{ animation: 'drift3 32s ease-in-out infinite alternate', willChange: 'transform' }}
      />
      <div
        className="about-aurora__orb about-aurora__orb--sky absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[55rem] rounded-full blur-3xl"
        style={{ animation: 'drift1 36s ease-in-out infinite alternate-reverse', willChange: 'transform' }}
      />
      <div className="about-aurora__topfade absolute inset-x-0 top-0 h-40" />
    </div>
  )
}
