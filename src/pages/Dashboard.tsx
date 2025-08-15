
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Crown, Settings, Bell, Search, Filter } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import ProfileSetupSection from '@/components/dashboard/ProfileSetupSection';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import ProfileSetupView from '@/components/dashboard/ProfileSetupView';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { useAlert } from '@/components/providers/AlertProvider';
import MembershipBadge from '@/components/profile/MembershipBadge';
import { useMembershipBadge } from '@/hooks/useMembershipBadge';
import Logo from '@/components/ui/logo';
import PhotoUploadDebug from '@/components/debug/PhotoUploadDebug';


const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { membershipLevel, loading: badgeLoading } = useMembershipBadge();

  // Show welcome message once per session
  useEffect(() => {
    if (user && !loading) {
      const welcomeShownKey = `welcome_shown_${user.id}`;
      const lastWelcomeDate = sessionStorage.getItem(welcomeShownKey);
      const today = new Date().toDateString();
      
      // Only show if we haven't shown it today in this session
      if (lastWelcomeDate !== today) {
        const showWelcomeAlert = () => {
          const currentHour = new Date().getHours();
          const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
          
          showAlert({
            type: 'welcome',
            title: `${greeting}, ${user.user_metadata?.first_name || 'Executive'}!`,
            message: "Welcome back to your executive dating command center. You have 3 new matches waiting.",
            actionText: "View Matches",
            onAction: () => navigate('/matches'),
            autoHide: true,
            duration: 6000,
            showBadge: true,
            badgeText: "3 New"
          });
          
          // Mark as shown for this session and date
          sessionStorage.setItem(welcomeShownKey, today);
        };

        // Small delay to ensure smooth page load
        setTimeout(showWelcomeAlert, 1000);
      }
    }
  }, [user, loading, showAlert, navigate]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);


  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <span className="text-purple-300">Loading dashboard...</span>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="lg" showText={false} />
              <div>
                <h1 className="text-3xl font-bold text-white">Executive Dashboard</h1>
                <p className="text-purple-300 text-sm">Your professional dating command center</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!badgeLoading && (
                <MembershipBadge 
                  membershipLevel={membershipLevel} 
                  size="md"
                  className="bg-opacity-20 backdrop-blur-xl"
                />
              )}
              
              <button 
                onClick={() => setShowNotifications(true)}
                className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all"
              >
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </button>
              
              <button 
                onClick={() => navigate('/settings')}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <WelcomeSection user={user} />
          <ProfileSetupSection onStartProfileSetup={() => setShowProfileSetup(true)} />
          
          {/* Debug Photo Upload - Remove in production */}
          <div className="mb-8">
            <PhotoUploadDebug />
          </div>
          <DashboardGrid />

          {/* Additional Info */}
          <div className="text-center mt-12 max-w-2xl mx-auto">
            <p className="text-gray-300">
              Your journey to finding meaningful executive connections starts here. Each feature is designed 
              to help you build authentic relationships based on deep compatibility and professional synergy.
            </p>
          </div>
        </div>
      </main>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default Dashboard;
