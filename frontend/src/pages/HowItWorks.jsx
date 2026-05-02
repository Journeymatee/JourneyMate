import React from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  BarChart3,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Train,
  Plane,
  Hotel,
  MapPin,
  Compass,
  ShieldCheck,
  Heart,
  Globe2,
  Languages,
  Leaf,
  Smartphone,
  Wand2,
  Users,
  Bookmark,
  Store,
  Image as ImageIcon,
  Bot,
  Zap,
} from 'lucide-react'

/* ─────────────────────────── Step-by-step flow ─────────────────────────── */
const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Enter Your Route',
    desc: 'Type your origin and destination from a database of 300+ Indian cities. Autocomplete is powered by OpenStreetMap, so even small towns and hill stations resolve cleanly.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    detail: 'Tell us who you are travelling with — solo, couple, family, friends — and pick the vibes (food, adventure, heritage, nightlife…). The plan reshapes around your selection.',
  },
  {
    step: '02',
    icon: BarChart3,
    title: 'We Compare Instantly',
    desc: 'JourneyMate generates two complete, side-by-side packages — Silver (budget-smart) and Gold (luxury) — with transport, stay, dining, and a 1–5 day itinerary you can flip through.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    detail: 'Plans are built from real-world pricing for trains, buses, flights, hostels, guesthouses, and 4-/5-star hotels. Re-pick your trip length and the whole plan rebuilds in seconds.',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Explore on the Map',
    desc: 'See the route visualised on an interactive map, with one pin per day of the itinerary. Tap a state in search and you also get a hand-picked landscape photo of where you are headed.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    detail: 'Every state and union territory is mapped to an iconic biome — Himalayan alpine, Konkan coast, Thar desert, Western Ghats, Northeast rainforest, Deccan plateau and more.',
  },
  {
    step: '04',
    icon: CreditCard,
    title: 'Pick & Book',
    desc: 'Choose the plan that fits your budget and travel style. Silver saves you serious money; Gold gives you a curated experience with concierge-grade touches.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    detail: 'On average, Silver saves around ₹12,500 versus Gold for the same route — often enough to fund a second short trip later in the year.',
  },
]

