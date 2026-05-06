/**
 * Source of truth for legal page content.
 *
 * Content is split into editable structures (`sections`, etc.) so
 * lawyers, founders, or future-you can update the wording without
 * touching any rendering code (Open/Closed). Bodies use a small JSX
 * render function so they can keep the existing `<ul>` markup
 * without leaking JSX into a `data/` import; the render fn keeps
 * each entry self-contained.
 */

import React from 'react'

/* ─── shared helpers ─────────────────────────────────────────────── */

const Bullets = ({ items }) => (
  <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)

const Email = ({ address, accent = 'text-indigo-400' }) => (
  <a href={`mailto:${address}`} className={`${accent} hover:underline`}>
    {address}
  </a>
)

/* ─── Terms of Service ───────────────────────────────────────────── */

export const TERMS_DOC = Object.freeze({
  accent: 'blue',
  titleLead: '',
  titleAccent: 'Terms',
  titleTrail: ' of Service',
  lastUpdated: 'April 18, 2026',
  sections: [
    {
      title: 'Acceptance of Terms',
      body: () => (
        <p>
          By accessing or using JourneyMate (&ldquo;the Service&rdquo;), you
          agree to be bound by these Terms of Service. If you do not agree to
          these terms, please do not use the Service.
        </p>
      ),
    },
    {
      title: 'Description of Service',
      body: () => (
        <>
          <p>
            JourneyMate is a travel comparison platform that helps users
            compare Silver (budget) and Gold (luxury) travel packages across
            Indian routes. The Service provides:
          </p>
          <Bullets
            items={[
              'Side-by-side travel package comparisons',
              'Day-by-day itinerary planning',
              'Interactive route maps',
              'City and route search across 600+ Indian destinations',
            ]}
          />
        </>
      ),
    },
    {
      title: 'User Accounts',
      body: () => (
        <>
          <p>
            To access certain features, you must create an account. You are
            responsible for:
          </p>
          <Bullets
            items={[
              'Maintaining the confidentiality of your password',
              'All activities that occur under your account',
              'Notifying us immediately of any unauthorised use',
            ]}
          />
          <p>You must be at least 18 years old to create an account.</p>
        </>
      ),
    },
    {
      title: 'Pricing & Availability',
      body: () => (
        <>
          <p>
            All prices shown on JourneyMate are{' '}
            <strong className="text-slate-300">
              indicative and subject to change
            </strong>
            . Actual prices depend on availability, season, booking lead time,
            and the specific operator. JourneyMate does not guarantee that
            prices displayed are the final prices you will pay when booking.
          </p>
          <p>
            We update our pricing data regularly but cannot guarantee real-time
            accuracy across all 600+ routes.
          </p>
        </>
      ),
    },
    {
      title: 'Prohibited Uses',
      body: () => (
        <>
          <p>You agree not to:</p>
          <Bullets
            items={[
              'Scrape, crawl, or otherwise extract data from the Service in bulk',
              'Use the Service for any unlawful purpose',
              'Attempt to gain unauthorised access to any part of the Service',
              'Create multiple accounts to circumvent rate limits or access restrictions',
              'Impersonate any person or entity',
            ]}
          />
        </>
      ),
    },
    {
      title: 'Intellectual Property',
      body: () => (
        <p>
          All content on JourneyMate &mdash; including text, graphics, logos,
          and software &mdash; is the property of JourneyMate and is protected
          by applicable intellectual property laws. You may not reproduce,
          distribute, or create derivative works without our express written
          permission.
        </p>
      ),
    },
    {
      title: 'Limitation of Liability',
      body: () => (
        <p>
          JourneyMate provides the Service on an &ldquo;as-is&rdquo; basis. To
          the maximum extent permitted by law, we are not liable for any
          indirect, incidental, special, or consequential damages arising from
          your use of or inability to use the Service, including but not
          limited to travel disruptions, booking errors, or loss of data.
        </p>
      ),
    },
    {
      title: 'Modifications to Terms',
      body: () => (
        <p>
          We reserve the right to modify these Terms at any time. Changes will
          be posted on this page with an updated date. Continued use of the
          Service after changes constitutes acceptance.
        </p>
      ),
    },
    {
      title: 'Governing Law',
      body: () => (
        <p>
          These Terms are governed by the laws of India. Any disputes shall be
          resolved in the courts of jurisdiction applicable to the registered
          address of JourneyMate.
        </p>
      ),
    },
    {
      title: 'Contact',
      isLast: true,
      body: () => (
        <p>
          For questions about these Terms, contact us at{' '}
          <Email address="harshvardhan1412002@gmail.com" />.
        </p>
      ),
    },
  ],
})

