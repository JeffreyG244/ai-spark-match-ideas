
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MembershipPlan {
  id: number;
  name: string;
  paypal_plan_id: string | null;
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

declare global {
  interface Window {
    paypal: any;
  }
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

  const loadPayPalScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.paypal) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD&intent=capture';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
      document.head.appendChild(script);
    });
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
      console.log('=== PAYPAL CHECKOUT PROCESS STARTED ===');
      console.log('User:', { id: user.id, email: user.email });
      console.log('Plan:', plan.name);
      console.log('Billing cycle:', billingCycle);
      
      const planType = plan.name.toLowerCase();
      
      if (!['plus', 'premium'].includes(planType)) {
        throw new Error('Invalid plan type selected');
      }

      await loadPayPalScript();

      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          planType,
          billingCycle: billingCycle === 'annual' ? 'yearly' : 'monthly'
        }
      });

      if (orderError) {
        console.error('Order creation error:', orderError);
        toast.error(`Payment setup failed: ${orderError.message || 'Unknown error'}`);
        return;
      }

      if (!orderData?.orderID) {
        console.error('No order ID received:', orderData);
        toast.error('Payment system error. Please try again.');
        return;
      }

      console.log('PayPal order created:', orderData.orderID);

      // Create PayPal button
      const paypalContainer = document.createElement('div');
      paypalContainer.id = 'paypal-button-container';
      document.body.appendChild(paypalContainer);

      window.paypal.Buttons({
        createOrder: () => orderData.orderID,
        onApprove: async (data: any) => {
          try {
            console.log('Payment approved, capturing...');
            
            const { data: captureData, error: captureError } = await supabase.functions.invoke('capture-paypal-payment', {
              body: {
                orderID: data.orderID,
                planType,
                billingCycle: billingCycle === 'annual' ? 'yearly' : 'monthly'
              }
            });

            if (captureError) {
              console.error('Payment capture error:', captureError);
              toast.error('Payment processing failed. Please contact support.');
              return;
            }

            console.log('Payment captured successfully:', captureData);
            toast.success('Payment successful! Your subscription is now active.');
            
            // Refresh subscription status
            await checkSubscriptionStatus();
            
          } catch (error) {
            console.error('Error in payment capture:', error);
            toast.error('Payment processing failed. Please contact support.');
          } finally {
            document.body.removeChild(paypalContainer);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          toast.error('Payment failed. Please try again.');
          document.body.removeChild(paypalContainer);
        },
        onCancel: () => {
          console.log('Payment cancelled by user');
          toast.info('Payment cancelled');
          document.body.removeChild(paypalContainer);
        }
      }).render('#paypal-button-container');

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

    toast.info('To manage your PayPal subscription, please log into your PayPal account and visit the subscription management section.');
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
