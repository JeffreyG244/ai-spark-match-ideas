
import React from 'react';
import { useAuth } from "@/hooks/useAuth";
import Navigation from '@/components/home/Navigation';
import UserDashboard from '@/components/home/UserDashboard';
import HeroSection from '@/components/home/HeroSection';
import FreeAccountCTA from '@/components/home/FreeAccountCTA';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CallToAction from '@/components/home/CallToAction';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <Navigation />

        {user && <UserDashboard />}

        <HeroSection showButtons={!user} />

        {!user && <FreeAccountCTA />}

        <StatsSection />

        <FeaturesSection />

        <HowItWorksSection />

        <TestimonialsSection />

        <CallToAction showButton={!user} />
      </div>
    </div>
  );
};

export default Index;
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false  # This is set to false
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false  # This is set to false
