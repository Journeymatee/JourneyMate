import React from 'react'
import { FileText, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-display font-bold text-xl sm:text-2xl text-white mb-4 pb-2 border-b border-white/8">{title}</h2>
    <div className="text-slate-400 text-sm sm:text-base leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function Terms() {
  return (
    <div className="min-h-[100dvh] mesh-bg pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to JourneyMate
        </Link>

        <div className="flex items-start gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1">
            <FileText size={22} className="text-blue-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">Terms of Service</h1>
            <p className="text-slate-500 text-sm">Last updated: April 18, 2026</p>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 sm:p-10 border border-white/8">

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using JourneyMate ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>JourneyMate is a travel comparison platform that helps users compare Silver (budget) and Gold (luxury) travel packages across Indian routes. The Service provides:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
              <li>Side-by-side travel package comparisons</li>
              <li>Day-by-day itinerary planning</li>
              <li>Interactive route maps</li>
              <li>City and route search across 600+ Indian destinations</li>
            </ul>
          </Section>

          <Section title="3. User Accounts">
            <p>To access certain features, you must create an account. You are responsible for:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorised use</li>
            </ul>
            <p>You must be at least 18 years old to create an account.</p>
          </Section>

          <Section title="4. Pricing & Availability">
            <p>All prices shown on JourneyMate are <strong className="text-slate-300">indicative and subject to change</strong>. Actual prices depend on availability, season, booking lead time, and the specific operator. JourneyMate does not guarantee that prices displayed are the final prices you will pay when booking.</p>
            <p>We update our pricing data regularly but cannot guarantee real-time accuracy across all 600+ routes.</p>
          </Section>

          <Section title="5. Prohibited Uses">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
              <li>Scrape, crawl, or otherwise extract data from the Service in bulk</li>
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Create multiple accounts to circumvent rate limits or access restrictions</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </Section>

          <Section title="6. Intellectual Property">
            <p>All content on JourneyMate — including text, graphics, logos, and software — is the property of JourneyMate and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>JourneyMate provides the Service on an "as-is" basis. To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the Service, including but not limited to travel disruptions, booking errors, or loss of data.</p>
          </Section>

          <Section title="8. Modifications to Terms">
            <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use of the Service after changes constitutes acceptance.</p>
          </Section>

          <Section title="9. Governing Law">
            <p>These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of jurisdiction applicable to the registered address of JourneyMate.</p>
          </Section>

          <Section title="10. Contact">
            <p>For questions about these Terms, contact us at <a href="mailto:harshvardhan1412002@gmail.com" className="text-blue-400 hover:underline">harshvardhan1412002@gmail.com</a>.</p>
          </Section>
        </div>
      </div>
    </div>
  )
}
