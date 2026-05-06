# Frontend architecture & migration guide

This document describes the SOLID + OOP structure the frontend now
follows and the recipe for converting any remaining page to it.

## Layer cake

```
   pages/                  ← thin orchestrators (composition only)
     ↓
   components/<feature>/   ← feature sections (Timeline, PricingPlanCard, …)
     ↓
   components/layout/      ← layout primitives (PageContainer, SectionShell)
     ↓
   components/ui/          ← design-system primitives (Button, Card, Eyebrow, …)
     ↓
   data/, hooks/           ← editorial content + reusable behaviors
```

A page should ideally read top-to-bottom as a list of named sections,
each pulling its data from `data/` and its UI from `ui/` or a feature
folder.

## The primitives

| Primitive       | Purpose                                                | File                              |
| --------------- | ------------------------------------------------------ | --------------------------------- |
| `Button`        | Polymorphic action surface (`<button>`, `<a>`, `Link`) | `components/ui/Button.jsx`        |
| `Card`          | Glass / flat / tinted / raised surface                 | `components/ui/Card.jsx`          |
| `Heading`       | Title typography (sm → display)                        | `components/ui/Heading.jsx`       |
| `Eyebrow`       | Uppercase category chip above a heading                | `components/ui/Eyebrow.jsx`       |
| `Pill`          | Inline status / badge chip                             | `components/ui/Pill.jsx`          |
| `BackLink`      | "← Back to JourneyMate" pill                           | `components/ui/BackLink.jsx`      |
| `Stack` / `Row` | Flex-column / flex-row helpers                         | `components/ui/Stack.jsx`         |
| `PageContainer` | Responsive max-width + gutter                          | `components/layout/PageContainer.jsx` |
| `SectionShell`  | Vertical rhythm + landmark semantics                   | `components/layout/SectionShell.jsx`  |

All primitives are barreled at `components/ui/index.js`. Import via:

```jsx
import { Button, Card, Eyebrow, Heading, Pill, Stack, Row, BackLink } from '../components/ui'
```

## SOLID applied

- **S — Single Responsibility**: every file owns one concern. Pages
  orchestrate, sections render, primitives style, hooks behave, data
  describes.
- **O — Open/Closed**: extend a card/button/eyebrow by adding a key
  to its dictionary (`VARIANTS`, `ACCENTS`, `SIZES`); existing call
  sites keep working.
- **L — Liskov Substitution**: every variant of every primitive
  accepts the same prop surface, so swapping `variant="glass"` for
  `variant="tinted"` never breaks layout.
- **I — Interface Segregation**: prop surfaces are small and
  orthogonal — no kitchen-sink bag.
- **D — Dependency Inversion**: pages depend on the primitives'
  abstractions, not on raw Tailwind chains.

## Recipe — converting a legacy page

Before:

```jsx
<div className="min-h-[100dvh] page-bg-blue pt-20 sm:pt-24 pb-16 px-4 sm:px-6">
  <div className="max-w-3xl mx-auto">
    <Link to="/" className="inline-flex …">← Back</Link>

    <div className="glass rounded-3xl p-6 sm:p-10 border border-blue-500/15">
      <h2 className="font-display font-bold text-xl sm:text-2xl text-white mb-4 …">…</h2>
      <p>…</p>
    </div>
  </div>
</div>
```

After:

```jsx
import PageContainer from '../components/layout/PageContainer'
import { BackLink, Card, Heading } from '../components/ui'

export default function MyPage() {
  return (
    <main className="min-h-[100dvh] page-bg-blue pt-20 sm:pt-24 pb-16">
      <PageContainer size="narrow">
        <BackLink />
        <Card variant="glass" padding="lg">
          <Heading level={2} size="md">…</Heading>
          <p>…</p>
        </Card>
      </PageContainer>
    </main>
  )
}
```

## Recipe — extracting a long page

When a page exceeds ~250 lines:

