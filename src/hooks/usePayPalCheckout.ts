
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { loadPayPalScript, createPayPalContainer, cleanupPayPalContainer, createPayPalHostedButton } from '@/utils/paypal';
import type { MembershipPlan, BillingCycle } from '@/types/membership';

// Hosted Button IDs for each plan and billing cycle
const HOSTED_BUTTON_IDS = {
  plus: {
    monthly: 'TCWAT7B8BF4U4', // Replace with your actual hosted button ID for Plus Monthly
    annual: 'TCWAT7B8BF4U4'   // Replace with your actual hosted button ID for Plus Annual
  },
  premium: {
    monthly: 'TCWAT7B8BF4U4', // Replace with your actual hosted button ID for Premium Monthly
    annual: 'TCWAT7B8BF4U4'   // Replace with your actual hosted button ID for Premium Annual
  }
};

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
      console.log('=== PAYPAL HOSTED BUTTON CHECKOUT STARTED ===');
      console.log('User:', { id: user.id, email: user.email });
      console.log('Plan:', plan.name);
      console.log('Billing cycle:', billingCycle);
      
      const planType = plan.name.toLowerCase() as 'plus' | 'premium';
      
      if (!['plus', 'premium'].includes(planType)) {
        throw new Error('Invalid plan type selected');
      }

      await loadPayPalScript();
      console.log('PayPal SDK loaded successfully');

      // Get the hosted button ID for the selected plan and billing cycle
      const hostedButtonId = HOSTED_BUTTON_IDS[planType][billingCycle];
      
      if (!hostedButtonId) {
        throw new Error('Hosted button ID not configured for this plan');
      }

      const { paypalContainer, overlay } = createPayPalContainer();

      // Add a close button to the modal
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '15px';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.color = '#666';
      closeButton.onclick = () => {
        cleanupPayPalContainer(paypalContainer, overlay);
        setProcessingPayment(null);
      };
      paypalContainer.appendChild(closeButton);

      // Add title
      const title = document.createElement('h3');
      title.textContent = `Complete your ${plan.name} ${billingCycle} subscription`;
      title.style.marginTop = '0';
      title.style.marginBottom = '20px';
      title.style.color = '#333';
      paypalContainer.appendChild(title);

      // Create the PayPal hosted button
      createPayPalHostedButton('paypal-button-container', hostedButtonId);

      console.log('PayPal hosted button rendered with ID:', hostedButtonId);

      // Set up a listener for successful payments (this would typically come from webhooks)
      // For now, we'll just show a success message after a delay
      setTimeout(() => {
        toast.success('Payment completed! Your subscription is now active.');
        checkSubscriptionStatus();
        cleanupPayPalContainer(paypalContainer, overlay);
        setProcessingPayment(null);
      }, 10000); // Remove this in production - payments should be confirmed via webhooks

    } catch (error) {
      console.error('Error in checkout process:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to start checkout: ${errorMessage}`);
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
