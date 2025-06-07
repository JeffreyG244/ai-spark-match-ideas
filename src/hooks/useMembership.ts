
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MembershipPlan {
  id: number;
  name: string;
  monthly_price: number;
  features: any;
}

interface UserSubscription {
  plan_id: number;
  status: string;
  current_period_end: string;
}

export const useMembership = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<MembershipPlan | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserMembership();
    } else {
      // Default to free plan for non-authenticated users
      fetchFreePlan();
    }
  }, [user]);

  const fetchFreePlan = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('name', 'Free')
        .single();

      if (error) throw error;
      setCurrentPlan(data);
    } catch (error) {
      console.error('Error fetching free plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMembership = async () => {
    if (!user) return;

    try {
      // Get user subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;

      setSubscription(subscriptionData);

      // Get plan details
      const planId = subscriptionData?.plan_id || 1; // Default to Free plan (id: 1)
      const { data: planData, error: planError } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      setCurrentPlan(planData);
    } catch (error) {
      console.error('Error fetching user membership:', error);
      // Fallback to free plan
      fetchFreePlan();
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureName: string): boolean => {
    if (!currentPlan?.features) return false;
    
    const feature = currentPlan.features[featureName];
    if (typeof feature === 'boolean') return feature;
    if (typeof feature === 'object' && feature?.unlimited) return true;
    return false;
  };

  const getFeatureLimit = (featureName: string): number | null => {
    if (!currentPlan?.features) return null;
    
    const feature = currentPlan.features[featureName];
    if (typeof feature === 'object' && feature?.daily_limit) {
      return feature.daily_limit;
    }
    if (typeof feature === 'number') return feature;
    return null;
  };

  const isPremiumUser = (): boolean => {
    return currentPlan?.name !== 'Free';
  };

  return {
    currentPlan,
    subscription,
    loading,
    hasFeature,
    getFeatureLimit,
    isPremiumUser,
    refetch: fetchUserMembership
  };
};
