import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMembershipPlans } from '@/hooks/useMembershipPlans';
import { useNavigate, useLocation } from 'react-router-dom';
import BillingCycleToggle from './BillingCycleToggle';
import SubscriptionStatus from './SubscriptionStatus';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyPlansState from './EmptyPlansState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Loader2, Crown, Heart, Zap, Shield, Video, Users, Globe, Sparkles } from 'lucide-react';

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

const EnhancedMembershipPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  const {
    plans,
    userSubscription,
    loading,
    error,
    processingPayment,
    fetchPlans,
    handlePlanSelect,
    getCurrentPlanId
  } = useMembershipPlans();

  const isOnMembershipPage = location.pathname === '/membership';

  const handlePlanClick = (plan: any) => {
    if (!isOnMembershipPage) {
      navigate('/membership');
      return;
    }
    handlePlanSelect(plan, billingCycle);
  };

  const formatFeature = (key: string, value: any) => {
    switch (key) {
      case 'swipes':
        if (value.unlimited) return { text: 'Unlimited swipes', icon: Heart };
        if (value.daily_limit) return { text: `${value.daily_limit} daily swipes`, icon: Heart };
        return null;
      case 'messaging':
        if (value === 'unlimited') return { text: 'Unlimited messaging', icon: Users };
        if (value === 'matches_only') return { text: 'Message matches only', icon: Users };
        if (value.credits) return { text: `${value.credits} messaging credits`, icon: Users };
        return null;
      case 'super_likes':
        if (typeof value === 'object' && value.unlimited) return { text: 'Unlimited super likes', icon: Sparkles };
        if (typeof value === 'number') return { text: `${value} super like${value !== 1 ? 's' : ''} per day`, icon: Sparkles };
        return null;
      case 'boosts':
        if (typeof value === 'object' && value.unlimited) return { text: 'Unlimited boosts', icon: Zap };
        if (typeof value === 'number' && value > 0) return { text: `${value} boost${value !== 1 ? 's' : ''} per month`, icon: Zap };
        return null;
      case 'advanced_filters':
        return value ? { text: 'Advanced filters', icon: Shield } : null;
      case 'see_likes':
        return value ? { text: 'See who likes you', icon: Heart } : null;
      case 'rewind':
        return value ? { text: 'Rewind feature', icon: Zap } : null;
      case 'priority':
        return value ? { text: 'Priority support', icon: Crown } : null;
      case 'incognito':
        return value ? { text: 'Incognito mode', icon: Shield } : null;
      case 'travel_mode':
        return value ? { text: 'Travel mode', icon: Globe } : null;
      case 'profile_verification':
        return value ? { text: 'Profile verification', icon: Shield } : null;
      case 'read_receipts':
        return value ? { text: 'Read receipts', icon: Check } : null;
      case 'video_chat':
        return value ? { text: 'Video chat', icon: Video } : null;
      case 'ai_recommendations':
        return value ? { text: 'AI-powered recommendations', icon: Sparkles } : null;
      case 'passport':
        return value ? { text: 'Travel passport', icon: Globe } : null;
      case 'priority_likes':
        return value ? { text: 'Priority likes', icon: Crown } : null;
      case 'personal_matchmaker':
        return value ? { text: 'Personal matchmaker', icon: Crown } : null;
      case 'exclusive_events':
        return value ? { text: 'Exclusive events', icon: Star } : null;
      case 'dating_coach':
        return value ? { text: 'Dating coach', icon: Users } : null;
      case 'vip_support':
        return value ? { text: '24/7 VIP support', icon: Crown } : null;
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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchPlans} />;
  if (plans.length === 0) return <EmptyPlansState onRefresh={fetchPlans} />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Join millions finding love worldwide. Unlock premium features designed to help you connect with your perfect match faster.
        </p>
        
        {isOnMembershipPage && (
          <BillingCycleToggle 
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
          />
        )}

        {!isOnMembershipPage && (
          <div className="mb-8">
            <Button onClick={() => navigate('/membership')} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
              Upgrade Your Experience
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = getCurrentPlanId() === plan.id;
          const isProcessing = processingPayment === plan.name;
          const features = Object.entries(plan.features || {});
          
          const isPremium = plan.name === 'Premium';
          const isPlus = plan.name === 'Plus';
          const isFree = plan.name === 'Free';
          const isVIP = plan.name === 'VIP';

          return (
            <Card 
              key={plan.id}
              className={`relative transform transition-all duration-300 hover:scale-105 ${
                isPlus ? 'border-2 border-purple-500 shadow-2xl shadow-purple-500/20' : 
                isPremium ? 'border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20' :
                isVIP ? 'border-2 border-violet-500 shadow-2xl shadow-violet-500/20' :
                isFree ? 'border-2 border-green-500 shadow-xl shadow-green-500/10' :
                'border-purple-200 shadow-lg'
              } ${isCurrentPlan ? 'ring-4 ring-green-500/50' : ''} overflow-hidden`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 opacity-5 ${
                isPlus ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                isPremium ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                isVIP ? 'bg-gradient-to-br from-violet-500 to-violet-600' :
                isFree ? 'bg-gradient-to-br from-green-400 to-green-500' :
                'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}></div>

              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-purple-500 text-white border-purple-500 px-4 py-1 text-sm font-semibold shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {isPremium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-yellow-500 text-white border-yellow-500 px-4 py-1 text-sm font-semibold shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                </div>
              )}

              {isVIP && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-violet-500 text-white border-violet-500 px-4 py-1 text-sm font-semibold shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    VIP Elite
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4 relative">
                <CardTitle 
                  className="text-3xl font-bold mb-2"
                  style={{ color: isPlus ? '#7C3AED' : isPremium ? '#EAB308' : isVIP ? '#8B5CF6' : isFree ? '#10B981' : plan.highlight_color || '#7C3AED' }}
                >
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-4xl font-bold text-gray-900 mb-2">
                  {getPrice(plan)}
                </CardDescription>
                {billingCycle === 'annual' && plan.monthly_price > 0 && plan.annual_price && (
                  <div className="inline-block">
                    <Badge variant="secondary" className="text-green-700 bg-green-100">
                      Save ${((plan.monthly_price * 12) - plan.annual_price).toFixed(2)}/year
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6 relative">
                <div className="space-y-3 min-h-[280px]">
                  {features.map(([key, value]) => {
                    const feature = formatFeature(key, value);
                    if (!feature) return null;
                    
                    const IconComponent = feature.icon;
                    
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isPlus ? 'bg-purple-100' :
                          isPremium ? 'bg-yellow-100' :
                          isVIP ? 'bg-violet-100' :
                          isFree ? 'bg-green-100' :
                          'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-3 h-3 ${
                            isPlus ? 'text-purple-600' :
                            isPremium ? 'text-yellow-600' :
                            isVIP ? 'text-violet-600' :
                            isFree ? 'text-green-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <span className="text-sm font-medium">{feature.text}</span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handlePlanClick(plan)}
                  className="w-full py-3 text-lg font-semibold transition-all duration-200"
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan || isProcessing}
                  style={{
                    backgroundColor: !isCurrentPlan ? (
                      isFree ? '#10B981' : 
                      isPlus ? '#7C3AED' : 
                      isPremium ? '#EAB308' : 
                      isVIP ? '#8B5CF6' :
                      plan.highlight_color || '#7C3AED'
                    ) : undefined,
                    borderColor: isCurrentPlan && isFree ? '#10B981' : undefined,
                    color: isCurrentPlan && isFree ? '#10B981' : undefined
                  }}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                  ) : isCurrentPlan ? (
                    isFree ? 'Current Plan' : 'Active Plan'
                  ) : !user ? (
                    'Sign In to Upgrade'
                  ) : (
                    `Get ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isOnMembershipPage && <SubscriptionStatus userSubscription={userSubscription} />}
    </div>
  );
};

export default EnhancedMembershipPlans;