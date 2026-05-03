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
  Workflow,
  Layers,
  Rocket,
  HelpCircle,
  Crown,
  Wallet,
} from 'lucide-react'
import PageHero from '../components/PageHero'
import SectionHeader from '../components/SectionHeader'

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
    <div className="min-h-[100dvh] page-bg-blue">
      <PageHero
        image="/photos/hero-monastery.png"
        imagePos="center 30%"
        accent="purple"
        size="compact"
        eyebrow="Simple. Fast. Transparent."
        eyebrowIcon={<Sparkles size={14} className="text-purple-300" />}
        title="How JourneyMate"
        highlight="Works"
        subtitle="From a single search to a full Silver vs Gold itinerary in under three seconds — and a clear picture of where the product is heading next."
      >
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-cyan-200">
            <MapPin size={12} className="text-cyan-300" />
            300+ cities
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-emerald-200">
            <Compass size={12} className="text-emerald-300" />
            600+ routes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-amber-200">
            <Zap size={12} className="text-amber-300" />
            ~3s to compare
          </span>
        </div>
      </PageHero>

      <div className="max-w-5xl 2xl:max-w-6xl 3xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 pb-16 sm:pb-20 pt-8 sm:pt-10">

        {/* Steps */}
        <SectionHeader
          icon={<Workflow size={16} strokeWidth={2.4} />}
          accent="violet"
          eyebrow="Four steps end-to-end"
          title="From idea to itinerary"
          subtitle="No spreadsheets, no juggling tabs. Each step takes seconds — the whole flow takes under a minute."
          divider
          className="!mb-8"
        />

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
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 animate-slide-up ${isRight ? 'sm:flex-row-reverse' : ''}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Card */}
                  <div className={`group relative flex-1 glass rounded-3xl p-6 sm:p-8 border ${s.border} hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                    {/* Soft accent glow on hover */}
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full ${s.bg} blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
                    />
                    <div className="relative">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                          <Icon size={22} className={s.color} />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${s.color} mb-1`}>Step {s.step}</div>
                          <h3
                            className="font-bold text-lg sm:text-xl text-white tracking-tight"
                            style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}
                          >
                            {s.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-3">{s.desc}</p>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed border-t border-white/6 pt-3">{s.detail}</p>
                    </div>
                  </div>

                  {/* Step number circle */}
                  <div className="hidden sm:flex w-16 shrink-0 items-center justify-center">
                    <div className={`w-14 h-14 rounded-full glass ${s.bg} border-2 ${s.border} flex items-center justify-center font-display font-bold text-sm ${s.color} shadow-lg shadow-black/30 z-10 ring-4 ring-slate-950/60`}>
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
          <SectionHeader
            icon={<Compass size={16} strokeWidth={2.4} />}
            accent="cyan"
            eyebrow="About this site"
            title="The story behind JourneyMate"
            subtitle="JourneyMate started as a simple frustration: planning a trip across India usually means juggling six tabs, three group chats and a half-trusted travel agent. We wanted one place that respected your time and your budget — and treated Indian travel as the rich, varied thing it actually is."
            divider
            className="!mb-8"
          />

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {ABOUT_STATS.map(({ value, label, icon: Icon, color, bg, border }, idx) => (
              <div
                key={label}
                className={`group glass rounded-2xl p-4 sm:p-5 border ${border} flex flex-col items-start gap-2 hover:-translate-y-0.5 hover:border-white/25 transition-all duration-300 animate-slide-up`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={17} className={color} />
                </div>
                <div className={`font-display font-bold text-2xl sm:text-3xl ${color} leading-none tabular-nums`}>{value}</div>
                <div className="text-slate-400 text-xs sm:text-sm leading-snug">{label}</div>
              </div>
            ))}
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {ABOUT_PILLARS.map(({ icon: Icon, title, desc, color, bg, border }, idx) => (
              <div
                key={title}
                className={`group relative glass rounded-2xl p-5 sm:p-6 border ${border} flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 overflow-hidden animate-slide-up`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full ${bg} blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500`}
                />
                <div className="relative">
                  <div className={`w-11 h-11 rounded-2xl ${bg} border ${border} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                    <Icon size={20} className={color} />
                  </div>
                  <h3
                    className="font-bold text-base sm:text-lg text-white mb-2 tracking-tight"
                    style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}
                  >
                    {title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What's in each plan */}
        <div className="mb-20 sm:mb-28">
          <SectionHeader
            icon={<Layers size={16} strokeWidth={2.4} />}
            accent="amber"
            eyebrow="Side by side"
            title="What's in each plan?"
            subtitle="Same itinerary length, two different price tiers. Pick the one that matches the trip you actually want."
            divider
            className="!mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Silver */}
            <div className="group relative glass-silver rounded-3xl p-6 sm:p-8 border border-green-500/20 hover:border-green-400/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-emerald-500/15 blur-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-500"
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 ring-1 ring-white/15 flex items-center justify-center">
                    <Wallet size={20} className="text-white" />
                  </div>
                  <div>
                    <div
                      className="font-bold text-xl text-white tracking-tight"
                      style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}
                    >
                      Silver Plan
                    </div>
                    <div className="text-emerald-300/90 text-[10px] font-bold uppercase tracking-[0.16em]">Smart Budget</div>
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
                      <Icon size={16} className="text-emerald-400 shrink-0" />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gold */}
            <div className="group relative glass-gold rounded-3xl p-6 sm:p-8 border border-amber-500/20 hover:border-amber-400/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-amber-500/15 blur-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-500"
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 ring-1 ring-white/15 flex items-center justify-center">
                    <Crown size={20} className="text-white" />
                  </div>
                  <div>
                    <div
                      className="font-bold text-xl text-white tracking-tight"
                      style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}
                    >
                      Gold Plan
                    </div>
                    <div className="text-amber-300/90 text-[10px] font-bold uppercase tracking-[0.16em]">Premium Luxury</div>
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
        </div>

        {/* Roadmap — What's coming next */}
        <section className="mb-20 sm:mb-28">
          <SectionHeader
            icon={<Rocket size={16} strokeWidth={2.4} />}
            accent="purple"
            eyebrow="The road ahead"
            title="What's coming next"
            subtitle="JourneyMate ships in tight, visible cycles. Here is what is currently in build, what comes after that, and the bigger ideas we are still exploring."
            divider
            className="!mb-8"
          />

          <div className="space-y-10 sm:space-y-14">
            {ROADMAP.map((tier, tierIdx) => (
              <div key={tier.horizon}>
                {/* Horizon header */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="font-bold text-2xl sm:text-3xl text-white tracking-tight"
                    style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}
                  >
                    {tier.horizon}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border ${tier.badgeBorder} ${tier.badgeBg} ${tier.badgeColor}`}>
                    {tierIdx === 0 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />}
                    {tier.badge}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/15 via-white/8 to-transparent" />
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tier.items.map(({ icon: Icon, title, desc }, idx) => (
                    <div
                      key={title}
                      className="group relative glass rounded-2xl p-5 border border-white/8 hover:border-white/25 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden animate-slide-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div
                        aria-hidden
                        className={`pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full ${tier.badgeBg} blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500`}
                      />
                      <div className="relative flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl ${tier.badgeBg} border ${tier.badgeBorder} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                            <Icon size={18} className={tier.badgeColor} />
                          </div>
                          <h3
                            className="font-bold text-base text-white leading-tight tracking-tight"
                            style={{ fontFamily: 'Clash Display, Syne, sans-serif' }}
                          >
                            {title}
                          </h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="relative mt-12 sm:mt-14 glass rounded-3xl p-6 sm:p-8 border border-purple-400/20 text-center overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-40 blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.30) 0%, transparent 70%)' }}
            />
            <div className="relative">
              <p className="text-slate-300 text-sm sm:text-base mb-5 max-w-xl mx-auto leading-relaxed">
                Got a feature you wish JourneyMate had? Tell us — early ideas often jump straight into the <span className="text-emerald-300 font-semibold">"Now"</span> tier.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white text-sm font-bold shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5"
              >
                <Sparkles size={14} />
                Send us a request
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <div>
          <SectionHeader
            icon={<HelpCircle size={16} strokeWidth={2.4} />}
            accent="sky"
            eyebrow="Quick answers"
            title="Frequently asked questions"
            subtitle="Anything we forgot? Drop us a line on the About page — we keep this list living."
            divider
            className="!mb-8"
          />
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={faq.q}
                className="group glass rounded-2xl border border-white/8 hover:border-sky-400/30 transition-colors overflow-hidden animate-slide-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <summary className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 cursor-pointer select-none list-none">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid place-items-center h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/30 ring-1 ring-white/15 text-[11px] font-bold tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-white font-semibold text-sm sm:text-base leading-snug">
                      {faq.q}
                    </span>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-sky-300 group-open:rotate-90 transition-transform duration-300" />
                </summary>
                <div className="px-5 sm:px-6 pb-5 pt-1 text-slate-400 text-sm leading-relaxed border-t border-white/6 ml-10 sm:ml-12">
                  <p className="pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
