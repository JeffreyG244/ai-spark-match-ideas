
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Discover from '@/pages/Discover';
import Matches from '@/pages/Matches';
import Messages from '@/pages/Messages';
import Membership from '@/pages/Membership';
import Legal from '@/pages/Legal';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import TermsOfService from '@/pages/legal/TermsOfService';
import CommunityGuidelines from '@/pages/legal/CommunityGuidelines';
import SafetyGuidelines from '@/pages/legal/SafetyGuidelines';
import RomanceScamPrevention from '@/pages/legal/RomanceScamPrevention';
import ContentModerationPolicy from '@/pages/legal/ContentModerationPolicy';
import BlockingReportingPolicy from '@/pages/legal/BlockingReportingPolicy';
import AgeVerificationPolicy from '@/pages/legal/AgeVerificationPolicy';
import IdentityVerificationPolicy from '@/pages/legal/IdentityVerificationPolicy';
import CookiePolicy from '@/pages/legal/CookiePolicy';
import IntellectualProperty from '@/pages/legal/IntellectualProperty';
import AuthGuard from '@/components/auth/AuthGuard';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/discover" element={<AuthGuard><Discover /></AuthGuard>} />
            <Route path="/matches" element={<AuthGuard><Matches /></AuthGuard>} />
            <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
            <Route path="/membership" element={<AuthGuard><Membership /></AuthGuard>} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/terms" element={<TermsOfService />} />
            <Route path="/legal/community-guidelines" element={<CommunityGuidelines />} />
            <Route path="/legal/safety-guidelines" element={<SafetyGuidelines />} />
            <Route path="/legal/romance-scam-prevention" element={<RomanceScamPrevention />} />
            <Route path="/legal/content-moderation" element={<ContentModerationPolicy />} />
            <Route path="/legal/blocking-reporting" element={<BlockingReportingPolicy />} />
            <Route path="/legal/age-verification" element={<AgeVerificationPolicy />} />
            <Route path="/legal/identity-verification" element={<IdentityVerificationPolicy />} />
            <Route path="/legal/cookies" element={<CookiePolicy />} />
            <Route path="/legal/intellectual-property" element={<IntellectualProperty />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
