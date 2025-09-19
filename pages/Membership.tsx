
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProfessionalMembershipPlans from '@/components/membership/ProfessionalMembershipPlans';
import { ArrowLeft, Crown, Shield, Settings } from 'lucide-react';
import Logo from '@/components/ui/logo';
import MembershipBadge from '@/components/profile/MembershipBadge';
import { useMembershipBadge } from '@/hooks/useMembershipBadge';

const Membership = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { membershipLevel, loading: badgeLoading } = useMembershipBadge();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <button className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </Link>
              <Logo size="lg" showText={false} />
              <div>
                <h1 className="text-3xl font-bold text-white">Membership</h1>
                <p className="text-purple-300 text-sm">Unlock premium executive features</p>
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
          <ProfessionalMembershipPlans />
        </div>
      </main>
    </div>
  );
};

export default Membership;
