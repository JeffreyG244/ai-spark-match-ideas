
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Loader2 } from 'lucide-react';
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
        // Update local subscription state
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
      const planType = plan.name.toLowerCase(); // 'plus' or 'premium'
      
      if (!['plus', 'premium'].includes(planType)) {
        throw new Error('Invalid plan type');
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planType,
          billingCycle: billingCycle === 'annual' ? 'yearly' : 'monthly'
        }
      });

      if (error) {
        console.error('Checkout creation error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout process';
      toast.error(errorMessage);
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

  const formatFeature = (key: string, value: any) => {
    switch (key) {
      case 'swipes':
        if (value.unlimited) return 'Unlimited swipes';
        if (value.daily_limit) return `${value.daily_limit} daily swipes`;
        return null;
      case 'messaging':
        if (value === 'unlimited') return 'Unlimited messaging';
        if (value === 'matches_only') return 'Message matches only';
        if (value.credits) return `${value.credits} messaging credits`;
        return null;
      case 'super_likes':
        if (typeof value === 'object' && value.unlimited) return 'Unlimited super likes';
        if (typeof value === 'number') return `${value} super like${value !== 1 ? 's' : ''} per day`;
        return null;
      case 'boosts':
        if (typeof value === 'object' && value.unlimited) return 'Unlimited boosts';
        if (typeof value === 'number' && value > 0) return `${value} boost${value !== 1 ? 's' : ''} per month`;
        if (typeof value === 'number' && value === 0) return null;
        return null;
      case 'advanced_filters':
        return value ? 'Advanced filters' : null;
      case 'see_likes':
        return value ? 'See who likes you' : null;
      case 'rewind':
        return value ? 'Rewind feature' : null;
      case 'priority':
        return value ? 'Priority support' : null;
      case 'incognito':
        return value ? 'Incognito mode' : null;
      case 'travel_mode':
        return value ? 'Travel mode' : null;
      default:
        return null;
    }
  };

  const getPrice = (plan: MembershipPlan) => {
    if (plan.monthly_price === 0) return 'Free';
    const price = billingCycle === 'annual' ? (plan.annual_price || 0) : plan.monthly_price;
    const period = billingCycle === 'annual' ? '/year' : '/month';
    return `$${price.toFixed(2)}${period}`;
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
        
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-white shadow-sm text-purple-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingCycle === 'annual' 
                  ? 'bg-white shadow-sm text-purple-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual (20% off)
            </button>
          </div>
        </div>

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
          const features = Object.entries(plan.features || {});
          const isProcessing = processingPayment === plan.name;
          const isPremium = plan.name === 'Premium';
          const isPlus = plan.name === 'Plus';

          return (
            <Card 
              key={plan.id} 
              className={`relative ${
                isPlus ? 'border-2 border-purple-500 shadow-lg' : 
                isPremium ? 'border-2 border-yellow-500 shadow-lg' :
                'border-purple-200'
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white border-purple-500">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle 
                  className="text-2xl"
                  style={{ color: isPlus ? '#7C3AED' : plan.highlight_color || '#7C3AED' }}
                >
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-3xl font-bold text-gray-900">
                  {getPrice(plan)}
                </CardDescription>
                {billingCycle === 'annual' && plan.monthly_price > 0 && plan.annual_price && (
                  <p className="text-sm text-gray-500">
                    Save ${((plan.monthly_price * 12) - plan.annual_price).toFixed(2)} per year
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 min-h-[200px]">
                  {features.map(([key, value]) => {
                    const featureText = formatFeature(key, value);
                    if (!featureText) return null;
                    
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{featureText}</span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan || isProcessing || !user}
                  style={{
                    backgroundColor: !isCurrentPlan ? (isPlus ? '#7C3AED' : plan.highlight_color || '#7C3AED') : undefined
                  }}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : !user ? (
                    'Sign In Required'
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {userSubscription && (
        <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900">Current Subscription</h3>
          <p className="text-purple-700">
            Status: <span className="capitalize">{userSubscription.status}</span>
          </p>
          {userSubscription.current_period_end && (
            <p className="text-purple-700">
              Next billing: {new Date(userSubscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;
