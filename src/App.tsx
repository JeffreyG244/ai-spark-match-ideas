import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import DailyMatches from "./pages/DailyMatches";
import Messages from "./pages/Messages";
import Membership from "./pages/Membership";
import Checkout from "./pages/Checkout";
import Legal from "./pages/Legal";
import HowItWorks from "./pages/HowItWorks";
import PreLaunchAudit from "./pages/PreLaunchAudit";
import SeedUsers from "./pages/SeedUsers";
import SeedDatingProfiles from "./pages/SeedDatingProfiles";
import NotFound from "./pages/NotFound";

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

import { EnhancedSecurityProvider } from '@/components/profile/EnhancedSecurityProvider';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <EnhancedSecurityProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/daily-matches" element={<DailyMatches />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/seed-users" element={<SeedUsers />} />
                <Route path="/seed-dating-profiles" element={<SeedDatingProfiles />} />
                <Route path="/pre-launch-audit" element={<PreLaunchAudit />} />
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
              <Toaster />
              <Sonner />
            </Router>
          </EnhancedSecurityProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
