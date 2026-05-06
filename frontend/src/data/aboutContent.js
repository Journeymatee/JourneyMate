/**
 * Single source of truth for the About page's editorial content.
 *
 * Why a dedicated module?
 *  - Open/Closed: extending or rewording any section means editing data
 *    here, not the rendering components.
 *  - Dependency Inversion: section components depend on these data
 *    shapes (interfaces), not on hard-coded strings inside JSX.
 *  - Easy to internationalise later — just swap this file's exports
 *    for locale-aware variants.
 */

import {
  Code2,
  Coffee,
  Compass,
  Cpu,
  Eye,
  Globe,
  GraduationCap,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  Plane,
  Rocket,
  Scale,
  Twitter,
} from 'lucide-react'

/* ─── Identity / portrait ────────────────────────────────────────── */

export const PROFILE = Object.freeze({
  name: 'Harsh',
  fullName: 'Harsh Vardhan Kumar',
  email: 'harshvardhan1412002@gmail.com',
  phone: '+91 6207384926',
  location: 'Hyderabad, India',
  startedCodingISO: '2021-08-01',
  portraitSrc: '/harshvardhan.jpeg',
  portraitAlt: 'Harsh Vardhan Kumar — Founder of JourneyMate',
})

export const HEADLINE_STATS = Object.freeze([
  { id: 'years', valueRef: 'experienceYears', label: 'Years coding', suffix: '+', decimals: 1 },
  { id: 'routes', value: 600, label: 'Routes', suffix: '+' },
  { id: 'cities', value: 68, label: 'Cities' },
])

/* ─── Animated typewriter roles ──────────────────────────────────── */

export const ROLES = Object.freeze([
  'building JourneyMate',
  'designing honest trip-planning',
  'comparing budget vs luxury',
  'shipping JourneyMate, one feature at a time',
  'turning coffee into code',
])

/* ─── Why JourneyMate exists — the four motivation cards ─────────── */

export const MOTIVATIONS = Object.freeze([
  {
    id: 'tabs',
    Icon: Coffee,
    eyebrow: 'The pain that started it',
    title: 'Seven tabs to plan a weekend',
    body:
      'I was planning a 3-day Goa trip with seven tabs open — Skyscanner, MakeMyTrip, IRCTC, Booking, Maps, Tripadvisor, Yatra. By the time I\u2019d cross-referenced them, the prices had shifted and I\u2019d lost the train details from tab one. There had to be a better way.',
    accent: 'amber',
    glow: 'rgba(245, 158, 11, 0.30)',
  },
  {
    id: 'asterisk',
    Icon: Eye,
    eyebrow: 'No more asterisk prices',
    title: 'Show me what I actually pay',
    body:
      '\u201CStarting from \u20B92,499*\u201D is the most lied-to-by-asterisks number in Indian travel. JourneyMate quotes the real numbers \u2014 class fares, surge windows, hotel rates \u2014 not a marketing hook that triples at checkout.',
    accent: 'cyan',
    glow: 'rgba(34, 211, 238, 0.30)',
  },
  {
    id: 'sidebyside',
    Icon: Scale,
    eyebrow: 'Budget vs luxury, side by side',
    title: 'The choice should be yours',
    body:
      'Most apps push one lane and keep you in it. I wanted both visible at once \u2014 the \u20B93,000 sleeper next to the \u20B915,000 flight + five-star night \u2014 so travellers can see the trade-offs, not just the upsell.',
    accent: 'emerald',
    glow: 'rgba(34, 197, 94, 0.30)',
  },
  {
    id: 'india',
    Icon: Compass,
    eyebrow: 'Built for India, day one',
    title: 'Not a global app reskinned',
    body:
      '600+ routes, 68 cities, real street food, regional weather, a Hinglish AI assistant. Designed around how Indians actually plan trips \u2014 our seasons, our trains, our long weekends \u2014 instead of a foreign template forced into a saree.',
    accent: 'rose',
    glow: 'rgba(244, 63, 94, 0.30)',
  },
])

/* ─── Career timeline ────────────────────────────────────────────── */

export const STORY = Object.freeze([
  {
    id: 'btech',
    Icon: GraduationCap,
    color: 'text-cyan-300',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    year: '2021 – 2025',
    title: 'B.Tech, NIT Agartala',
    body:
      'Computer Science & Engineering. Fell in love with backend systems, clean APIs, and the quiet thrill of green CI builds.',
  },
  {
    id: 'eng',
    Icon: Code2,
    color: 'text-violet-300',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    year: '2024 – present',
    title: 'Software engineering — Hyderabad',
    body:
      'Java, Spring Boot, REST APIs, distributed systems. Learned how serious code ships at scale and how to write tests that actually catch bugs.',
  },
  {
    id: 'jm',
    Icon: Plane,
    color: 'text-emerald-300',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    year: '2026',
    title: 'JourneyMate',
    body:
      'Six months of nights and weekends. A real-data trip-planner that compares budget vs luxury across 600+ Indian routes.',
  },
])

/* ─── Engineering principles ─────────────────────────────────────── */

export const PHILOSOPHY = Object.freeze([
  {
    id: 'ship',
    Icon: Rocket,
    title: 'Ship, then polish',
    body: 'Real users teach you what matters in a week — opinions take a year.',
  },
  {
    id: 'user',
    Icon: Heart,
    title: 'Build for the user, not the demo',
    body: 'Every feature has to survive the question: would I personally use this?',
  },
  {
    id: 'data',
    Icon: Cpu,
    title: 'Honest data > flashy charts',
    body: 'A clear number with the right caveat beats a beautiful number that\u2019s misleading.',
  },
  {
    id: 'india',
    Icon: Globe,
    title: 'Designed in India, for India',
    body: 'Default to local context — currency, language, seasons, transport — not a foreign template.',
  },
])

/* ─── Social channels ────────────────────────────────────────────── */

export const SOCIALS = Object.freeze([
  {
    id: 'linkedin',
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
    id: 'twitter',
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
    id: 'instagram',
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
    id: 'email',
    Icon: Mail,
    label: 'Email me',
    handle: PROFILE.email,
    href: `mailto:${PROFILE.email}`,
    glow: 'rgba(34, 197, 94, 0.35)',
    border: 'border-emerald-500/35',
    text: 'text-emerald-300',
    surface: 'from-emerald-500/15 to-green-700/5',
  },
])

/* ─── Accent → tailwind class lookup, used by the motivation cards ─ */

export const ACCENT_CLASSES = Object.freeze({
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
 * Default accent fallback used by `MotivationCard` when an item
 * specifies an unknown accent — keeps the component fail-safe.
 */
export const DEFAULT_ACCENT = ACCENT_CLASSES.emerald
