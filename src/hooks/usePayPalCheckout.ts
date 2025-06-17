
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { loadPayPalScript, createPayPalContainer, cleanupPayPalContainer, createPayPalHostedButton } from '@/utils/paypal';
import type { MembershipPlan, BillingCycle } from '@/types/membership';

// TODO: Replace these placeholder IDs with your actual PayPal Hosted Button IDs
// Create these in your PayPal Business account under Tools > PayPal Buttons
const HOSTED_BUTTON_IDS = {
  plus: {
    monthly: 'YOUR_PLUS_MONTHLY_BUTTON_ID', // Replace with actual ID
    annual: 'YOUR_PLUS_ANNUAL_BUTTON_ID'   // Replace with actual ID
  },
  premium: {
    monthly: 'YOUR_PREMIUM_MONTHLY_BUTTON_ID', // Replace with actual ID
    annual: 'YOUR_PREMIUM_ANNUAL_BUTTON_ID'   // Replace with actual ID
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
      console.log('Starting PayPal Hosted Button checkout for:', { 
        plan: plan.name, 
        billingCycle,
        userId: user.id 
      });
      
      const planType = plan.name.toLowerCase() as 'plus' | 'premium';
      
      if (!['plus', 'premium'].includes(planType)) {
        throw new Error('Invalid plan type selected');
      }

      await loadPayPalScript();

      // Get the hosted button ID for the selected plan and billing cycle
      const hostedButtonId = HOSTED_BUTTON_IDS[planType][billingCycle];
      
      if (!hostedButtonId || hostedButtonId.startsWith('YOUR_')) {
        toast.error('PayPal button not configured for this plan. Please contact support.');
        setProcessingPayment(null);
        return;
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

      console.log('PayPal hosted button rendered successfully');

      // Note: Payment completion will be handled by PayPal webhooks
      // The subscription status will be updated automatically when payment is confirmed

    } catch (error) {
      console.error('PayPal checkout error:', error);
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
