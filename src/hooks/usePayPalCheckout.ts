
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { loadPayPalScript, createPayPalContainer, cleanupPayPalContainer } from '@/utils/paypal';
import type { MembershipPlan, BillingCycle } from '@/types/membership';

export const usePayPalCheckout = (checkSubscriptionStatus: () => Promise<void>) => {
  const { user } = useAuth();
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  const handlePlanSelect = async (plan: MembershipPlan, billingCycle: BillingCycle) => {
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
      console.log('PayPal SDK loaded successfully');

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

      const { paypalContainer, overlay } = createPayPalContainer();

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
            
            await checkSubscriptionStatus();
            
          } catch (error) {
            console.error('Error in payment capture:', error);
            toast.error('Payment processing failed. Please contact support.');
          } finally {
            cleanupPayPalContainer(paypalContainer, overlay);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          toast.error('Payment failed. Please try again.');
          cleanupPayPalContainer(paypalContainer, overlay);
        },
        onCancel: () => {
          console.log('Payment cancelled by user');
          toast.info('Payment cancelled');
          cleanupPayPalContainer(paypalContainer, overlay);
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

  return {
    processingPayment,
    handlePlanSelect,
    handleManageSubscription
  };
};
