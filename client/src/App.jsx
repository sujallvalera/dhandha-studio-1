import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Layout
import DashboardLayout from './components/DashboardLayout.jsx';

// ── Admin Pages ──────────────────────────────────────────
import AdminDashboard from './pages/admin/DashboardPage.jsx';
import AdminRefunds from './pages/admin/RefundsPage.jsx';
import AdminUsers from './pages/admin/UsersPage.jsx';
import AdminClients from './pages/admin/ClientsPage.jsx';
import AdminSettings from './pages/admin/SettingsPage.jsx';

// ── User Pages ───────────────────────────────────────────
import UserUpload from './pages/user/UploadPage.jsx';
import UserHistory from './pages/user/HistoryPage.jsx';
import UserCredits from './pages/user/CreditsPage.jsx';
import UserProfile from './pages/user/ProfilePage.jsx';

// ── Client Pages ─────────────────────────────────────────
import ClientApiKeys from './pages/client/ApiKeysPage.jsx';
import ClientAnalytics from './pages/client/AnalyticsPage.jsx';
import ClientBilling from './pages/client/BillingPage.jsx';
import ClientAssets from './pages/client/AssetsPage.jsx';
import ClientDocs from './pages/client/DocsPage.jsx';

function AppRoutes() {
  const [role, setRole] = useState(() => {
    return localStorage.getItem('ds_role') || 'user';
  });
  const navigate = useNavigate();

  const handleRoleChange = useCallback((newRole) => {
    setRole(newRole);
    localStorage.setItem('ds_role', newRole);
    // Navigate to the default page for the new role
    const defaultRoutes = { admin: '/admin', user: '/user', client: '/client' };
    navigate(defaultRoutes[newRole] || '/user');
  }, [navigate]);

  return (
    <Routes>
      {/* ── Admin Dashboard ──────────────────── */}
      <Route path="/admin" element={
        <DashboardLayout role="admin" pageTitle="Platform Analytics" onRoleChange={handleRoleChange}>
          <AdminDashboard />
        </DashboardLayout>
      } />
      <Route path="/admin/users" element={
        <DashboardLayout role="admin" pageTitle="User Management" onRoleChange={handleRoleChange}>
          <AdminUsers />
        </DashboardLayout>
      } />
      <Route path="/admin/clients" element={
        <DashboardLayout role="admin" pageTitle="API Clients" onRoleChange={handleRoleChange}>
          <AdminClients />
        </DashboardLayout>
      } />
      <Route path="/admin/refunds" element={
        <DashboardLayout role="admin" pageTitle="Refund Management" onRoleChange={handleRoleChange}>
          <AdminRefunds />
        </DashboardLayout>
      } />
      <Route path="/admin/settings" element={
        <DashboardLayout role="admin" pageTitle="Platform Settings" onRoleChange={handleRoleChange}>
          <AdminSettings />
        </DashboardLayout>
      } />

      {/* ── User Dashboard ───────────────────── */}
      <Route path="/user" element={
        <DashboardLayout role="user" pageTitle="AI Photoshoot" onRoleChange={handleRoleChange}>
          <UserUpload />
        </DashboardLayout>
      } />
      <Route path="/user/upload" element={
        <DashboardLayout role="user" pageTitle="AI Photoshoot" onRoleChange={handleRoleChange}>
          <UserUpload />
        </DashboardLayout>
      } />
      <Route path="/user/history" element={
        <DashboardLayout role="user" pageTitle="Generation History" onRoleChange={handleRoleChange}>
          <UserHistory />
        </DashboardLayout>
      } />
      <Route path="/user/credits" element={
        <DashboardLayout role="user" pageTitle="Credits" onRoleChange={handleRoleChange}>
          <UserCredits />
        </DashboardLayout>
      } />
      <Route path="/user/profile" element={
        <DashboardLayout role="user" pageTitle="Profile" onRoleChange={handleRoleChange}>
          <UserProfile />
        </DashboardLayout>
      } />

      {/* ── Client Dashboard ─────────────────── */}
      <Route path="/client" element={
        <DashboardLayout role="client" pageTitle="API Keys" onRoleChange={handleRoleChange}>
          <ClientApiKeys />
        </DashboardLayout>
      } />
      <Route path="/client/keys" element={
        <DashboardLayout role="client" pageTitle="API Keys" onRoleChange={handleRoleChange}>
          <ClientApiKeys />
        </DashboardLayout>
      } />
      <Route path="/client/analytics" element={
        <DashboardLayout role="client" pageTitle="Usage Analytics" onRoleChange={handleRoleChange}>
          <ClientAnalytics />
        </DashboardLayout>
      } />
      <Route path="/client/billing" element={
        <DashboardLayout role="client" pageTitle="Billing" onRoleChange={handleRoleChange}>
          <ClientBilling />
        </DashboardLayout>
      } />
      <Route path="/client/assets" element={
        <DashboardLayout role="client" pageTitle="Generated Assets" onRoleChange={handleRoleChange}>
          <ClientAssets />
        </DashboardLayout>
      } />
      <Route path="/client/docs" element={
        <DashboardLayout role="client" pageTitle="API Documentation" onRoleChange={handleRoleChange}>
          <ClientDocs />
        </DashboardLayout>
      } />

      {/* ── Fallback ─────────────────────────── */}
      <Route path="/" element={<Navigate to="/user" replace />} />
      <Route path="*" element={<Navigate to="/user" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
