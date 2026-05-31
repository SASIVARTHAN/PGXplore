import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboardPage from '../pages/AdminDashboardPage'
import AdminLoginPage from '../pages/AdminLoginPage'
import CompanyDetailsPage from '../pages/CompanyDetailsPage'
import EntryPage from '../pages/EntryPage'
import HelpCenterPage from '../pages/HelpCenterPage'
import HomePage from '../pages/HomePage'
import ListingsPage from '../pages/ListingsPage'
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage'
import OwnerDetailsPage from '../pages/OwnerDetailsPage'
import PGDetailPage from '../pages/PGDetailPage'
import SavedPage from '../pages/SavedPage'
import TermsPage from '../pages/TermsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/listings" element={<ListingsPage />} />
      <Route path="/pg/:id" element={<PGDetailPage />} />
      <Route path="/saved" element={<SavedPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/help-center" element={<HelpCenterPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/company" element={<CompanyDetailsPage />} />
      <Route path="/owner" element={<OwnerDetailsPage />} />
      <Route path="/owner/:pgId" element={<OwnerDetailsPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