/* ─────────────────────────── About JourneyMate ─────────────────────────── */
const ABOUT_STATS = [
  { value: '300+',  label: 'Indian cities indexed',                icon: MapPin,      color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20'   },
  { value: '600+',  label: 'travel routes covered',                icon: Compass,     color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
  { value: '29 + 8', label: 'states & UTs with iconic photography', icon: ImageIcon,  color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20'},
  { value: '~3 s',  label: 'to a full Silver vs Gold compare',     icon: Zap,         color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
]

const ABOUT_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Transparent by default',
    desc: 'Every rupee in a plan is broken down. No hidden booking fees, no surprise resort markups — what you see in the compare view is what you book.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: Heart,
    title: 'Built for Indian travel',
    desc: 'Sleeper trains and AC 3-tier matter. So do dhabas, family-run guesthouses and heritage stays. JourneyMate models the way Indians actually travel, not a generic global template.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: Bot,
    title: 'AI-assisted, human-curated',
    desc: 'A built-in AI assistant helps you pick destinations, refine vibes, and answer route questions. Heritage hotels, fine dining and curated experiences are vetted by hand.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
]

/* ───────────────────── Roadmap — what we are building next ───────────────────── */
const ROADMAP = [
  {
    horizon: 'Now',
    badge: 'In build',
    badgeColor: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/30',
    items: [
      {
        icon: Wand2,
        title: 'Custom itinerary editor',
        desc: 'Drag, drop, swap and re-time any day of your plan. Replace a hotel, add a detour, lock a flight — the totals re-compute live.',
      },
      {
        icon: Bookmark,
        title: 'Saved trips & wishlist',
        desc: 'Pin plans you like, get back to half-finished searches, and share a private link with whoever you are travelling with.',
      },
      {
        icon: Users,
        title: 'Group collaboration',
        desc: 'Invite friends or family to a trip. Vote on stays, split costs, and resolve "who books the train?" without a single WhatsApp scroll.',
      },
    ],
  },
  {
    horizon: 'Next',
    badge: 'On deck',
    badgeColor: 'text-sky-300',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/30',
    items: [
      {
        icon: Plane,
        title: 'Live inventory & one-tap booking',
        desc: 'Move from indicative pricing to live IRCTC, flight and hotel inventory, with seat/room selection and instant confirmation inside the app.',
      },
      {
        icon: Smartphone,
        title: 'JourneyMate mobile apps',
        desc: 'Native iOS and Android apps with offline itineraries, push reminders before each leg, and a cleaner travel-day experience.',
      },
      {
        icon: Bot,
        title: 'Smarter AI travel agent',
        desc: 'Tell the assistant "make it 10% cheaper" or "swap the beach day for a trek" and watch the whole plan adapt — including transport.',
      },
    ],
  },
  {
    horizon: 'Later',
    badge: 'Exploring',
    badgeColor: 'text-violet-300',
    badgeBg: 'bg-violet-500/15',
    badgeBorder: 'border-violet-500/30',
    items: [
      {
        icon: Globe2,
        title: 'International destinations',
        desc: 'Same Silver vs Gold magic, expanded to South-East Asia, the Gulf and Europe — designed around how Indian passports and budgets actually move.',
      },
      {
        icon: Languages,
        title: 'Hindi & regional languages',
        desc: 'Plan and read your full itinerary in Hindi, Tamil, Telugu, Bengali, Marathi and more — including spoken AI assistant in your language.',
      },
      {
        icon: Leaf,
        title: 'Carbon-aware travel',
        desc: 'Show the CO₂ cost of each option, and offer a "low-carbon" plan beside Silver/Gold so you can pick a greener route knowingly.',
      },
      {
        icon: Store,
        title: 'Local creator marketplace',
        desc: 'Let local guides, photographers and home-chefs publish experiences that slot directly into Gold plans — money goes to the people on the ground.',
      },
    ],
  },
]

/* ─────────────────────────────── FAQ ─────────────────────────────── */
const FAQS = [
  { q: 'Is JourneyMate free to use?', a: 'Yes — searching and comparing Silver vs Gold plans is completely free. We only charge if you book through us directly, and even then the price is shown upfront before you confirm.' },
  { q: 'How accurate are the prices?', a: 'Prices are indicative and based on current market averages. Actual prices vary by season, availability, and how far ahead you book. Live inventory + booking is on our near-term roadmap.' },
  { q: 'Can I use this for international trips?', a: 'JourneyMate currently focuses on Indian domestic travel across 600+ routes. International destinations are in the "Later" tier of our roadmap — see the timeline above.' },
  { q: 'What is the difference between Silver and Gold?', a: 'Silver is optimised for value — trains, guesthouses, local street food, day-trip experiences. Gold is curated luxury — direct flights, heritage or 4-/5-star hotels, fine dining, private transfers, and concierge support.' },
  { q: 'Can I customise the itinerary?', a: 'You can already change trip length (1–5 days), trip type (solo / couple / family / friends) and vibes — the plan rebuilds automatically. A full drag-and-drop itinerary editor is being built right now (see the "Now" section above).' },
  { q: 'How does the AI assistant work?', a: 'The floating assistant on every page can answer route questions, recommend destinations based on your vibes, and explain why a plan was built the way it was. It does not book on your behalf yet — that lands with the smarter AI travel agent in the "Next" tier.' },
]

/* ─────────────────────────────── Page ─────────────────────────────── */
export default function HowItWorks() {
  return (
    <div className="min-h-[100dvh] page-bg-blue pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 mb-6">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-sm text-slate-300 font-medium">Simple. Fast. Transparent.</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            How JourneyMate<br />
            <span className="shimmer-blue">Works</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From a single search to a full Silver vs Gold itinerary in under three seconds — and a clear picture of where the product is heading next.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mb-20 sm:mb-28">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/40 via-blue-500/20 to-indigo-500/40 hidden sm:block -translate-x-1/2" />

          <div className="space-y-10 sm:space-y-16">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isRight = i % 2 === 1
              return (
                <div
                  key={s.step}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 ${isRight ? 'sm:flex-row-reverse' : ''}`}
                >
                  {/* Card */}
                  <div className={`flex-1 glass rounded-3xl p-6 sm:p-8 border ${s.border} hover:scale-[1.01] transition-transform`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
                        <Icon size={22} className={s.color} />
                      </div>
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-widest ${s.color} mb-1`}>Step {s.step}</div>
                        <h3 className="font-display font-bold text-xl text-white">{s.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-3">{s.desc}</p>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-white/6 pt-3">{s.detail}</p>
                  </div>

                  {/* Step number circle */}
                  <div className="hidden sm:flex w-16 shrink-0 items-center justify-center">
                    <div className={`w-12 h-12 rounded-full ${s.bg} border-2 ${s.border} flex items-center justify-center font-display font-bold text-sm ${s.color} shadow-lg z-10`}>
                      {s.step}
                    </div>
                  </div>

                  <div className="flex-1 hidden sm:block" />
                </div>
              )
            })}
          </div>
        </div>

        {/* About JourneyMate */}
        <section className="mb-20 sm:mb-28">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 mb-5">
              <Compass size={14} className="text-indigo-400" />
              <span className="text-xs sm:text-sm text-slate-300 font-medium uppercase tracking-widest">About this site</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              The story behind <span className="shimmer-blue">JourneyMate</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              JourneyMate started as a simple frustration: planning a trip across India usually means juggling six tabs, three group chats and a half-trusted travel agent. We wanted one place that respected your time and your budget — and treated Indian travel as the rich, varied thing it actually is.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {ABOUT_STATS.map(({ value, label, icon: Icon, color, bg, border }) => (
              <div
                key={label}
                className={`glass rounded-2xl p-4 sm:p-5 border ${border} flex flex-col items-start gap-2`}
              >
                <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                  <Icon size={16} className={color} />
                </div>
                <div className={`font-display font-bold text-2xl sm:text-3xl ${color} leading-none`}>{value}</div>
                <div className="text-slate-400 text-xs sm:text-sm leading-snug">{label}</div>
              </div>
            ))}
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {ABOUT_PILLARS.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div
                key={title}
                className={`glass rounded-2xl p-5 sm:p-6 border ${border} flex flex-col`}
              >
                <div className={`w-11 h-11 rounded-2xl ${bg} border ${border} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What's in each plan */}
        <div className="mb-20 sm:mb-28">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white text-center mb-12">
            What's in each plan?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Silver */}
            <div className="glass-silver rounded-3xl p-6 sm:p-8 border border-green-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl">💰</div>
                <div>
                  <div className="font-display font-bold text-xl text-white">Silver Plan</div>
                  <div className="text-green-400 text-xs font-semibold uppercase tracking-wider">Smart Budget</div>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  { icon: Train, label: 'Train (AC 3-tier / Sleeper)' },
                  { icon: Hotel, label: 'Hostel / Budget Guesthouse' },
                  { icon: MapPin, label: 'Street food & local dhabas' },
                  { icon: CheckCircle, label: 'Full day-by-day itinerary' },
                  { icon: CheckCircle, label: 'Perks: WiFi, maps, local tips' },
                  { icon: CheckCircle, label: 'Free cancellation booking' },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-slate-300">
                    <Icon size={16} className="text-green-400 shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gold */}
            <div className="glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">👑</div>
                <div>
                  <div className="font-display font-bold text-xl text-white">Gold Plan</div>
                  <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Premium Luxury</div>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  { icon: Plane, label: 'Direct flight (priority boarding)' },
                  { icon: Hotel, label: 'Heritage / 4-5 star hotel' },
                  { icon: MapPin, label: 'Fine dining & curated experiences' },
                  { icon: CheckCircle, label: 'Private airport transfers' },
                  { icon: CheckCircle, label: 'Concierge + spa access' },
                  { icon: CheckCircle, label: 'Expert-guided premium experiences' },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-slate-300">
                    <Icon size={16} className="text-amber-400 shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Roadmap — What's coming next */}
        <section className="mb-20 sm:mb-28">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 mb-5">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-xs sm:text-sm text-slate-300 font-medium uppercase tracking-widest">The road ahead</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              What's coming <span className="shimmer-blue">next</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              JourneyMate ships in tight, visible cycles. Here is what is currently in build, what comes after that, and the bigger ideas we are still exploring.
            </p>
          </div>

          <div className="space-y-10 sm:space-y-14">
            {ROADMAP.map((tier) => (
              <div key={tier.horizon}>
                {/* Horizon header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="font-display font-bold text-2xl sm:text-3xl text-white">{tier.horizon}</div>
                  <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border ${tier.badgeBorder} ${tier.badgeBg} ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tier.items.map(({ icon: Icon, title, desc }) => (
                    <div
                      key={title}
                      className="glass rounded-2xl p-5 border border-white/8 hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl ${tier.badgeBg} border ${tier.badgeBorder} flex items-center justify-center shrink-0`}>
                          <Icon size={18} className={tier.badgeColor} />
                        </div>
                        <h3 className="font-display font-bold text-base text-white leading-tight">{title}</h3>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-12 sm:mt-14 glass rounded-3xl p-6 sm:p-8 border border-indigo-500/20 text-center">
            <p className="text-slate-300 text-sm sm:text-base mb-4 max-w-xl mx-auto">
              Got a feature you wish JourneyMate had? Tell us — early ideas often jump straight into the "Now" tier.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors"
            >
              Send us a request
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="glass rounded-2xl border border-indigo-500/15 group"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer text-white font-semibold text-sm sm:text-base select-none list-none">
                  {faq.q}
                  <ArrowRight size={16} className="shrink-0 text-indigo-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/6 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
