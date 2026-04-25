import React, { useState } from 'react'
import { Check, Zap, Crown, ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const PLANS = [
  {
    id: 'free',
    name: 'Explorer',
    price: '₹0',
    period: 'forever',
    desc: 'Perfect for occasional travelers who want to compare options before committing.',
    color: 'text-slate-300',
    border: 'border-white/12',
    badge: null,
    icon: Zap,
    iconBg: 'bg-slate-500/10',
    iconColor: 'text-slate-400',
    cta: 'Get Started Free',
    ctaStyle: 'bg-white/8 hover:bg-white/12 border border-white/10 text-white',
    features: [
      '5 route comparisons per day',
      'Silver vs Gold comparison',
      'Day-by-day itinerary view',
      'Interactive maps',
      'City search (600+ cities)',
      'Basic route details',
    ],
    unavailable: [
      'Unlimited comparisons',
      'Save & export itineraries',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Traveler Pro',
    price: '₹299',
    period: 'per month',
    desc: 'For frequent travelers who plan multiple trips and want full access to all features.',
    color: 'text-green-400',
    border: 'border-green-500/30',
    badge: 'Most Popular',
    icon: Crown,
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
    cta: 'Start 7-Day Free Trial',
    ctaStyle: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25',
    features: [
      'Unlimited route comparisons',
      'Silver vs Gold comparison',
      'Day-by-day itinerary view',
      'Interactive maps with directions',
      'City search (600+ cities)',
      'Save & export itineraries (PDF)',
      'Booking links & price alerts',
      'Priority email support',
      'Early access to new routes',
    ],
    unavailable: [],
  },
  {
    id: 'team',
    name: 'Group Travel',
    price: '₹799',
    period: 'per month',
    desc: 'Built for families and groups who need shared planning and bulk comparison tools.',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'Best Value',
    icon: Crown,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    cta: 'Contact Sales',
    ctaStyle: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25',
    features: [
      'Everything in Traveler Pro',
      'Up to 8 traveler profiles',
      'Group itinerary builder',
      'Split cost calculator',
      'Shared saved routes',
      'Custom route requests',
      'Dedicated account manager',
      'Phone support',
    ],
    unavailable: [],
  },
]

const FAQ = [
  { q: 'Is there a free trial for paid plans?', a: 'Yes — Traveler Pro includes a 7-day free trial. No credit card required to start.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. You can cancel your subscription at any time with no cancellation fee. You retain access until the end of your billing period.' },
  { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), and net banking through our payment processor.' },
  { q: 'Do prices include GST?', a: 'All prices shown are exclusive of applicable GST (18%). GST will be added at checkout.' },
  { q: 'Can I switch plans?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect from the next billing cycle.' },
]

export default function Pricing() {
  const [faqOpen, setFaqOpen] = useState(null)
  const navigate = useNavigate()

  return (
    <div className="min-h-[100dvh] page-bg-amber pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to JourneyMate
        </Link>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/30 mb-6">
            <Crown size={14} className="text-amber-400" />
            <span className="text-sm text-slate-300 font-medium">Simple, transparent pricing</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            Plans for every<br />
            <span className="shimmer-amber">kind of traveler</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Start free and upgrade when you're ready. No surprise fees, no hidden charges.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.id}
                className={`relative glass rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 border ${plan.border} flex flex-col ${plan.id === 'pro' ? 'sm:col-span-2 lg:col-span-1 lg:-translate-y-2 lg:scale-[1.02] shadow-xl shadow-green-500/10' : ''}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    plan.id === 'pro'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                    <Icon size={18} className={plan.iconColor} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-white text-lg">{plan.name}</div>
                  </div>
                </div>

                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{plan.desc}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className={`font-display font-bold text-4xl sm:text-5xl ${plan.color} tabular-nums`}>
                    {plan.price}
                  </div>
                  <div className="text-slate-500 text-sm mt-1">{plan.period}</div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 mb-6 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check size={15} className={`${plan.iconColor} shrink-0 mt-0.5`} />
                      {f}
                    </li>
                  ))}
                  {plan.unavailable.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 line-through">
                      <span className="w-3.5 h-3.5 shrink-0 mt-0.5 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-slate-700 block" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="glass rounded-2xl border border-amber-500/15 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 text-white font-medium text-sm sm:text-base hover:bg-white/4 transition-colors"
                >
                  <span>{item.q}</span>
                  <ArrowRight
                    size={16}
                    className={`shrink-0 text-amber-500/60 transition-transform duration-200 ${faqOpen === i ? 'rotate-90' : ''}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${faqOpen === i ? 'max-h-40' : 'max-h-0'}`}>
                  <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
