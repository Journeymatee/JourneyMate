/**
 * Reusable UI hooks used by the About page (and freely available to the
 * rest of the product).
 *
 * Each hook follows the Single-Responsibility Principle: it owns one
 * concern (motion preferences, intersection observation, count-up
 * animation, typewriter effect, 3D tilt, experience-years). They are
 * intentionally framework-agnostic of the parent so they can be
 * composed in any component (Open/Closed) and depended upon as
 * abstractions (Dependency Inversion).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* ─────────────────────────────────────────────────────────────────
 *  useReducedMotion — honour OS-level prefers-reduced-motion.
 * ───────────────────────────────────────────────────────────────── */

export function useReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduce(mql.matches)
    update()
    mql.addEventListener?.('change', update)
    return () => mql.removeEventListener?.('change', update)
  }, [])
  return reduce
}

/* ─────────────────────────────────────────────────────────────────
 *  useInView — observe a node and report when it enters the viewport.
 *  By default it latches once, perfect for one-off enter animations.
 * ───────────────────────────────────────────────────────────────── */

export function useInView({
  threshold = 0.2,
  rootMargin = '0px',
  once = true,
} = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, inView]
}

/* ─────────────────────────────────────────────────────────────────
 *  useCountUp — animate a number from 0 → target with cubic ease-out.
 *  Respects reduced-motion. Re-runs whenever `start` flips true.
 * ───────────────────────────────────────────────────────────────── */

export function useCountUp({
  target,
  duration = 1500,
  start = true,
  decimals = 0,
}) {
  const [value, setValue] = useState(0)
  const reduce = useReducedMotion()
  const startedAt = useRef(null)

  useEffect(() => {
    if (!start) {
      setValue(0)
      startedAt.current = null
      return undefined
    }
    if (reduce) {
      setValue(target)
      return undefined
    }
    let raf = 0
    const factor = 10 ** decimals
    const tick = (t) => {
      if (startedAt.current == null) startedAt.current = t
      const elapsed = t - startedAt.current
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(target * eased * factor) / factor)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start, decimals, reduce])

  return value
}

/* ─────────────────────────────────────────────────────────────────
 *  useTypewriter — cycle through a list of words, typing/erasing
 *  each one. Falls back to a plain rotation when reduced-motion.
 * ───────────────────────────────────────────────────────────────── */

export function useTypewriter(
  words,
  { typeMs = 70, holdMs = 1400, eraseMs = 35 } = {},
) {
  const [text, setText] = useState('')
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('typing')
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!Array.isArray(words) || words.length === 0) return undefined

    if (reduce) {
      setText(words[idx])
      const t = setTimeout(
        () => setIdx((i) => (i + 1) % words.length),
        3500,
      )
      return () => clearTimeout(t)
    }

    const word = words[idx]
    let timeout
    if (phase === 'typing') {
      if (text.length < word.length) {
        timeout = setTimeout(
          () => setText(word.slice(0, text.length + 1)),
          typeMs,
        )
      } else {
        timeout = setTimeout(() => setPhase('erasing'), holdMs)
      }
    } else if (phase === 'erasing') {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), eraseMs)
      } else {
        setIdx((i) => (i + 1) % words.length)
        setPhase('typing')
      }
    }
    return () => clearTimeout(timeout)
  }, [text, idx, phase, words, typeMs, holdMs, eraseMs, reduce])

  return text
}

/* ─────────────────────────────────────────────────────────────────
 *  useTilt — pointer-driven 3D tilt. Sets CSS variables on the node
 *  so consumers can compose any transform they like via `style`.
 *  Skips the work entirely when reduced-motion is preferred.
 * ───────────────────────────────────────────────────────────────── */

export function useTilt({ max = 6, scale = 1.01 } = {}) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current
      if (!el || reduce) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      el.style.setProperty('--rx', `${((py - 0.5) * -2 * max).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`)
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      el.style.setProperty('--scale', String(scale))
    },
    [max, scale, reduce],
  )

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--scale', '1')
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}

/* ─────────────────────────────────────────────────────────────────
 *  useExperienceYears — expose live "years since `startISO`" to one
 *  decimal, refreshed every minute so the page never goes stale.
 * ───────────────────────────────────────────────────────────────── */

export function useExperienceYears(startISO) {
  const start = useMemo(() => new Date(startISO).getTime(), [startISO])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const years = (now - start) / (1000 * 60 * 60 * 24 * 365.25)
  return Math.max(0, Number(Math.max(years, 0).toFixed(1)))
}
