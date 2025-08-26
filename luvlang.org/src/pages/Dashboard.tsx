import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProfileSetupSection from '@/components/dashboard/ProfileSetupSection';
import ProfileSetupView from '@/components/dashboard/ProfileSetupView';

const Dashboard = () => {
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleStartProfileSetup = () => {
    setShowProfileSetup(true);
  };

  const handleBackToDashboard = () => {
    setShowProfileSetup(false);
  };

  if (showProfileSetup) {
    return (
      <ProfileSetupView 
        onBack={handleBackToDashboard}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-love-background">
      <div className="container mx-auto p-6">
        <DashboardHeader onSignOut={handleSignOut} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProfileSetupSection onStartProfileSetup={handleStartProfileSetup} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;