/* ─── Privacy Policy ─────────────────────────────────────────────── */

export const PRIVACY_DOC = Object.freeze({
  accent: 'teal',
  titleLead: '',
  titleAccent: 'Privacy',
  titleTrail: ' Policy',
  lastUpdated: 'April 18, 2026',
  sections: [
    {
      title: 'Information We Collect',
      body: () => (
        <>
          <p>When you create an account on JourneyMate, we collect:</p>
          <Bullets
            items={[
              'Your name and email address',
              'A securely hashed version of your password (we never store your plain-text password)',
              'Trip search history (from/to cities, dates)',
              'Booking preferences and saved routes',
            ]}
          />
          <p>
            We do not collect payment card details. Any payment processing is
            handled by certified third-party processors.
          </p>
        </>
      ),
    },
    {
      title: 'How We Use Your Information',
      body: () => (
        <>
          <p>Your information is used solely to:</p>
          <Bullets
            items={[
              'Provide personalised Silver vs Gold travel comparisons',
              'Save your trip history so you can access it later',
              'Send relevant travel tips and route updates (only if you opt in)',
              'Improve our city database and route recommendations',
            ]}
          />
          <p>We never sell your personal data to third parties.</p>
        </>
      ),
    },
    {
      title: 'Data Storage & Security',
      body: () => (
        <>
          <p>
            All data is stored in a PostgreSQL database hosted on secure
            infrastructure. We use:
          </p>
          <Bullets
            items={[
              'bcrypt hashing for all passwords',
              'HTTPS for all data in transit',
              'JWT tokens that expire within 7 days',
              'Rate limiting to prevent brute-force attacks',
            ]}
          />
        </>
      ),
    },
    {
      title: 'Cookies & Local Storage',
      body: () => (
        <p>
          JourneyMate stores a session token in your browser&apos;s local
          storage to keep you logged in across sessions. We do not use
          advertising cookies. We may use analytics cookies to understand
          usage patterns &mdash; these can be disabled in your browser
          settings.
        </p>
      ),
    },
    {
      title: 'Your Rights',
      body: () => (
        <>
          <p>You have the right to:</p>
          <Bullets
            items={[
              'Access a copy of all data we hold about you',
              'Request deletion of your account and associated data',
              'Opt out of marketing emails at any time',
              'Correct inaccurate personal information',
            ]}
          />
          <p>
            To exercise any of these rights, email us at{' '}
            <Email
              address="harshvardhan1412002@gmail.com"
              accent="text-teal-400"
            />
            .
          </p>
        </>
      ),
    },
    {
      title: 'Third-Party Services',
      body: () => (
        <p>
          We use OpenStreetMap (Nominatim) for city search and map rendering.
          Please refer to{' '}
          <a
            href="https://osmfoundation.org/wiki/Privacy_Policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 hover:underline"
          >
            OpenStreetMap&apos;s Privacy Policy
          </a>{' '}
          for details on their data practices.
        </p>
      ),
    },
    {
      title: 'Changes to This Policy',
      body: () => (
        <p>
          We may update this policy from time to time. When we do, we will
          update the &ldquo;Last updated&rdquo; date at the top of this page.
          Continued use of JourneyMate after changes constitutes acceptance of
          the revised policy.
        </p>
      ),
    },
    {
      title: 'Contact',
      isLast: true,
      body: () => (
        <p>
          Questions about this policy? Contact us at{' '}
          <Email
            address="harshvardhan1412002@gmail.com"
            accent="text-teal-400"
          />
          .
        </p>
      ),
    },
  ],
})
