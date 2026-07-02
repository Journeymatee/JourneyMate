import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'

import PageContainer from '../components/layout/PageContainer'
import SectionShell from '../components/layout/SectionShell'
import { BackLink, Eyebrow, Heading } from '../components/ui'
import PricingPlanCard from '../components/pricing/PricingPlanCard'
import FaqAccordion from '../components/pricing/FaqAccordion'

import { PRICING_FAQ, PRICING_PLANS } from '../data/pricingContent'

/**
 * Pricing page — composition layer.
 *
 *   page → layout primitives → pricing-specific components → data
 *
 * SOLID notes
 *  - SRP: this file only orchestrates sections + handles navigation.
 *  - OCP: new plans / new FAQs are added in `pricingContent.js`;
 *    new visual treatments are added inside `PricingPlanCard`.
 *  - DIP: depends on the `Card`/`Button`/`Pill` primitives via the
 *    pricing components, never on raw Tailwind chains.
 */
export default function Pricing() {
  const navigate = useNavigate()

  return (
    <main className="min-h-[100dvh] page-bg-amber pt-20 sm:pt-24 pb-16 sm:pb-20">
      <PageContainer size="default">
        <BackLink />

        {/* Header */}
        <header className="text-center mb-12 sm:mb-14">
          <Eyebrow accent="amber" icon={<Crown size={12} />} className="mb-5">
            Simple, transparent pricing
          </Eyebrow>
          <Heading level={1} size="xl" accent="amber" accentText="kind of traveler" className="mb-4 leading-tight">
            Plans for every<br />
          </Heading>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Start free and upgrade when you&apos;re ready. No surprise fees, no
            hidden charges.
          </p>
        </header>

        {/* Pricing cards */}
        <SectionShell density="default">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {PRICING_PLANS.map((plan) => (
              <PricingPlanCard
                key={plan.id}
                plan={plan}
                onCta={() => navigate('/')}
              />
            ))}
          </div>
        </SectionShell>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto">
          <Heading level={2} size="md" className="text-center mb-8">
            Frequently Asked Questions
          </Heading>
          <FaqAccordion items={PRICING_FAQ} accent="amber" />
        </section>
      </PageContainer>
    </main>
  )
}
