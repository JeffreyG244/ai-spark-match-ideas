import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import React from "react";

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


// Lazy load remaining components for better performance
const NotFound = lazy(() => import("./pages/NotFound"));
const Verification = lazy(() => import("./pages/Verification"));
const VerificationCenter = lazy(() => import("./pages/VerificationCenter"));
const Safety = lazy(() => import("./pages/Safety"));
const Analytics = lazy(() => import("./pages/Analytics"));
const SuccessStories = lazy(() => import("./pages/SuccessStories"));
const Moderation = lazy(() => import("./pages/Moderation"));
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));
const ExecutiveProfile = lazy(() => import("./pages/ExecutiveProfile"));

// Legal pages - lazy loaded for better performance
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const CommunityGuidelines = lazy(() => import("./pages/legal/CommunityGuidelines"));
const SafetyGuidelines = lazy(() => import("./pages/legal/SafetyGuidelines"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const GDPR = lazy(() => import("./pages/legal/GDPR"));
const CCPA = lazy(() => import("./pages/legal/CCPA"));
const DataRetention = lazy(() => import("./pages/legal/DataRetention"));
const IntellectualProperty = lazy(() => import("./pages/legal/IntellectualProperty"));
const ContentModerationPolicy = lazy(() => import("./pages/legal/ContentModerationPolicy"));
const MessageMonitoring = lazy(() => import("./pages/legal/MessageMonitoring"));
const PhotoVerification = lazy(() => import("./pages/legal/PhotoVerification"));
const IdentityVerificationPolicy = lazy(() => import("./pages/legal/IdentityVerificationPolicy"));
const AgeVerificationPolicy = lazy(() => import("./pages/legal/AgeVerificationPolicy"));
const BlockingReportingPolicy = lazy(() => import("./pages/legal/BlockingReportingPolicy"));
const RomanceScamPrevention = lazy(() => import("./pages/legal/RomanceScamPrevention"));
const AccountSuspension = lazy(() => import("./pages/legal/AccountSuspension"));

const queryClient = new QueryClient();
// Force rebuild

// Import critical components directly (not lazy loaded)
import { EnhancedSecurityProvider } from '@/components/profile/EnhancedSecurityProvider';
import SecureSessionManager from '@/components/security/SecureSessionManager';
import { AlertProvider } from '@/components/providers/AlertProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import { CallReceiver } from '@/components/calling/CallReceiver';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <AuthProvider>
              <SecureSessionManager />
              <EnhancedSecurityProvider>
                <AlertProvider>
                  <div className="min-h-screen bg-gradient-to-br from-background to-muted">
                    <Suspense fallback={<LoadingSpinner size="lg" />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<AuthGuard requireAuth={false}><Auth /></AuthGuard>} />
                        <Route path="/login" element={<AuthGuard requireAuth={false}><Auth /></AuthGuard>} />
                        <Route path="/signup" element={<AuthGuard requireAuth={false}><Auth /></AuthGuard>} />
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
                        <Route path="/security" element={<AuthGuard><Settings /></AuthGuard>} />
                        <Route path="/profile" element={<AuthGuard><Settings /></AuthGuard>} />
                        <Route path="/legal" element={<Legal />} />
                        <Route path="/how-it-works" element={<HowItWorks />} />
                        <Route path="/verification" element={<Verification />} />
                        <Route path="/verification-center" element={<AuthGuard><VerificationCenter /></AuthGuard>} />
                        <Route path="/safety" element={<Safety />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/success-stories" element={<SuccessStories />} />
                        <Route path="/moderation" element={<Moderation />} />
                        <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
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
                    <CallReceiver />
                    <Toaster />
                    <Sonner />
                  </div>
                </AlertProvider>
              </EnhancedSecurityProvider>
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
