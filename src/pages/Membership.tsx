
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MembershipPlans from '@/components/membership/MembershipPlans';

const Membership = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Luvlang</h2>
            </div>
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

        <MembershipPlans />
      </div>
    </div>
  );
};

export default Membership;
