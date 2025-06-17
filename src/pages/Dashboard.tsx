
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import ProfileSetupSection from '@/components/dashboard/ProfileSetupSection';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import ProfileSetupView from '@/components/dashboard/ProfileSetupView';

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  if (showProfileSetup) {
    return (
      <ProfileSetupView 
        onBack={() => setShowProfileSetup(false)}
        onSignOut={signOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        <DashboardHeader onSignOut={signOut} />
        <WelcomeSection user={user} />
        <ProfileSetupSection onStartProfileSetup={() => setShowProfileSetup(true)} />
        <DashboardGrid />

        {/* Additional Info */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-gray-600">
            Your journey to finding meaningful connections starts here. Each feature is designed 
            to help you build authentic relationships based on deep compatibility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
