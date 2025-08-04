import React from 'react';
import ProfessionalMatchingDashboard from '@/components/professional/ProfessionalMatchingDashboard';
import NavigationTabs from '@/components/navigation/NavigationTabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ProfessionalMatches = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-love-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-love-background">
      <NavigationTabs />
      <div className="pt-16">
        <ProfessionalMatchingDashboard />
      </div>
    </div>
  );
};

export default ProfessionalMatches;