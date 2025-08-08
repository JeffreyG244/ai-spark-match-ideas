import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Discover = lazy(() => import("./pages/Discover"));
const Matches = lazy(() => import("./pages/Matches"));
const ProfessionalMatches = lazy(() => import("./pages/ProfessionalMatches"));
const ProfessionalProfile = lazy(() => import("./pages/ProfessionalProfile"));
const ProfessionalInterests = lazy(() => import("./pages/ProfessionalInterests"));
const DailyMatches = lazy(() => import("./pages/DailyMatches"));
const Messages = lazy(() => import("./pages/Messages"));
const Membership = lazy(() => import("./pages/Membership"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Settings = lazy(() => import("./pages/Settings"));
const Legal = lazy(() => import("./pages/Legal"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const ExecutiveLuvlang = lazy(() => import("./pages/ExecutiveLuvlang"));
const ExecutiveProfile = lazy(() => import("./pages/ExecutiveProfile"));
// Load other components normally (admin pages, etc.)
import PreLaunchAudit from "./pages/PreLaunchAudit";
import SeedUsers from "./pages/SeedUsers";
import SeedDatingProfiles from "./pages/SeedDatingProfiles";
import SeedEnhancedProfiles from "./pages/SeedEnhancedProfiles";
import NotFound from "./pages/NotFound";
import Verification from "./pages/Verification";
import Safety from "./pages/Safety";
import Analytics from "./pages/Analytics";
import SuccessStories from "./pages/SuccessStories";
import Moderation from "./pages/Moderation";
import TestIntegration from "./pages/TestIntegration";
import TestSetup from "./pages/TestSetup";
import N8NTesting from "./pages/N8NTesting";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";

// Legal pages
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import CommunityGuidelines from "./pages/legal/CommunityGuidelines";
import SafetyGuidelines from "./pages/legal/SafetyGuidelines";
import CookiePolicy from "./pages/legal/CookiePolicy";
import GDPR from "./pages/legal/GDPR";
import CCPA from "./pages/legal/CCPA";
import DataRetention from "./pages/legal/DataRetention";
import IntellectualProperty from "./pages/legal/IntellectualProperty";
import ContentModerationPolicy from "./pages/legal/ContentModerationPolicy";
import MessageMonitoring from "./pages/legal/MessageMonitoring";
import PhotoVerification from "./pages/legal/PhotoVerification";
import IdentityVerificationPolicy from "./pages/legal/IdentityVerificationPolicy";
import AgeVerificationPolicy from "./pages/legal/AgeVerificationPolicy";
import BlockingReportingPolicy from "./pages/legal/BlockingReportingPolicy";
import RomanceScamPrevention from "./pages/legal/RomanceScamPrevention";
import AccountSuspension from "./pages/legal/AccountSuspension";

const queryClient = new QueryClient();
// Force rebuild

import { EnhancedSecurityProvider } from '@/components/profile/EnhancedSecurityProvider';
import SecureSessionManager from '@/components/security/SecureSessionManager';
import { AlertProvider } from '@/components/providers/AlertProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <SecureSessionManager />
            <EnhancedSecurityProvider>
              <AlertProvider>
                <Router>
                <div className="min-h-screen bg-gradient-to-br from-background to-muted">
                  <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                    </div>
                  }>
                   <Routes>
                     <Route path="/" element={<AuthGuard requireAuth={false}><Index /></AuthGuard>} />
                     <Route path="/auth" element={<AuthGuard requireAuth={false}><Auth /></AuthGuard>} />
                     <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
                     <Route path="/discover" element={<AuthGuard><Discover /></AuthGuard>} />
                     <Route path="/matches" element={<AuthGuard><Matches /></AuthGuard>} />
                     <Route path="/professional-matches" element={<AuthGuard><ProfessionalMatches /></AuthGuard>} />
                     <Route path="/professional-profile" element={<AuthGuard><ProfessionalProfile /></AuthGuard>} />
                     <Route path="/professional-interests" element={<AuthGuard><ProfessionalInterests /></AuthGuard>} />
                     <Route path="/daily-matches" element={<AuthGuard><DailyMatches /></AuthGuard>} />
                     <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
                     <Route path="/membership" element={<AuthGuard><Membership /></AuthGuard>} />
                     <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
                     <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/seed-users" element={<SeedUsers />} />
                    <Route path="/seed-dating-profiles" element={<SeedDatingProfiles />} />
                    <Route path="/seed-enhanced-profiles" element={<SeedEnhancedProfiles />} />
                    <Route path="/pre-launch-audit" element={<PreLaunchAudit />} />
                    <Route path="/admin" element={<PreLaunchAudit />} />
                    <Route path="/verification" element={<Verification />} />
                    <Route path="/safety" element={<Safety />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/success-stories" element={<SuccessStories />} />
                    <Route path="/moderation" element={<Moderation />} />
                    <Route path="/test-integration" element={<TestIntegration />} />
                    <Route path="/test-setup" element={<TestSetup />} />
                    <Route path="/n8n-testing" element={<N8NTesting />} />
                     <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
                     <Route path="/executive-luvlang" element={<ExecutiveLuvlang />} />
                     <Route path="/executive-profile" element={<AuthGuard><ExecutiveProfile /></AuthGuard>} />
                    <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/legal/terms-of-service" element={<TermsOfService />} />
                    <Route path="/legal/community-guidelines" element={<CommunityGuidelines />} />
                    <Route path="/legal/safety-guidelines" element={<SafetyGuidelines />} />
                    <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
                    <Route path="/legal/gdpr" element={<GDPR />} />
                    <Route path="/legal/ccpa" element={<CCPA />} />
                    <Route path="/legal/data-retention" element={<DataRetention />} />
                    <Route path="/legal/intellectual-property" element={<IntellectualProperty />} />
                    <Route path="/legal/content-moderation-policy" element={<ContentModerationPolicy />} />
                    <Route path="/legal/age-verification-policy" element={<AgeVerificationPolicy />} />
                    <Route path="/legal/identity-verification-policy" element={<IdentityVerificationPolicy />} />
                    <Route path="/legal/photo-verification" element={<PhotoVerification />} />
                    <Route path="/legal/blocking-reporting-policy" element={<BlockingReportingPolicy />} />
                    <Route path="/legal/message-monitoring" element={<MessageMonitoring />} />
                    <Route path="/legal/romance-scam-prevention" element={<RomanceScamPrevention />} />
                    <Route path="/legal/account-suspension" element={<AccountSuspension />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
                  <Toaster />
                  <Sonner />
                </div>
                </Router>
              </AlertProvider>
            </EnhancedSecurityProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