1. Identify the **sections** the page renders (hero, grid, FAQ, etc.).
2. For each section, create `components/<feature>/<Section>.jsx`.
3. Move all static text/lists into `data/<feature>Content.js` as
   frozen objects/arrays with stable `id` fields.
4. If two pages share a chrome (header/footer/icon), extract a
   `<FeaturePageLayout>` template (see
   `components/legal/LegalPageLayout.jsx`).
5. Reduce the page to a composition file under ~150 lines.

## Recipe — adding a new page

1. Drop the route in `App.jsx`.
2. Create `pages/MyPage.jsx`.
3. Wrap the content in `<PageContainer>` and `<SectionShell>`.
4. Use `<Heading>`, `<Eyebrow>`, `<Card>`, `<Button>`, `<Pill>`,
   `<Stack>` for everything visual.
5. Put any list/copy data in `data/myPageContent.js`.

## Pages currently on the new architecture

| Page                    | Depth        | Notes                                                                                                |
| ----------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `AboutOwner.jsx`        | full split   | composes `components/about/*` + `data/aboutContent.js` + `hooks/aboutHooks.js`                       |
| `Terms.jsx`             | template     | uses `LegalPageLayout` + `data/legalContent.js`                                                      |
| `PrivacyPolicy.jsx`     | template     | uses `LegalPageLayout` + `data/legalContent.js`                                                      |
| `Pricing.jsx`           | full split   | composes `PricingPlanCard` + `FaqAccordion` + `data/pricingContent.js`                               |
| `SharedTrip.jsx`        | full split   | composes `Card`, `Button`, `PageContainer`; loading + error split into private subcomponents         |
| `AdminAgent.jsx`        | full split   | `Heading`, `Pill`, `Card`, `Button`; chat empty state + admin guard extracted to private components  |
| `PopularRoutes.jsx`     | full split   | composes `RouteCard` (`components/popularRoutes/`) + `data/popularRoutesContent.js`                  |
| `BlogPost.jsx`          | full split   | private subcomponents (`AuthorTagStrip`, `ShareCta`, `RelatedPosts`, `BlogPostSkeleton`)             |
| `ContactUs.jsx`         | full split   | composes `Card`, `Button`, `BackLink`, `Eyebrow`, `Heading`; form helpers (`FormField`, `Submitted`) |
| `Blog.jsx`              | surface pass | error banner, share-CTAs, empty state, secondary buttons swapped to primitives                       |
| `SavedTrips.jsx`        | surface pass | hero pills, error banner, empty-state CTA swapped to primitives                                      |
| `HowItWorks.jsx`        | surface pass | hero pills, final CTA buttons + headings swapped to primitives                                       |
| `LiveBookingAgent.jsx`  | surface pass | already had a strong internal helper layer — only the live-status pill was migrated                  |

## Migration depth — what the labels mean

- **template** — page is a thin wrapper around a `<*PageLayout>` template + a frozen content object. ~30 LOC.
- **full split** — page is an orchestrator only; sections live under `components/<feature>/`, content under `data/<feature>Content.js`, behavior under `hooks/`.
- **surface pass** — primitive replacements applied at high-traffic points (hero pills, error banners, primary CTAs, empty states) while leaving stable internal markup intact. Used for pages with their own mature internal helpers (e.g. `LiveBookingAgent` with `PrimaryButton` + `inputClass`) where a deeper rewrite would risk regressions for marginal gain.

## Recipe — picking a depth for a future migration

1. If the page has more than one near-duplicate sibling (legal docs, blog detail, …), build a `*PageLayout` and convert it to a **template**.
2. If the page has clear, isolated sections (timeline, grid, hero) that could plausibly be reused, do a **full split**.
3. If the page is unique, has its own well-developed internal helpers, and a rewrite would touch hundreds of lines just to match the design system label, do a **surface pass** instead. Cohesion is more valuable than uniformity.
