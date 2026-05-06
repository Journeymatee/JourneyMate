import React from 'react'
import PageContainer from '../layout/PageContainer'
import { BackLink, Card, Heading } from '../ui'

/**
 * `LegalPageLayout` is a Template-Method-style component for legal
 * documents (Terms, Privacy Policy, etc). The shared chrome lives
 * here:
 *
 *   page background  →  back link  →  icon + title  →  glass card
 *   →  rendered sections (delegated to the caller)
 *
 * The caller supplies only the *content*: the icon, the gradient
 * accent, the title parts, the last-updated date, and the array of
 * `{ title, body }` sections.
 *
 * SOLID notes
 *  - SRP: this owns the legal-page chrome only; document content is
 *    fully owned by the caller.
 *  - OCP: adding a new legal page (e.g. Cookies, Refunds) means
 *    creating a one-line page that hands its data array in here.
 *  - DIP: the page depends on the abstract `sections` shape, not
 *    on any specific content.
 */

const ACCENTS = Object.freeze({
  blue: {
    pageBg:    'page-bg-blue',
    iconBg:    'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-400',
    cardEdge:  'border-blue-500/15',
    sectionEdge: 'border-blue-500/20',
    shimmer:   'shimmer-blue',
  },
  teal: {
    pageBg:    'page-bg-teal',
    iconBg:    'bg-teal-500/10 border-teal-500/20',
    iconColor: 'text-teal-400',
    cardEdge:  'border-teal-500/15',
    sectionEdge: 'border-teal-500/20',
    shimmer:   'shimmer-teal',
  },
  amber: {
    pageBg:    'page-bg-amber',
    iconBg:    'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    cardEdge:  'border-amber-500/15',
    sectionEdge: 'border-amber-500/20',
    shimmer:   'shimmer-amber',
  },
  emerald: {
    pageBg:    'page-bg-emerald',
    iconBg:    'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    cardEdge:  'border-emerald-500/15',
    sectionEdge: 'border-emerald-500/20',
    shimmer:   'shimmer-emerald',
  },
})

export default function LegalPageLayout({
  accent = 'blue',
  icon,
  titleLead,
  titleAccent,
  titleTrail = '',
  lastUpdated,
  sections,
}) {
  const theme = ACCENTS[accent] || ACCENTS.blue
  const Icon = icon

  return (
    <main className={`min-h-[100dvh] ${theme.pageBg} pt-20 sm:pt-24 pb-16 sm:pb-20`}>
      <PageContainer size="narrow">
        <BackLink />

        <header className="flex items-start gap-4 mb-10">
          {Icon && (
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 mt-1 ${theme.iconBg}`}
            >
              <Icon size={22} className={theme.iconColor} aria-hidden />
            </div>
          )}
          <div>
            <Heading level={1} size="lg" className="!font-bold mb-2">
              {titleLead}
              {titleAccent && (
                <span className={theme.shimmer}>{titleAccent}</span>
              )}
              {titleTrail}
            </Heading>
            {lastUpdated && (
              <p className="text-slate-500 text-sm">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
        </header>

        <Card variant="glass" padding="lg" className={`!border ${theme.cardEdge}`}>
          {sections.map((section, i) => (
            <LegalSection
              key={section.title || i}
              section={section}
              edgeClass={theme.sectionEdge}
              index={i}
            />
          ))}
        </Card>
      </PageContainer>
    </main>
  )
}

/**
 * Single legal-document section with a numbered title and body.
 * Body can be a render function (richer markup) or a plain array
 * of strings (kept for ergonomic data tables in `legalContent.js`).
 */
function LegalSection({ section, edgeClass, index }) {
  const isLast = section.isLast
  return (
    <div className={isLast ? '' : 'mb-10'}>
      <h2
        className={`font-display font-bold text-xl sm:text-2xl text-white mb-4 pb-2 border-b ${edgeClass}`}
      >
        {section.number ? `${section.number}. ` : `${index + 1}. `}
        {section.title}
      </h2>
      <div className="text-slate-400 text-sm sm:text-base leading-relaxed space-y-3">
        {typeof section.body === 'function' ? section.body() : section.body}
      </div>
    </div>
  )
}
