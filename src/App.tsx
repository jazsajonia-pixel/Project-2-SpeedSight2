import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
const LandingPage = lazy(() => import('./pages/LandingPage').then(({ LandingPage }) => ({ default: LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(({ LoginPage }) => ({ default: LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(({ RegisterPage }) => ({ default: RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(({ DashboardPage }) => ({ default: DashboardPage })));
const MonitoringPage = lazy(() => import('./pages/MonitoringPage').then(({ MonitoringPage }) => ({ default: MonitoringPage })));
const SessionsPage = lazy(() => import('./pages/SessionsPage').then(({ SessionsPage }) => ({ default: SessionsPage })));
const DetectionsPage = lazy(() => import('./pages/DetectionsPage').then(({ DetectionsPage }) => ({ default: DetectionsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(({ AnalyticsPage }) => ({ default: AnalyticsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(({ ReportsPage }) => ({ default: ReportsPage })));
const CameraProfilesPage = lazy(() => import('./pages/CameraProfilesPage').then(({ CameraProfilesPage }) => ({ default: CameraProfilesPage })));
const CalibrationPage = lazy(() => import('./pages/CalibrationPage').then(({ CalibrationPage }) => ({ default: CalibrationPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(({ SettingsPage }) => ({ default: SettingsPage })));

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense
            fallback={(
              <div className="flex min-h-screen items-center justify-center bg-slate-950 text-cyan-100" role="status" aria-live="polite">
                Loading SpeedSight…
              </div>
            )}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected App Dashboard Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/monitoring" element={<MonitoringPage />} />
                  <Route path="/sessions" element={<SessionsPage />} />
                  <Route path="/detections" element={<DetectionsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/camera-profiles" element={<CameraProfilesPage />} />
                  <Route path="/calibration" element={<CalibrationPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
