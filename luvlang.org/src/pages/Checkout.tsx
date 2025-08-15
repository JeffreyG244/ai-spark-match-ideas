
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, ArrowLeft, Check, Star, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PlanDetails {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  color: string;
  isPopular: boolean;
}

const planDetails: Record<string, PlanDetails> = {
  plus: {
    name: 'Plus',
    monthlyPrice: 24.99,
    annualPrice: 239.90,
    features: [
      'Unlimited swipes',
      '50 messaging credits',
      '5 super likes per day',
      '1 boost per month',
      'Advanced filters',
      'Rewind feature'
    ],
    color: '#7C3AED',
    isPopular: true
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 49.99,
    annualPrice: 479.90,
    features: [
      'Everything in Plus',
      'Unlimited messaging',
      'Unlimited super likes',
      'Unlimited boosts',
      'See who likes you',
      'Priority support',
      'Incognito mode',
      'Travel mode'
    ],
    color: '#F59E0B',
    isPopular: false
  }
};

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const planType = searchParams.get('plan') as 'plus' | 'premium';

  useEffect(() => {
    if (!planType || !planDetails[planType]) {
      navigate('/membership');
      return;
    }

    if (!user) {
      navigate('/auth');
      return;
    }
  }, [planType, user, navigate]);

  if (!planType || !planDetails[planType]) {
    return null;
  }

  const plan = planDetails[planType];
  const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const savings = billingCycle === 'annual' ? (plan.monthlyPrice * 12) - plan.annualPrice : 0;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/auth');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting checkout process...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType,
          billingCycle: billingCycle === 'annual' ? 'yearly' : 'monthly'
        }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received:', data);
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout process';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/membership')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Plans
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Luvlang Checkout</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Plan Summary Card */}
          <Card className={`mb-6 ${plan.isPopular ? 'border-2 border-purple-500 shadow-lg' : 'border-2 border-yellow-500 shadow-lg'}`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Most Popular
                </div>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-3xl" style={{ color: plan.color }}>
                {plan.name} Plan
              </CardTitle>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gray-900">
                  ${price.toFixed(2)}
                  <span className="text-lg text-gray-500">
                    /{billingCycle === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
                {billingCycle === 'annual' && savings > 0 && (
                  <p className="text-green-600 font-medium">
                    Save ${savings.toFixed(2)} per year!
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing Cycle Toggle */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Billing Cycle</CardTitle>
              <CardDescription>Choose your preferred billing frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => setBillingCycle('monthly')}
                  variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                  className="flex-1"
                  style={{
                    backgroundColor: billingCycle === 'monthly' ? plan.color : undefined
                  }}
                >
                  Monthly - ${plan.monthlyPrice}/month
                </Button>
                <Button
                  onClick={() => setBillingCycle('annual')}
                  variant={billingCycle === 'annual' ? 'default' : 'outline'}
                  className="flex-1"
                  style={{
                    backgroundColor: billingCycle === 'annual' ? plan.color : undefined
                  }}
                >
                  Annual - ${plan.annualPrice}/year
                  {savings > 0 && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Save ${savings.toFixed(0)}
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full text-lg py-6"
                style={{ backgroundColor: plan.color }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Secure payment powered by Stripe. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
