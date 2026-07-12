import { privacyPolicyContent } from '../data/legalData'
import LegalPage from './LegalPage'

export default function PrivacyPolicyPage() {
  return <LegalPage title={privacyPolicyContent.title} sections={privacyPolicyContent.sections} />
}
