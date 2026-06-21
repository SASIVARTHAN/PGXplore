import { termsContent } from '../data/legalData'
import LegalPage from './LegalPage'

export default function TermsPage() {
  return <LegalPage title={termsContent.title} sections={termsContent.sections} />
}
