import React from 'react'
import { FileText } from 'lucide-react'

import LegalPageLayout from '../components/legal/LegalPageLayout'
import { TERMS_DOC } from '../data/legalContent'

/**
 * Terms of Service page — pure composition.
 *
 *   page → layout template → editorial data
 *
 * The only responsibility of this file is wiring the document
 * data + icon to the shared `LegalPageLayout`. Editing wording is a
 * `data/legalContent.jsx` change; restyling all legal pages is a
 * `LegalPageLayout` change. (Single Responsibility.)
 */
export default function Terms() {
  return (
    <LegalPageLayout
      accent={TERMS_DOC.accent}
      icon={FileText}
      titleLead={TERMS_DOC.titleLead}
      titleAccent={TERMS_DOC.titleAccent}
      titleTrail={TERMS_DOC.titleTrail}
      lastUpdated={TERMS_DOC.lastUpdated}
      sections={TERMS_DOC.sections}
    />
  )
}
