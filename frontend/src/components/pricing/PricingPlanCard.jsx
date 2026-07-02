import React from 'react'
import { Check } from 'lucide-react'
import { Button, Card, Pill } from '../ui'
import { PRICING_ACCENT_STYLES } from '../../data/pricingContent'

/**
 * `PricingPlanCard` renders a single plan tile. It is intentionally
 * pure data-in / DOM-out so the parent can render any number of
 * plans in any order (Open/Closed) and so plans can be tested in
 * isolation.
 *
 * The card composes the `<Card>` + `<Pill>` + `<Button>` design-
 * system primitives — no bespoke gradients or borders are defined
 * here. That's Dependency Inversion: the card depends on the
 * design-system abstractions, not on raw Tailwind chains.
 */
export default function PricingPlanCard({ plan, onCta }) {
  const Icon = plan.icon
  const accentStyle = PRICING_ACCENT_STYLES[plan.accent] || PRICING_ACCENT_STYLES.slate
  const isPrimary = plan.ctaVariant === 'primary'

  return (
    <Card
      variant="glass"
      padding="md"
      className={[
        'relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 flex flex-col',
        accentStyle.border ? `!${accentStyle.border}` : '',
        plan.highlight
          ? 'sm:col-span-2 lg:col-span-1 lg:-translate-y-2 lg:scale-[1.02] shadow-xl shadow-emerald-500/10'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {plan.badge && (
        <Pill
          accent={plan.badgeAccent || 'emerald'}
          variant="solid"
          size="md"
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold"
        >
          {plan.badge}
        </Pill>
      )}

      {/* Plan header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentStyle.iconBg}`}
        >
          <Icon size={18} className={accentStyle.iconColor} aria-hidden />
        </span>
        <span className="font-display font-bold text-white text-lg">
          {plan.name}
        </span>
      </div>

      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{plan.desc}</p>

      <div className="mb-6">
        <div
          className={`font-display font-bold text-4xl sm:text-5xl tabular-nums ${accentStyle.priceColor}`}
        >
          {plan.price}
        </div>
        <div className="text-slate-500 text-sm mt-1">{plan.period}</div>
      </div>

      <Button
        variant={isPrimary ? 'primary' : 'secondary'}
        accent={plan.accent === 'amber' ? 'amber' : 'emerald'}
        size="md"
        fullWidth
        className="!rounded-2xl !py-3 mb-6"
        onClick={() => onCta?.(plan)}
      >
        {plan.cta}
      </Button>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
            <Check size={15} className={`${accentStyle.iconColor} shrink-0 mt-0.5`} aria-hidden />
            {f}
          </li>
        ))}
        {plan.unavailable.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-sm text-slate-600 line-through"
          >
            <span className="w-3.5 h-3.5 shrink-0 mt-0.5 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-slate-700 block" aria-hidden />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </Card>
  )
}
