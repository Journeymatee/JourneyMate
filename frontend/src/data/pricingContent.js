/**
 * Source of truth for the pricing page.
 *
 * Keeping plans in a frozen array means changing copy/feature lists
 * never requires touching component code. Every plan is a Plain Old
 * Data Object — small, predictable, easy to test or A/B by swapping
 * arrays.
 */

import { Crown, Zap } from 'lucide-react'

export const PRICING_PLANS = Object.freeze([
  {
    id: 'free',
    name: 'Explorer',
    price: '\u20B90',
    period: 'forever',
    desc:
      'Perfect for occasional travelers who want to compare options before committing.',
    badge: null,
    icon: Zap,
    accent: 'slate',
    cta: 'Get Started Free',
    ctaVariant: 'secondary',
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
    price: '\u20B9299',
    period: 'per month',
    desc:
      'For frequent travelers who plan multiple trips and want full access to all features.',
    badge: 'Most Popular',
    badgeAccent: 'emerald',
    icon: Crown,
    accent: 'emerald',
    highlight: true,
    cta: 'Start 7-Day Free Trial',
    ctaVariant: 'primary',
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
    price: '\u20B9799',
    period: 'per month',
    desc:
      'Built for families and groups who need shared planning and bulk comparison tools.',
    badge: 'Best Value',
    badgeAccent: 'amber',
    icon: Crown,
    accent: 'amber',
    cta: 'Contact Sales',
    ctaVariant: 'primary',
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
])

export const PRICING_FAQ = Object.freeze([
  {
    id: 'trial',
    q: 'Is there a free trial for paid plans?',
    a: 'Yes — Traveler Pro includes a 7-day free trial. No credit card required to start.',
  },
  {
    id: 'cancel',
    q: 'Can I cancel anytime?',
    a: 'Absolutely. You can cancel your subscription at any time with no cancellation fee. You retain access until the end of your billing period.',
  },
  {
    id: 'payments',
    q: 'What payment methods are accepted?',
    a: 'We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), and net banking through our payment processor.',
  },
  {
    id: 'gst',
    q: 'Do prices include GST?',
    a: 'All prices shown are exclusive of applicable GST (18%). GST will be added at checkout.',
  },
  {
    id: 'switch',
    q: 'Can I switch plans?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect from the next billing cycle.',
  },
])

/**
 * Map of accent → icon styling used by `PricingPlanCard`.
 * Keeping this here rather than in the component keeps every visual
 * decision for the pricing page in a single editable place.
 */
export const PRICING_ACCENT_STYLES = Object.freeze({
  slate:   { iconBg: 'bg-slate-500/10',   iconColor: 'text-slate-400',   priceColor: 'text-slate-300', border: 'border-white/12' },
  emerald: { iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400', priceColor: 'text-emerald-300', border: 'border-emerald-500/30' },
  amber:   { iconBg: 'bg-amber-500/10',   iconColor: 'text-amber-400',   priceColor: 'text-amber-300', border: 'border-amber-500/30' },
})
