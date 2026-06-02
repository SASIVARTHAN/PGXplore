import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage'
import AdminBookingsPage from '../pages/admin/AdminBookingsPage'
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage'
import AdminOverviewPage from '../pages/admin/AdminOverviewPage'
import AdminPGFormPage from '../pages/admin/AdminPGFormPage'
import AdminPGListPage from '../pages/admin/AdminPGListPage'
import AdminReviewsPage from '../pages/admin/AdminReviewsPage'
import AdminRoomsPage from '../pages/admin/AdminRoomsPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
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
      <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="pgs" element={<AdminPGListPage />} />
        <Route path="pgs/new" element={<AdminPGFormPage />} />
        <Route path="pgs/:id/edit" element={<AdminPGFormPage />} />
        <Route path="rooms" element={<AdminRoomsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
