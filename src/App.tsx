import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { FarmProvider } from './contexts/FarmContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { FarmSetupPage } from './pages/onboarding/FarmSetupPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CropsPage } from './pages/crops/CropsPage';
import { LivestockPage } from './pages/livestock/LivestockPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { FinancesPage } from './pages/finances/FinancesPage';
import { TasksPage } from './pages/tasks/TasksPage';
import { WeatherPage } from './pages/weather/WeatherPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/setup" element={<FarmSetupPage />} />

            {/* Protected routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/crops" element={<CropsPage />} />
              <Route path="/livestock" element={<LivestockPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/finances" element={<FinancesPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'text-sm',
              duration: 3000,
              style: { borderRadius: '12px', padding: '12px 16px' },
            }}
          />
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
