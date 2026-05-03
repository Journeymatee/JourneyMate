import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Coffee,
  Compass,
  Eye,
  GraduationCap,
  Heart,
  Instagram,
  Lightbulb,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Plane,
  Quote,
  Scale,
  Send,
  Sparkles,
  Twitter,
} from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

/* ──────────────────────────────────────────────────────────────────
 *  Custom hooks
 *  ──────────────────────────────────────────────────────────────────
 *  Kept inline (rather than extracted to /hooks) because they are
 *  bespoke to this page; co-locating them keeps the file
 *  self-contained and easy to reason about.
 * ────────────────────────────────────────────────────────────────── */

/** True when the user prefers reduced motion. */
function useReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduce(mql.matches)
    update()
    mql.addEventListener?.('change', update)
    return () => mql.removeEventListener?.('change', update)
  }, [])
  return reduce
}

/**
 * IntersectionObserver as a hook. Returns [ref, inView]. Once the
 * element has been visible, `inView` stays true (so animations don't
 * replay on scroll-back).
 */
function useInView({ threshold = 0.2, rootMargin = '0px', once = true } = {}) {
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

/**
 * Smooth count-up driven by `requestAnimationFrame`. ease-out-cubic.
 * Honours prefers-reduced-motion (snaps straight to the target).
 */
function useCountUp({ target, duration = 1500, start = true, decimals = 0 }) {
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

/**
 * Cycling typewriter. Types each word, holds, erases, advances. Pure
 * CPU/setTimeout — no third-party deps.
 */
function useTypewriter(words, { typeMs = 70, holdMs = 1400, eraseMs = 35 } = {}) {
  const [text, setText] = useState('')
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState('typing') // 'typing' | 'erasing'
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) {
      setText(words[idx])
      const t = setTimeout(() => setIdx((i) => (i + 1) % words.length), 3500)
      return () => clearTimeout(t)
    }
    const word = words[idx]
    let timeout
    if (phase === 'typing') {
      if (text.length < word.length) {
        timeout = setTimeout(() => setText(word.slice(0, text.length + 1)), typeMs)
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

/**
 * 3D tilt + spotlight. Sets four CSS custom properties on the target
 * (--rx, --ry, --mx, --my) which the markup can map to transforms or
 * radial gradients. Disabled for prefers-reduced-motion / touch.
 */
function useTilt({ max = 8, scale = 1.015 } = {}) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  const onMove = useCallback(
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

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--scale', '1')
  }, [])

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave }
}

/**
 * Live "years coding" counter — re-computes once per minute so the
 * stat ticks up while the tab is open.
 */
function useExperienceYears(startISO) {
  const start = useMemo(() => new Date(startISO).getTime(), [startISO])
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  const years = (now - start) / (1000 * 60 * 60 * 24 * 365.25)
  return Math.max(0, Number(Math.max(years, 0).toFixed(1)))
}

/* ──────────────────────────────────────────────────────────────────
 *  Static data
 * ────────────────────────────────────────────────────────────────── */

const ROLES = Object.freeze([
  'building JourneyMate',
  'making trip-planning honest',
  'comparing budget vs luxury',
  'shipping JourneyMate, one feature at a time',
])

/**
 * Why JourneyMate exists. Each motivation tells a slice of the story
 * behind the build. Tone: honest, traveller-first, not corporate.
 */
const MOTIVATIONS = Object.freeze([
  {
    Icon: Coffee,
    eyebrow: 'The pain that started it',
    title: 'Seven tabs to plan a weekend',
    body:
      'I was planning a 3-day Goa trip with seven tabs open — Skyscanner, MakeMyTrip, IRCTC, Booking, Maps, Tripadvisor, Yatra. By the time I\u2019d cross-referenced them, the prices had shifted and I\u2019d lost the train details from tab one. There had to be a better way.',
    accent: 'amber',
    glow: 'rgba(245, 158, 11, 0.30)',
  },
  {
    Icon: Eye,
    eyebrow: 'No more asterisk prices',
    title: 'Show me what I actually pay',
    body:
      '\u201CStarting from \u20B92,499*\u201D is the most lied-to-by-asterisks number in Indian travel. JourneyMate quotes the real numbers \u2014 class fares, surge windows, hotel rates \u2014 not a marketing hook that triples at checkout.',
    accent: 'cyan',
    glow: 'rgba(34, 211, 238, 0.30)',
  },
  {
    Icon: Scale,
    eyebrow: 'Budget vs luxury, side by side',
    title: 'The choice should be yours',
    body:
      'Most apps push one lane and keep you in it. I wanted both visible at once \u2014 the \u20B93,000 sleeper next to the \u20B915,000 flight + five-star night \u2014 so travellers can see the trade-offs, not just the upsell.',
    accent: 'emerald',
    glow: 'rgba(34, 197, 94, 0.30)',
  },
  {
    Icon: Compass,
    eyebrow: 'Built for India, day one',
    title: 'Not a global app reskinned',
    body:
      '600+ routes, 68 cities, real street food, regional weather, a Hinglish AI assistant. Designed around how Indians actually plan trips \u2014 our seasons, our trains, our long weekends \u2014 instead of a foreign template forced into a saree.',
    accent: 'rose',
    glow: 'rgba(244, 63, 94, 0.30)',
  },
])

const STORY = Object.freeze([
  {
    icon: GraduationCap,
    color: 'text-cyan-300',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    year: '2020 – 2024',
    title: 'B.Tech, NIT Agartala',
    body: 'Computer Science & Engineering. Fell in love with backend systems, clean APIs, and the quiet thrill of green CI builds.',
  },
  {
    icon: Plane,
    color: 'text-emerald-300',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    year: '2026',
    title: 'JourneyMate',
    body: 'Six months of nights and weekends. A real-data trip-planner that compares budget vs luxury across 600+ Indian routes.',
  },
])

const SOCIALS = Object.freeze([
  {
    Icon: Linkedin,
    label: 'LinkedIn',
    handle: 'in/harsh-vardhan-8b406a250',
    href: 'https://www.linkedin.com/in/harsh-vardhan-8b406a250',
    glow: 'rgba(59, 130, 246, 0.35)',
    border: 'border-blue-500/35',
    text: 'text-blue-300',
    surface: 'from-blue-500/15 to-blue-700/5',
  },
  {
    Icon: Twitter,
    label: 'Twitter / X',
    handle: '@Harsh____06',
    href: 'https://x.com/Harsh____06',
    glow: 'rgba(148, 163, 184, 0.35)',
    border: 'border-white/15',
    text: 'text-slate-200',
    surface: 'from-slate-400/10 to-slate-600/5',
  },
  {
    Icon: Instagram,
    label: 'Instagram',
    handle: '@harshify__14',
    href: 'https://www.instagram.com/harshify__14',
    glow: 'rgba(244, 114, 182, 0.35)',
    border: 'border-pink-500/35',
    text: 'text-pink-300',
    surface: 'from-pink-500/15 to-rose-700/5',
  },
  {
    Icon: Mail,
    label: 'Email me',
    handle: 'harshvardhan1412002@gmail.com',
    href: 'mailto:harshvardhan1412002@gmail.com',
    glow: 'rgba(34, 197, 94, 0.35)',
    border: 'border-emerald-500/35',
    text: 'text-emerald-300',
    surface: 'from-emerald-500/15 to-green-700/5',
  },
])

/* ──────────────────────────────────────────────────────────────────
 *  Subcomponents
 * ────────────────────────────────────────────────────────────────── */

/** Drifting blurred-orb backdrop. Pure CSS, GPU-friendly. */
function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full opacity-50 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.22) 0%, transparent 70%)',
          animation: 'drift1 22s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[36rem] h-[36rem] rounded-full opacity-45 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.20) 0%, transparent 70%)',
          animation: 'drift2 28s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute -bottom-40 left-1/3 w-[42rem] h-[42rem] rounded-full opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%)',
          animation: 'drift3 32s ease-in-out infinite alternate',
          willChange: 'transform',
        }}
      />
    </div>
  )
}

