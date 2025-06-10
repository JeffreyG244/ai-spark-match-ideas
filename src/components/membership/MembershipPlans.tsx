
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchUserSubscription();
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

  const fetchUserSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
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

    // Here you would integrate with Stripe for payment processing
    toast.info('Payment integration coming soon!');
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
        if (typeof value === 'number' && value === 0) return null; // Don't show 0 boosts
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
    if (!userSubscription) return 1; // Default to Free plan
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
        
        <div className="flex justify-center mb-8">
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
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = getCurrentPlanId() === plan.id;
          const features = Object.entries(plan.features || {});

          return (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.is_popular ? 'border-2 border-purple-600 shadow-lg' : 'border-purple-200'
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle 
                  className="text-2xl"
                  style={{ color: plan.highlight_color || '#7C3AED' }}
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
                  disabled={isCurrentPlan}
                  style={{
                    backgroundColor: !isCurrentPlan ? (plan.highlight_color || '#7C3AED') : undefined
                  }}
                >
                  {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
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
