
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import SecurityHeaders from '@/components/security/SecurityHeaders';
import SessionManager from '@/components/security/SessionManager';
import CookieConsent from '@/components/compliance/CookieConsent';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Matches from './pages/Matches';
import Discover from './pages/Discover';
import Membership from './pages/Membership';
import Legal from './pages/Legal';
import NotFound from './pages/NotFound';
import RoleManager from '@/components/security/RoleManager';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <SecurityHeaders />
        <SessionManager />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={
              <AuthGuard requireAuth={false}>
                <Auth />
              </AuthGuard>
            } />
            <Route path="/legal" element={<Legal />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <AuthGuard requireAuth={true}>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/messages" element={
              <AuthGuard requireAuth={true}>
                <Messages />
              </AuthGuard>
            } />
            <Route path="/matches" element={
              <AuthGuard requireAuth={true}>
                <Matches />
              </AuthGuard>
            } />
            <Route path="/discover" element={
              <AuthGuard requireAuth={true}>
                <Discover />
              </AuthGuard>
            } />
            <Route path="/membership" element={
              <AuthGuard requireAuth={true}>
                <Membership />
              </AuthGuard>
            } />
            <Route path="/admin/roles" element={
              <AuthGuard requireAuth={true}>
                <RoleManager />
              </AuthGuard>
            } />
            
            {/* Catch-all route for 404s */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <CookieConsent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
