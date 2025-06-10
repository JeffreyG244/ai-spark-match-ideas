
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

// Core Legal Documents
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CommunityGuidelines from './pages/legal/CommunityGuidelines';
import CookiePolicy from './pages/legal/CookiePolicy';
import ContentModerationPolicy from './pages/legal/ContentModerationPolicy';

// Safety & Security
import SafetyGuidelines from './pages/legal/SafetyGuidelines';
import AgeVerificationPolicy from './pages/legal/AgeVerificationPolicy';
import IdentityVerificationPolicy from './pages/legal/IdentityVerificationPolicy';
import RomanceScamPrevention from './pages/legal/RomanceScamPrevention';
import BlockingReportingPolicy from './pages/legal/BlockingReportingPolicy';

// Data Protection & Privacy
import GDPR from './pages/legal/GDPR';
import CCPA from './pages/legal/CCPA';
import DataRetention from './pages/legal/DataRetention';

// Platform Operations
import PhotoVerification from './pages/legal/PhotoVerification';
import MessageMonitoring from './pages/legal/MessageMonitoring';
import AccountSuspension from './pages/legal/AccountSuspension';

// Legal Protection
import IntellectualProperty from './pages/legal/IntellectualProperty';

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
            
            {/* Core Legal Documents */}
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/terms" element={<TermsOfService />} />
            <Route path="/legal/community" element={<CommunityGuidelines />} />
            <Route path="/legal/cookies" element={<CookiePolicy />} />
            <Route path="/legal/moderation" element={<ContentModerationPolicy />} />
            
            {/* Safety & Security */}
            <Route path="/legal/safety" element={<SafetyGuidelines />} />
            <Route path="/legal/age-verification" element={<AgeVerificationPolicy />} />
            <Route path="/legal/identity-verification" element={<IdentityVerificationPolicy />} />
            <Route path="/legal/scam-prevention" element={<RomanceScamPrevention />} />
            <Route path="/legal/reporting" element={<BlockingReportingPolicy />} />
            
            {/* Data Protection & Privacy */}
            <Route path="/legal/gdpr" element={<GDPR />} />
            <Route path="/legal/ccpa" element={<CCPA />} />
            <Route path="/legal/data-retention" element={<DataRetention />} />
            
            {/* Platform Operations */}
            <Route path="/legal/photo-verification" element={<PhotoVerification />} />
            <Route path="/legal/message-monitoring" element={<MessageMonitoring />} />
            <Route path="/legal/suspension" element={<AccountSuspension />} />
            
            {/* Legal Protection */}
            <Route path="/legal/ip" element={<IntellectualProperty />} />
            
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
