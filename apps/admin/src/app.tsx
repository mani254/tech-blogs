import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/protected-route';
import { GuestRoute } from './components/guest-route';
import { DashboardLayout } from './layout/dashboard-layout';
import { LoginPage } from './pages/auth/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { UsersPage } from './pages/users/users.page';
import { SettingsPage } from './pages/settings/settings.page';

export function App() {
  return (
    <Routes>
      {/* Guest Routes (Only accessible when unauthenticated or non-admin) */}
      <Route element={<GuestRoute redirectTo="/dashboard" />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Admin Routes (Only accessible with verified admin role) */}
      <Route element={<ProtectedRoute redirectTo="/login" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Manage Group */}
          <Route path="/users" element={<UsersPage />} />

          {/* Settings Route */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
