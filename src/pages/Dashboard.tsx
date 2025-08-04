
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Crown, Settings, Bell, Search, Filter } from 'lucide-react';
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
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Executive Dashboard</h1>
                <p className="text-purple-300 text-sm">Your professional dating command center</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl px-4 py-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Executive Verified</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-xl px-4 py-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">C-Suite Premium</span>
              </div>
              
              <button className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all">
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              
              <button 
                onClick={signOut}
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
    </div>
  );
};

export default Dashboard;
