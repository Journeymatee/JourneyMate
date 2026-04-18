import React from 'react'
import { Shield, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-display font-bold text-xl sm:text-2xl text-white mb-4 pb-2 border-b border-white/8">{title}</h2>
    <div className="text-slate-400 text-sm sm:text-base leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[100dvh] mesh-bg pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to JourneyMate
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 mt-1">
            <Shield size={22} className="text-green-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">Privacy Policy</h1>
            <p className="text-slate-500 text-sm">Last updated: April 18, 2026</p>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 sm:p-10 border border-white/8">

          <Section title="1. Information We Collect">
            <p>When you create an account on JourneyMate, we collect:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
              <li>Your name and email address</li>
              <li>A securely hashed version of your password (we never store your plain-text password)</li>
              <li>Trip search history (from/to cities, dates)</li>
              <li>Booking preferences and saved routes</li>
            </ul>
            <p>We do not collect payment card details. Any payment processing is handled by certified third-party processors.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>Your information is used solely to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
              <li>Provide personalised Silver vs Gold travel comparisons</li>
              <li>Save your trip history so you can access it later</li>
              <li>Send relevant travel tips and route updates (only if you opt in)</li>
              <li>Improve our city database and route recommendations</li>
            </ul>
            <p>We never sell your personal data to third parties.</p>
          </Section>

          <Section title="3. Data Storage & Security">
            <p>All data is stored in a PostgreSQL database hosted on secure infrastructure. We use:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
              <li>bcrypt hashing for all passwords</li>
              <li>HTTPS for all data in transit</li>
              <li>JWT tokens that expire within 7 days</li>
              <li>Rate limiting to prevent brute-force attacks</li>
            </ul>
          </Section>

          <Section title="4. Cookies & Local Storage">
            <p>JourneyMate stores a session token in your browser's local storage to keep you logged in across sessions. We do not use advertising cookies. We may use analytics cookies to understand usage patterns — these can be disabled in your browser settings.</p>
          </Section>

          <Section title="5. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
              <li>Access a copy of all data we hold about you</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of marketing emails at any time</li>
              <li>Correct inaccurate personal information</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:harshvardhan1412002@gmail.com" className="text-green-400 hover:underline">harshvardhan1412002@gmail.com</a>.</p>
          </Section>

          <Section title="6. Third-Party Services">
            <p>We use OpenStreetMap (Nominatim) for city search and map rendering. Please refer to <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">OpenStreetMap's Privacy Policy</a> for details on their data practices.</p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>We may update this policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of JourneyMate after changes constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="8. Contact">
            <p>Questions about this policy? Contact us at <a href="mailto:harshvardhan1412002@gmail.com" className="text-green-400 hover:underline">harshvardhan1412002@gmail.com</a>.</p>
          </Section>
        </div>
      </div>
    </div>
  )
}
