import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthModal } from './components/auth/AuthModal';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ExploreCarsPage } from './pages/public/ExploreCarsPage';
import { VehicleDetailsPage } from './pages/public/VehicleDetailsPage';
import { HostLandingPage } from './pages/public/HostLandingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { LocationsPage } from './pages/public/LocationsPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Dashboards
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { FleetOperationsDashboardPage } from './pages/admin/FleetOperationsDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <div
          className={`min-h-screen flex flex-col transition-colors duration-200 w-full overflow-x-clip ${
            theme === 'light'
              ? 'bg-[#F4EFEA] text-[#111827] selection:bg-black selection:text-white'
              : 'bg-black text-white selection:bg-white selection:text-black'
          }`}
        >
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExploreCarsPage />} />
              <Route path="/cars" element={<ExploreCarsPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
              <Route path="/host" element={<HostLandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Customer Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Vendor Portal */}
              <Route
                path="/vendor"
                element={
                  <ProtectedRoute allowedRoles={['VENDOR']}>
                    <VendorDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Administrator Console */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Shadcn UI Dashboard-01: Fleet Operations & Lifecycle Console */}
              <Route
                path="/admin/fleet-ops"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <FleetOperationsDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fleet-ops"
                element={<FleetOperationsDashboardPage />}
              />

              {/* Fallback */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
          <Footer />
          <AuthModal />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
