import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Show, SignInButton, SignUpButton } from '@clerk/react';
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
import { Leaf } from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex p-4 bg-green-600 rounded-2xl mb-6">
          <Leaf className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Geco Farm</h1>
        <p className="text-slate-600 mb-8">Smart farm management for Kenyan farmers</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
            <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors min-h-[44px]">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="redirect" forceRedirectUrl="/setup">
            <button className="px-6 py-3 border border-green-600 text-green-700 font-medium rounded-xl hover:bg-green-50 transition-colors min-h-[44px]">
              Create Account
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={
              <>
                <Show when="signed-out">
                  <LandingPage />
                </Show>
                <Show when="signed-in">
                  <Navigate to="/dashboard" replace />
                </Show>
              </>
            } />

            {/* Auth routes */}
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
            <Route path="*" element={<Navigate to="/" replace />} />
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