/** A single animated number with label, animates on view. */
function StatBlock({ value, label, suffix = '', start = true, decimals = 0 }) {
  const animated = useCountUp({ target: value, start, duration: 1600, decimals })
  const display =
    decimals > 0
      ? animated.toFixed(decimals)
      : Math.round(animated).toLocaleString()
  return (
    <div className="text-center sm:text-left">
      <div className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight bg-gradient-to-br from-emerald-300 via-amber-200 to-rose-300 bg-clip-text text-transparent">
        {display}
        {suffix}
      </div>
      <div className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
        {label}
      </div>
    </div>
  )
}

/**
 * Accent → tailwind class lookup. Centralised so the data table stays
 * lean and we don\u2019t need 4 ad-hoc strings inline. The accent palette
 * matches the rest of the app (silver/gold/emerald/cyan/rose/amber).
 */
const ACCENT_CLASSES = Object.freeze({
  amber: {
    icon: 'text-amber-300',
    iconBg: 'bg-amber-500/15 border-amber-500/35',
    title: 'text-amber-200',
    eyebrow: 'text-amber-300/90',
  },
  cyan: {
    icon: 'text-cyan-300',
    iconBg: 'bg-cyan-500/15 border-cyan-500/35',
    title: 'text-cyan-200',
    eyebrow: 'text-cyan-300/90',
  },
  emerald: {
    icon: 'text-emerald-300',
    iconBg: 'bg-emerald-500/15 border-emerald-500/35',
    title: 'text-emerald-200',
    eyebrow: 'text-emerald-300/90',
  },
  rose: {
    icon: 'text-rose-300',
    iconBg: 'bg-rose-500/15 border-rose-500/35',
    title: 'text-rose-200',
    eyebrow: 'text-rose-300/90',
  },
})

