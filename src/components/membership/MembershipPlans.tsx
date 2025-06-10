
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import BillingCycleToggle from './BillingCycleToggle';
import PlanCard from './PlanCard';
import SubscriptionStatus from './SubscriptionStatus';

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

const MembershipPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    fetchPlans();
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .order('monthly_price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Subscription check error:', error);
        throw error;
      }
      
      if (data?.subscribed) {
        setUserSubscription({
          plan_id: data.plan_type === 'plus' ? 2 : data.plan_type === 'premium' ? 3 : 1,
          status: data.status,
          current_period_end: data.subscription_end
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to check subscription status');
    }
  };

  const handlePlanSelect = async (plan: MembershipPlan) => {
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
        
        // Provide specific error messages based on the error
        if (error.message?.includes('Stripe secret key')) {
          toast.error('Payment system configuration error. Please contact support.');
        } else if (error.message?.includes('Invalid plan type')) {
          toast.error('Selected plan is not available. Please try a different plan.');
        } else if (error.message?.includes('User not authenticated')) {
          toast.error('Please sign in again to continue.');
        } else {
          toast.error(`Payment setup failed: ${error.message}`);
        }
        return;
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        
        // Show success message before redirect
        toast.success('Redirecting to secure payment...');
        
        // Small delay to show the toast, then redirect
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
      toast.error(`Failed to start checkout: ${errorMessage}`);
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Customer portal error:', error);
        throw error;
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-600 mb-6">Find your perfect match with the right features for you</p>
        
        <BillingCycleToggle 
          billingCycle={billingCycle}
          setBillingCycle={setBillingCycle}
        />

        {user && userSubscription && userSubscription.plan_id > 1 && (
          <div className="flex justify-center mb-6">
            <Button
              onClick={handleManageSubscription}
              variant="outline"
              size="sm"
            >
              Manage Subscription
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = getCurrentPlanId() === plan.id;
          const isProcessing = processingPayment === plan.name;

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={isCurrentPlan}
              isProcessing={isProcessing}
              user={user}
              onPlanSelect={handlePlanSelect}
            />
          );
        })}
      </div>

      <SubscriptionStatus userSubscription={userSubscription} />
    </div>
  );
};

export default MembershipPlans;
