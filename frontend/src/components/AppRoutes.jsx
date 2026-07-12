import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './RequireAuth'
import RequireRole from './admin/RequireRole'
import AdminLayout from '../layouts/AdminLayout'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage'
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage'
import AdminOverviewPage from '../pages/admin/AdminOverviewPage'
import AdminActivitiesPage from '../pages/admin/AdminActivitiesPage'
import AdminSharingOverviewPage from '../pages/admin/AdminSharingOverviewPage'
import AdminPGDetailPage from '../pages/admin/AdminPGDetailPage'
import AdminPGFormPage from '../pages/admin/AdminPGFormPage'
import AdminPGListPage from '../pages/admin/AdminPGListPage'
import AdminRequestsPage from '../pages/admin/AdminRequestsPage'
import AdminReviewsPage from '../pages/admin/AdminReviewsPage'
import AdminRoomsPage from '../pages/admin/AdminRoomsPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminOwnerApprovalsPage from '../pages/admin/AdminOwnerApprovalsPage'
import CompanyDetailsPage from '../pages/CompanyDetailsPage'
import EntryPage from '../pages/EntryPage'
import HelpCenterPage from '../pages/HelpCenterPage'
import HomePage from '../pages/HomePage'
import ListingsPage from '../pages/ListingsPage'
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage'
import OwnerDetailsPage from '../pages/OwnerDetailsPage'
import PGDetailPage from '../pages/PGDetailPage'
import SavedPage from '../pages/SavedPage'
import UserAccountPage from '../pages/UserAccountPage'
import UserLoginPage from '../pages/UserLoginPage'
import UserRegisterPage from '../pages/UserRegisterPage'
import TermsPage from '../pages/TermsPage'
import { isBackendPgOwner } from '../utils/pgPermissions'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route
        path="/listings"
        element={
          <RequireAuth>
            <ListingsPage />
          </RequireAuth>
        }
      />
      <Route path="/pg/:id" element={<PGDetailPage />} />
      <Route path="/login" element={<UserLoginPage />} />
      <Route path="/register" element={<UserRegisterPage />} />
      <Route path="/account" element={<UserAccountPage />} />
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
        <Route path="activities" element={<AdminActivitiesPage />} />
        <Route path="sharing-overview" element={<AdminSharingOverviewPage />} />
        <Route path="pgs" element={<AdminPGListPage listScope="all" />} />
        <Route
          path="my-pgs"
          element={
            <RequireRole allow={(auth) => isBackendPgOwner(auth.session)}>
              <AdminPGListPage listScope="mine" />
            </RequireRole>
          }
        />
        <Route path="pgs/new" element={<AdminPGFormPage />} />
        <Route path="pgs/:id/edit" element={<AdminPGFormPage />} />
        <Route path="pgs/:id" element={<AdminPGDetailPage />} />
        <Route path="rooms" element={<AdminRoomsPage />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route
          path="owner-approvals"
          element={
            <RequireRole allow={(auth) => auth.canManageUsers}>
              <AdminOwnerApprovalsPage />
            </RequireRole>
          }
        />
        <Route
          path="users"
          element={
            <RequireRole allow={(auth) => auth.canManageUsers}>
              <AdminUsersPage />
            </RequireRole>
          }
        />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="bookings" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