/**
 * One motivation behind JourneyMate. Reveals on scroll, leans toward
 * its accent on hover with a soft glow. Quote-style typography.
 */
function MotivationCard({ item, index }) {
  const [ref, inView] = useInView({ threshold: 0.18 })
  const accent = ACCENT_CLASSES[item.accent] || ACCENT_CLASSES.emerald
  const Icon = item.Icon

  return (
    <article
      ref={ref}
      className={`group relative rounded-3xl border border-white/10 bg-white/4 backdrop-blur-md p-5 sm:p-6 overflow-hidden transition-all duration-700 ease-out hover:-translate-y-1 hover:border-white/20 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{
        transitionDelay: `${index * 90}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 24px 48px -16px ${item.glow}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Gradient corner glow that intensifies on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle, ${item.glow}, transparent 70%)` }}
      />

      <div className="relative flex items-start gap-4">
        <span
          className={`shrink-0 grid place-items-center w-12 h-12 rounded-2xl border ${accent.iconBg} backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`}
        >
          <Icon size={20} className={accent.icon} aria-hidden />
        </span>

        <div className="min-w-0">
          <div
            className={`text-[10px] uppercase tracking-[0.14em] font-semibold ${accent.eyebrow} mb-1`}
          >
            {item.eyebrow}
          </div>
          <h3
            className={`font-display font-bold text-lg sm:text-xl leading-snug mb-2.5 ${accent.title}`}
          >
            {item.title}
          </h3>
          <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
            {item.body}
          </p>
        </div>
      </div>
    </article>
  )
}

/** A scroll-revealed timeline entry. */
function StoryItem({ item }) {
  const [ref, inView] = useInView({ threshold: 0.25 })
  const Icon = item.icon
  return (
    <li
      ref={ref}
      className={`relative pl-14 pb-8 last:pb-0 transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <span
        className={`absolute left-0 top-0 grid place-items-center w-11 h-11 rounded-2xl border ${item.border} ${item.bg} backdrop-blur-md`}
      >
        <Icon size={17} className={item.color} aria-hidden />
      </span>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
        {item.year}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
        {item.title}
      </h3>
      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{item.body}</p>
    </li>
  )
}

