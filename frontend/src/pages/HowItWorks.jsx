import React from 'react'
import { Search, BarChart3, CreditCard, CheckCircle, ArrowRight, Sparkles, Train, Plane, Hotel, MapPin } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Enter Your Route',
    desc: 'Type your origin and destination city from our database of 300+ Indian cities. Use the autocomplete powered by OpenStreetMap.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    detail: 'We support every major Indian city — from metros to hill stations, pilgrimage towns to beach destinations.',
  },
  {
    step: '02',
    icon: BarChart3,
    title: 'We Compare Instantly',
    desc: 'Our system generates two complete travel packages — Silver (budget-smart) and Gold (luxury) — with transport, stay, dining, and a day-by-day itinerary.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    detail: 'Plans are built from real-world pricing for trains, buses, flights, hostels, guesthouses, and luxury hotels.',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Explore on the Map',
    desc: 'See your route visualised on an interactive map. Each day of your itinerary shows a location pin so you know exactly where you will be.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    detail: 'Maps are powered by OpenStreetMap and Google Maps, giving you a real feel for distances and geography.',
  },
  {
    step: '04',
    icon: CreditCard,
    title: 'Pick & Book',
    desc: 'Choose the plan that fits your budget and travel style. Book Silver for smart savings or Gold for curated luxury experiences.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    detail: 'Silver plans save you an average of ₹12,500 versus Gold. That is enough for another short trip!',
  },
]

const FAQS = [
  { q: 'Is JourneyMate free to use?', a: 'Yes — comparing Silver vs Gold plans is completely free. We only charge if you book through us directly, and even then you always see the price upfront.' },
  { q: 'How accurate are the prices?', a: 'Prices are indicative and based on current market averages. Actual prices vary by season, availability, and booking lead time. We update our data frequently.' },
  { q: 'Can I use this for international trips?', a: 'Currently JourneyMate focuses on Indian domestic travel across 200+ routes. International destination support is on our roadmap for 2026.' },
  { q: 'What is the difference between Silver and Gold?', a: 'Silver is optimised for value — trains, guesthouses, local street food. Gold is curated luxury — flights, heritage hotels, fine dining, private transfers, and concierge.' },
  { q: 'Can I customise the itinerary?', a: 'Right now the itinerary is auto-generated. Custom itinerary editing is coming soon — stay tuned.' },
]

export default function HowItWorks() {
  return (
    <div className="min-h-[100dvh] mesh-bg pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-6">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-sm text-slate-400 font-medium">Simple. Fast. Transparent.</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            How JourneyMate<br />
            <span className="shimmer-silver">Works</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From a search to a full itinerary comparison in under 3 seconds. Here is how we do it.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mb-20 sm:mb-28">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-green-500/40 via-purple-500/20 to-amber-500/40 hidden sm:block -translate-x-1/2" />

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

        {/* FAQ */}
        <div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="glass rounded-2xl border border-white/8 group"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer text-white font-semibold text-sm sm:text-base select-none list-none">
                  {faq.q}
                  <ArrowRight size={16} className="shrink-0 text-slate-500 group-open:rotate-90 transition-transform" />
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
