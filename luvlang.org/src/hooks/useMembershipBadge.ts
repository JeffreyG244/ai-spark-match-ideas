import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type MembershipLevel = 'basic' | 'premium' | 'executive' | 'c_suite';

export const useMembershipBadge = (userId?: string) => {
  const { user } = useAuth();
  const [membershipLevel, setMembershipLevel] = useState<MembershipLevel>('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }
    
    fetchMembershipLevel();
  }, [targetUserId]);

  const fetchMembershipLevel = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .select('membership_verification')
        .eq('id', targetUserId)
        .single();

      if (error) {
        console.error('Error fetching membership level:', error);
        setError('Failed to fetch membership level');
        return;
      }

      setMembershipLevel(data?.membership_verification || 'basic');
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    membershipLevel,
    loading,
    error,
    refetch: fetchMembershipLevel
  };
};