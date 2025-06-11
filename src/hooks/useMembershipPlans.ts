
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MembershipPlan {
  id: number;
  name: string;
  price_id: string | null;
  monthly_price: number;
  annual_price: number | null;
  features: any;
  highlight_color: string | null;
  is_popular: boolean;
}

interface UserSubscription {
  plan_id: number;
  status: string;
  current_period_end: string;
}

export const useMembershipPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      console.log('Fetching membership plans...');
      setError(null);
      
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .order('monthly_price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        setError(`Failed to load plans: ${error.message}`);
        return;
      }
      
      console.log('Plans fetched successfully:', data?.length, data);
      
      if (!data || data.length === 0) {
        console.warn('No membership plans found in database');
        setError('No membership plans available');
        return;
      }
      
      setPlans(data);
    } catch (error) {
      console.error('Unexpected error fetching plans:', error);
      setError('An unexpected error occurred while loading plans');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      console.log('Checking subscription status for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        console.log('Continuing without subscription data');
        return;
      }
      
      console.log('Subscription check response:', data);
      
      if (data?.subscribed) {
        setUserSubscription({
          plan_id: data.plan_type === 'plus' ? 2 : data.plan_type === 'premium' ? 3 : 1,
          status: data.status,
          current_period_end: data.subscription_end
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      console.log('Subscription check failed, continuing without subscription data');
    }
  };

  const handlePlanSelect = async (plan: MembershipPlan, billingCycle: 'monthly' | 'annual') => {
    if (!user) {
      toast.error('Please sign in to upgrade your plan');
      return;
    }

    if (plan.name === 'Free') {
      toast.info('You\'re already on the free plan');
      return;
    }

    setProcessingPayment(plan.name);
    
    try {
      console.log('=== CHECKOUT PROCESS STARTED ===');
      console.log('User:', { id: user.id, email: user.email });
      console.log('Plan:', plan.name);
      console.log('Billing cycle:', billingCycle);
      
      const planType = plan.name.toLowerCase();
      
      if (!['plus', 'premium'].includes(planType)) {
        throw new Error('Invalid plan type selected');
      }
      
      const requestBody = {
        planType,
        billingCycle: billingCycle === 'annual' ? 'yearly' : 'monthly'
      };
      
      console.log('Sending request to create-checkout:', requestBody);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: requestBody
      });

      console.log('=== CHECKOUT RESPONSE ===');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Checkout creation error:', error);
        
        if (error.message?.includes('Stripe secret key') || error.message?.includes('Stripe configuration')) {
          toast.error('Payment system configuration error. Please contact support.');
        } else if (error.message?.includes('Invalid plan type')) {
          toast.error('Selected plan is not available. Please try a different plan.');
        } else if (error.message?.includes('User not authenticated')) {
          toast.error('Please sign in again to continue.');
        } else if (error.message?.includes('Invalid JSON response')) {
          toast.error('System configuration error. Please contact support.');
        } else {
          toast.error(`Payment setup failed: ${error.message || 'Unknown error'}`);
        }
        return;
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        toast.success('Redirecting to secure payment...');
        
        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      } else {
        console.error('No checkout URL received:', data);
        toast.error('Payment system error. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error in checkout process:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      if (errorMessage.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('Invalid JSON response')) {
        toast.error('System configuration error. Please contact support.');
      } else {
        toast.error(`Failed to start checkout: ${errorMessage}`);
      }
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      console.log('Opening customer portal for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Customer portal error:', error);
        toast.error('Failed to open subscription management');
        return;
      }
      
      if (data?.url) {
        console.log('Opening customer portal:', data.url);
        window.open(data.url, '_blank');
      } else {
        console.error('No portal URL received:', data);
        toast.error('Failed to open subscription management');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
    }
  };

  const getCurrentPlanId = () => {
    if (!userSubscription) return 1;
    return userSubscription.plan_id;
  };

  return {
    plans,
    userSubscription,
    loading,
    error,
    processingPayment,
    fetchPlans,
    handlePlanSelect,
    handleManageSubscription,
    getCurrentPlanId
  };
};
