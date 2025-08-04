
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProfessionalMembershipPlans from '@/components/membership/ProfessionalMembershipPlans';
import Logo from '@/components/ui/logo';

const Membership = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-love-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-primary"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-love-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline">← Back to Dashboard</Button>
              </Link>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <ProfessionalMembershipPlans />
      </div>
    </div>
  );
};

export default Membership;
