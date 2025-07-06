
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
import PasswordResetTest from '@/components/auth/PasswordResetTest';
import SystemHealthDashboard from '@/components/admin/SystemHealthDashboard';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: 'var(--love-gradient-bg)' }}>
      <div className="container mx-auto px-6 py-8">
        <Navigation />

        {user && <UserDashboard />}

        <HeroSection showButtons={!user} />

        {!user && <FreeAccountCTA />}

        <StatsSection />

        <FeaturesSection />

        <HowItWorksSection />

        <TestimonialsSection />

        {/* Temporary System Admin Panel - Remove after testing */}
        {user && (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-6 text-center">🔧 Admin Panel (Testing)</h2>
            <SystemHealthDashboard />
          </div>
        )}

        {/* Temporary Password Reset Test - Remove after testing */}
        <div className="flex justify-center py-8">
          <PasswordResetTest />
        </div>

        <CallToAction showButton={!user} />
      </div>
    </div>
  );
};

export default Index;
