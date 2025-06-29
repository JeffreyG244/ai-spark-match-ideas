
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/pre-launch-audit" element={<PreLaunchAudit />} />
            <Route path="/seed-users" element={<SeedUsers />} />
            
            {/* Legal Routes */}
            <Route path="/legal/terms" element={<TermsOfService />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/community" element={<CommunityGuidelines />} />
            <Route path="/legal/safety" element={<SafetyGuidelines />} />
            <Route path="/legal/cookies" element={<CookiePolicy />} />
            <Route path="/legal/gdpr" element={<GDPR />} />
            <Route path="/legal/ccpa" element={<CCPA />} />
            <Route path="/legal/data-retention" element={<DataRetention />} />
            <Route path="/legal/intellectual-property" element={<IntellectualProperty />} />
            <Route path="/legal/content-moderation" element={<ContentModerationPolicy />} />
            <Route path="/legal/message-monitoring" element={<MessageMonitoring />} />
            <Route path="/legal/photo-verification" element={<PhotoVerification />} />
            <Route path="/legal/identity-verification" element={<IdentityVerificationPolicy />} />
            <Route path="/legal/age-verification" element={<AgeVerificationPolicy />} />
            <Route path="/legal/blocking-reporting" element={<BlockingReportingPolicy />} />
            <Route path="/legal/romance-scam-prevention" element={<RomanceScamPrevention />} />
            <Route path="/legal/account-suspension" element={<AccountSuspension />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
import { useState } from "react";

export default function UserProfileForm() {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    location: "",
    interests: "",
    values: "",
    relationship_goals: "",
    partner_preferences: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(form).some((val) => val.trim() === "")) {
      alert("Please fill out all fields before continuing.");
      return;
    }

    const response = await fetch("/api/matchmaker", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow">
      <input name="age" placeholder="e.g. 29" onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="gender" placeholder="e.g. Female, Non-Binary" onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="location" placeholder="e.g. St. Louis, MO" onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="interests" placeholder="e.g. Hiking, Music" onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="values" placeholder="e.g. Honesty, Ambition" onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="relationship_goals" placeholder="e.g. Long-term" onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="partner_preferences" placeholder="e.g. Men, ages 30–40, likes hiking" onChange={handleChange} className="w-full p-2 border rounded" />
      <button type="submit" className="bg-pink-600 text-white p-2 rounded w-full hover:bg-pink-700">Submit Profile</button>
    </form>
  );
}
