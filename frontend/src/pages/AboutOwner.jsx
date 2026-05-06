import React, { useMemo } from 'react'

import PageContainer from '../components/layout/PageContainer'
import SectionShell from '../components/layout/SectionShell'

import {
  Aurora,
  BackLink,
  ConnectGrid,
  FinalCta,
  HeroIntro,
  MotivationGrid,
  PhilosophyGrid,
  PortraitCard,
  Timeline,
} from '../components/about'

import {
  HEADLINE_STATS,
  MOTIVATIONS,
  PHILOSOPHY,
  PROFILE,
  SOCIALS,
  STORY,
} from '../data/aboutContent'

import { useExperienceYears } from '../hooks/aboutHooks'

/**
 * `AboutOwner` is the page-level *orchestrator*. It is intentionally
 * thin — every section is a self-contained component, every value
 * comes from the data layer, every animation comes from a hook.
 *
 *   page  →  layout primitives  →  section components  →  data + hooks
 *
 * SOLID notes
 *  - SRP: this file's only responsibility is composition + wiring
 *    runtime values (e.g. live experience years) into the data the
 *    sections need.
 *  - OCP: new About sections can be added by writing a new
 *    component + entry in `aboutContent.js`; this file only grows
 *    by one line.
 *  - LSP/ISP: every section accepts plain data props of well-defined
 *    shapes — they are interchangeable in their own grids.
 *  - DIP: the page depends on the abstractions exposed by
 *    `components/about/`, `data/aboutContent`, and `hooks/aboutHooks`,
 *    not on any concrete DOM logic.
 */
export default function AboutOwner() {
  const experienceYears = useExperienceYears(PROFILE.startedCodingISO)

  // Resolve any data fields that depend on live runtime values.
  // We do this once, here, so the section components stay
  // pure-data-in / DOM-out.
  const stats = useMemo(
    () =>
      HEADLINE_STATS.map((stat) =>
        stat.valueRef === 'experienceYears'
          ? { ...stat, value: experienceYears }
          : stat,
      ),
    [experienceYears],
  )

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <Aurora />

      <PageContainer
        size="default"
        className="pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20"
      >
        <BackLink />

        {/* ── Hero ─────────────────────────────────────────────── */}
        <SectionShell
          density="default"
          labelledBy="about-name"
          className="grid grid-cols-1 lg:grid-cols-[minmax(280px,420px)_1fr] xl:grid-cols-[minmax(300px,440px)_1fr] gap-10 sm:gap-12 lg:gap-14 xl:gap-16 items-center"
        >
          <PortraitCard
            src={PROFILE.portraitSrc}
            alt={PROFILE.portraitAlt}
            location={PROFILE.location.split(',')[0]}
            frameNo="01 / 26"
            openToOpportunities
          />
          <HeroIntro
            name={PROFILE.name}
            email={PROFILE.email}
            bioJourney="Agartala → Hyderabad → wherever the next trip takes me"
            stats={stats}
          />
        </SectionShell>

        <SectionShell labelledBy="about-journey">
          <Timeline items={STORY} />
        </SectionShell>

        <SectionShell labelledBy="about-why">
          <MotivationGrid items={MOTIVATIONS} />
        </SectionShell>

        <SectionShell labelledBy="about-philosophy">
          <PhilosophyGrid items={PHILOSOPHY} />
        </SectionShell>

        <SectionShell density="cozy" labelledBy="about-connect">
          <ConnectGrid
            socials={SOCIALS}
            location={`${PROFILE.location.split(',')[1]?.trim() || PROFILE.location} 🇮🇳`}
            phone={PROFILE.phone}
          />
        </SectionShell>

        <FinalCta />
      </PageContainer>
    </main>
  )
}