/** Branded social card with a coloured glow on hover. */
function SocialCard({ s }) {
  return (
    <a
      href={s.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex items-center gap-3 p-3.5 rounded-2xl border ${s.border} bg-gradient-to-br ${s.surface} ${s.text} transition-all duration-300 hover:-translate-y-0.5 overflow-hidden`}
      style={{
        '--glow': s.glow,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 16px 32px -12px ${s.glow}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <span
        className={`grid place-items-center w-11 h-11 rounded-xl bg-white/8 border border-white/10 shrink-0`}
      >
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

/* ──────────────────────────────────────────────────────────────────
 *  Page
 * ────────────────────────────────────────────────────────────────── */

export default function AboutOwner() {
  const role = useTypewriter(ROLES)
  const yearsCoding = useExperienceYears('2021-08-01')
  const [statsRef, statsInView] = useInView({ threshold: 0.4 })
  const portrait = useTilt({ max: 7, scale: 1.02 })

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <Aurora />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to JourneyMate
        </Link>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section
          className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-10 sm:gap-14 items-center mb-20 sm:mb-24"
          aria-labelledby="about-name"
        >
          {/* Portrait card with animated ring + 3-D tilt + cursor spotlight */}
          <div className="relative mx-auto sm:mx-0">
            <div
              ref={portrait.ref}
              onMouseMove={portrait.onMouseMove}
              onMouseLeave={portrait.onMouseLeave}
              className="relative will-change-transform"
              style={{
                transform:
                  'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--scale, 1))',
                transition: 'transform 250ms ease-out',
              }}
            >
              {/* Spinning conic ring */}
              <div
                className="absolute -inset-2 rounded-[2.4rem] blur-md opacity-80"
                aria-hidden
                style={{
                  background:
                    'conic-gradient(from 0deg, #22c55e, #f59e0b, #f43f5e, #6366f1, #22c55e)',
                  animation: 'ringSpin 14s linear infinite',
                  willChange: 'transform',
                }}
              />
              {/* Photo + spotlight overlay */}
              <div className="relative rounded-[2rem] overflow-hidden border border-white/15 shadow-2xl shadow-black/50 bg-slate-950/40">
                <img
                  src="/harsh.jpeg"
                  alt="Harsh Vardhan Kumar"
                  loading="eager"
                  decoding="async"
                  className="block w-44 h-44 sm:w-56 sm:h-56 object-cover object-top"
                  style={{ filter: 'saturate(1.08) contrast(1.04)' }}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden
                  style={{
                    background:
                      'radial-gradient(circle 130px at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.20), transparent 65%)',
                    mixBlendMode: 'soft-light',
                  }}
                />
              </div>
            </div>

            {/* "Open to opportunities" pill */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 whitespace-nowrap shadow-lg shadow-black/40">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-300">
                Open to opportunities
              </span>
            </div>
          </div>

          {/* Intro */}
          <div className="text-center sm:text-left mt-6 sm:mt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 mb-4">
              <Sparkles size={11} className="text-amber-300" aria-hidden />
              <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-200">
                Maker · Traveller · Dev
              </span>
            </div>

            <h1
              id="about-name"
              className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-white mb-3"
            >
              Hi, I&apos;m{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-300 bg-clip-text text-transparent">
                Harsh
              </span>
              .
            </h1>

            {/* Typewriter sub-line */}
            <h2 className="text-base sm:text-lg text-slate-300 mb-5 min-h-[1.6em]">
              I&apos;m{' '}
              <span className="font-semibold text-white">
                {role || '\u00A0'}
              </span>
              <span
                className="ml-0.5 inline-block w-[2px] h-5 align-text-bottom bg-emerald-400 animate-blink"
                aria-hidden
              />
            </h2>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto sm:mx-0 mb-7">
              I build things real travellers actually use. Java + React, brewed
              with way too much coffee and shipped from{' '}
              <span className="text-white font-medium">
                Agartala → Hyderabad → wherever the next trip takes me
              </span>
              .
            </p>

            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-2 max-w-md mx-auto sm:mx-0"
            >
              <StatBlock
                value={yearsCoding}
                suffix="+"
                label="Years coding"
                start={statsInView}
                decimals={1}
              />
              <StatBlock value={600} suffix="+" label="Routes" start={statsInView} />
              <StatBlock value={68} label="Cities" start={statsInView} />
            </div>
          </div>
        </section>

        {/* ── Story / Timeline ───────────────────────────────────── */}
        <section className="mb-20" aria-labelledby="about-journey">
          <SectionHeader
            id="about-journey"
            icon={<Calendar size={16} strokeWidth={2.4} />}
            accent="emerald"
            eyebrow="My timeline"
            title="The journey so far"
            subtitle="From the lecture halls of NIT Agartala to shipping JourneyMate."
            divider
            className="!mb-8"
          />

          <ol className="relative">
            <span
              aria-hidden
              className="absolute left-[1.4rem] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/40 via-amber-500/30 to-transparent"
            />
            {STORY.map((item) => (
              <StoryItem key={item.title} item={item} />
            ))}
          </ol>
        </section>

        {/* ── Why I built JourneyMate ────────────────────────────── */}
        <section className="mb-20" aria-labelledby="about-why">
          <SectionHeader
            id="about-why"
            icon={<Lightbulb size={16} strokeWidth={2.4} />}
            accent="amber"
            eyebrow="The motivation"
            title="Why I built JourneyMate"
            divider
            className="!mb-3"
          />
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mb-8 leading-relaxed">
            Four reasons this app exists — what nudged me from
            <span className="text-slate-200">{' '}&ldquo;someone should make this&rdquo;{' '}</span>
            to opening a fresh React project at 1 a.m.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {MOTIVATIONS.map((item, i) => (
              <MotivationCard key={item.title} item={item} index={i} />
            ))}
          </div>

          {/* Closing thought — quote-style callout. */}
          <figure className="relative mt-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-amber-500/4 to-rose-500/4 backdrop-blur-md p-6 sm:p-8 overflow-hidden">
            <Quote
              size={64}
              className="absolute -top-4 -left-2 text-emerald-500/15 pointer-events-none"
              aria-hidden
            />
            <blockquote className="relative">
              <p className="font-display italic text-lg sm:text-xl text-white leading-snug mb-3">
                Travel planning shouldn&apos;t feel like spreadsheet work.
              </p>
              <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                JourneyMate is the tool I built for myself because I was tired of
                the alternatives — and I&apos;m sharing it because everyone
                I&apos;ve shown it to wants one too.
              </p>
              <figcaption className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">
                <Heart size={11} className="fill-emerald-400 text-emerald-400" aria-hidden />
                Harsh, the founder
              </figcaption>
            </blockquote>
          </figure>
        </section>

        {/* ── Connect ────────────────────────────────────────────── */}
        <section className="mb-12" aria-labelledby="about-connect">
          <SectionHeader
            id="about-connect"
            icon={<Send size={16} strokeWidth={2.4} />}
            accent="rose"
            eyebrow="Get in touch"
            title="Let's chat"
            subtitle="Pick the channel that suits you — I read every DM, comment, and email."
            divider
            className="!mb-8"
          />

          <div className="grid sm:grid-cols-2 gap-3">
            {SOCIALS.map((s) => (
              <SocialCard key={s.label} s={s} />
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { Icon: MapPin, label: 'India 🇮🇳' },
              { Icon: Phone, label: '+91 6207384926' },
            ].map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300"
              >
                <Icon size={11} className="text-slate-500" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="text-center pt-10 border-t border-white/8">
          <p className="text-sm text-slate-400 mb-5">
            Ready to plan your next trip?
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
          >
            <Plane size={15} aria-hidden />
            Try JourneyMate
            <ArrowRight size={14} aria-hidden />
          </Link>
        </section>
      </div>
    </main>
  )
}
