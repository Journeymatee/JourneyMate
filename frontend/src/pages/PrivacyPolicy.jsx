import React from 'react'
import { Shield } from 'lucide-react'

import LegalPageLayout from '../components/legal/LegalPageLayout'
import { PRIVACY_DOC } from '../data/legalContent'

/**
 * Privacy Policy page — same shape as Terms, by design.
 *
 *   page → layout template → editorial data
 *
 * Adding a third legal page (e.g. Cookies, Refunds, DPA) is now a
 * 12-line file with new copy in `data/legalContent.js`.
 */
export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      accent={PRIVACY_DOC.accent}
      icon={Shield}
      titleLead={PRIVACY_DOC.titleLead}
      titleAccent={PRIVACY_DOC.titleAccent}
      titleTrail={PRIVACY_DOC.titleTrail}
      lastUpdated={PRIVACY_DOC.lastUpdated}
      sections={PRIVACY_DOC.sections}
    />
  )
}
