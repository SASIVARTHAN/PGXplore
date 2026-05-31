import { helpCenterContent } from '../data/legalData'
import LegalPage from './LegalPage'

export default function HelpCenterPage() {
  return <LegalPage title={helpCenterContent.title} sections={helpCenterContent.sections} />
}
