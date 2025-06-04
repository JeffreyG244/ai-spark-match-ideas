
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Messages from '@/pages/Messages';
import NotFound from '@/pages/NotFound';
import Legal from '@/pages/Legal';

// Legal Pages
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import SafetyGuidelines from '@/pages/legal/SafetyGuidelines';
import TermsOfService from '@/pages/legal/TermsOfService';
import CommunityGuidelines from '@/pages/legal/CommunityGuidelines';
import CookiePolicy from '@/pages/legal/CookiePolicy';
import IntellectualProperty from '@/pages/legal/IntellectualProperty';
import ContentModerationPolicy from '@/pages/legal/ContentModerationPolicy';
import AgeVerificationPolicy from '@/pages/legal/AgeVerificationPolicy';
import IdentityVerificationPolicy from '@/pages/legal/IdentityVerificationPolicy';
import RomanceScamPrevention from '@/pages/legal/RomanceScamPrevention';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <AuthGuard>
                  <Messages />
                </AuthGuard>
              } 
            />
            
            {/* Legal Routes - Implemented */}
            <Route path="/legal" element={<Legal />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/safety" element={<SafetyGuidelines />} />
            <Route path="/legal/terms" element={<TermsOfService />} />
            <Route path="/legal/community" element={<CommunityGuidelines />} />
            <Route path="/legal/cookies" element={<CookiePolicy />} />
            <Route path="/legal/ip" element={<IntellectualProperty />} />
            <Route path="/legal/moderation" element={<ContentModerationPolicy />} />
            <Route path="/legal/age-verification" element={<AgeVerificationPolicy />} />
            <Route path="/legal/identity-verification" element={<IdentityVerificationPolicy />} />
            <Route path="/legal/scam-prevention" element={<RomanceScamPrevention />} />
            
            {/* Placeholder routes for remaining legal pages - Coming Soon */}
            <Route path="/legal/reporting" element={<div>Blocking & Reporting Policy - Coming Soon</div>} />
            <Route path="/legal/gdpr" element={<div>GDPR Compliance - Coming Soon</div>} />
            <Route path="/legal/ccpa" element={<div>CCPA Compliance - Coming Soon</div>} />
            <Route path="/legal/data-retention" element={<div>Data Retention Policy - Coming Soon</div>} />
            <Route path="/legal/breach-notification" element={<div>Data Breach Notification - Coming Soon</div>} />
            <Route path="/legal/account-deletion" element={<div>Account Deletion Policy - Coming Soon</div>} />
            <Route path="/legal/photo-verification" element={<div>Photo Verification Guidelines - Coming Soon</div>} />
            <Route path="/legal/message-monitoring" element={<div>Message Monitoring Policy - Coming Soon</div>} />
            <Route path="/legal/suspension" element={<div>Account Suspension Policy - Coming Soon</div>} />
            <Route path="/legal/appeals" element={<div>Appeals Process - Coming Soon</div>} />
            <Route path="/legal/inactive-accounts" element={<div>Inactive Account Policy - Coming Soon</div>} />
            <Route path="/legal/liability" element={<div>Liability Disclaimer - Coming Soon</div>} />
            <Route path="/legal/background-check" element={<div>Background Check Disclaimer - Coming Soon</div>} />
            <Route path="/legal/health-safety" element={<div>Health & Safety Disclaimer - Coming Soon</div>} />
            <Route path="/legal/dmca" element={<div>DMCA Policy - Coming Soon</div>} />
            <Route path="/legal/subscription" element={<div>Subscription Policy - Coming Soon</div>} />
            <Route path="/legal/refunds" element={<div>Refund Policy - Coming Soon</div>} />
            <Route path="/legal/billing" element={<div>Billing Terms - Coming Soon</div>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
