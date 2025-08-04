
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, useSearchParams } from 'react-router-dom';
import { loadPayPalScript, createPayPalContainer, cleanupPayPalContainer, createPayPalHostedButton } from '@/utils/paypal';
import { logger } from '@/utils/logger';
import type { MembershipPlan, BillingCycle } from '@/types/membership';

// Real PayPal Hosted Button IDs from your PayPal Business account
const HOSTED_BUTTON_IDS = {
  plus: {
    monthly: 'VXK6T685HD2K6', // Plus Plan monthly button
    annual: 'VXK6T685HD2K6'   // Using same button for now - create separate annual button if needed
  },
  premium: {
    monthly: 'R9JUL65GYT282', // Premium Plan monthly button
    annual: 'R9JUL65GYT282'   // Using same button for now - create separate annual button if needed
  }
};

export const usePayPalCheckout = (checkSubscriptionStatus: () => Promise<void>) => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  // Handle PayPal return states
  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    
    if (success === 'true') {
      toast.success('Payment completed! Your subscription is being activated.');
      setProcessingPayment(null);
      checkSubscriptionStatus();
    } else if (cancelled === 'true') {
      toast.info('Payment was cancelled. You can try again anytime.');
      setProcessingPayment(null);
    } else if (processingPayment) {
      // Clear processing state if user navigated back without URL params
      const timer = setTimeout(() => {
        setProcessingPayment(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, processingPayment, checkSubscriptionStatus]);

  // Clear processing state when user leaves membership page
  useEffect(() => {
    if (location.pathname !== '/membership') {
      setProcessingPayment(null);
    }
  }, [location.pathname]);

  const handlePlanSelect = async (plan: MembershipPlan, billingCycle: BillingCycle) => {
    // Check if we're on the membership page
    if (location.pathname !== '/membership') {
      toast.error('Please navigate to the membership page to upgrade your plan');
      return;
    }

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
      logger.log('Starting PayPal Hosted Button checkout for:', { 
        plan: plan.name, 
        billingCycle,
        userId: user.id,
        currentPath: location.pathname
      });
      
      const planType = plan.name.toLowerCase() as 'plus' | 'premium';
      
      if (!['plus', 'premium'].includes(planType)) {
        throw new Error('Invalid plan type selected');
      }

      // Simple setup - no complex SDK loading needed
      await loadPayPalScript();
      
      // Get the hosted button ID for the selected plan and billing cycle
      const hostedButtonId = HOSTED_BUTTON_IDS[planType][billingCycle];
      
      logger.log('Using PayPal button ID:', hostedButtonId);

      const { paypalContainer, overlay } = createPayPalContainer();

      // Add a close button to the modal
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px';
      closeButton.style.right = '15px';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.style.color = '#666';
      closeButton.style.width = '30px';
      closeButton.style.height = '30px';
      closeButton.style.display = 'flex';
      closeButton.style.alignItems = 'center';
      closeButton.style.justifyContent = 'center';
      closeButton.style.borderRadius = '50%';
      closeButton.style.transition = 'all 0.2s';
      
      closeButton.addEventListener('mouseenter', () => {
        closeButton.style.backgroundColor = '#f0f0f0';
        closeButton.style.color = '#333';
      });
      
      closeButton.addEventListener('mouseleave', () => {
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.color = '#666';
      });
      
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
      title.style.textAlign = 'center';
      title.style.fontSize = '18px';
      title.style.fontWeight = 'bold';
      paypalContainer.appendChild(title);

      // Add payment options info
      const paymentInfo = document.createElement('div');
      const paymentContainer = document.createElement('div');
      paymentContainer.style.display = 'flex';
      paymentContainer.style.justifyContent = 'center';
      paymentContainer.style.gap = '5px';
      paymentContainer.style.marginBottom = '15px';
      paymentContainer.style.flexWrap = 'wrap';
      
      const paypalImg = document.createElement('img');
      paypalImg.src = 'https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png';
      paypalImg.alt = 'PayPal';
      paypalImg.style.height = '20px';
      
      const cardImg = document.createElement('img');
      cardImg.src = 'https://www.paypalobjects.com/webstatic/en_US/i/buttons/cc-badges-ppmcvdam.png';
      cardImg.alt = 'Credit Cards';
      cardImg.style.height = '20px';
      
      paymentContainer.appendChild(paypalImg);
      paymentContainer.appendChild(cardImg);
      paymentInfo.appendChild(paymentContainer);
      paypalContainer.appendChild(paymentInfo);

      // Create the PayPal hosted button
      createPayPalHostedButton('paypal-button-container', hostedButtonId);
      logger.log('PayPal hosted button rendered successfully');

      // Note: Payment completion will be handled by PayPal webhooks
      // The subscription status will be updated automatically when payment is confirmed

    } catch (error) {
      logger.error('PayPal checkout error:', error);
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
