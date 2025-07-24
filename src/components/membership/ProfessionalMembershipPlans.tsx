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

const ProfessionalMembershipPlans = () => {
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
    const iconMap: Record<string, any> = {
      swipes: Heart,
      messaging: Users,
      super_likes: Sparkles,
      boosts: Zap,
      advanced_filters: Shield,
      see_likes: Heart,
      rewind: Zap,
      priority: Crown,
      incognito: Shield,
      travel_mode: Globe,
      profile_verification: Shield,
      read_receipts: Check,
      video_chat: Video,
      ai_recommendations: Sparkles,
      passport: Globe,
      priority_likes: Crown,
      personal_matchmaker: Crown,
      exclusive_events: Star,
      dating_coach: Users,
      vip_support: Crown
    };

    switch (key) {
      case 'swipes':
        if (value.unlimited) return { text: 'Unlimited swipes', icon: iconMap[key] };
        if (value.daily_limit) return { text: `${value.daily_limit} daily swipes`, icon: iconMap[key] };
        return null;
      case 'messaging':
        if (value === 'unlimited') return { text: 'Unlimited messaging', icon: iconMap[key] };
        if (value === 'matches_only') return { text: 'Message matches only', icon: iconMap[key] };
        if (value.credits) return { text: `${value.credits} messaging credits`, icon: iconMap[key] };
        return null;
      case 'super_likes':
        if (typeof value === 'object' && value.unlimited) return { text: 'Unlimited super likes', icon: iconMap[key] };
        if (typeof value === 'number') return { text: `${value} super like${value !== 1 ? 's' : ''} daily`, icon: iconMap[key] };
        return null;
      case 'boosts':
        if (typeof value === 'object' && value.unlimited) return { text: 'Unlimited boosts', icon: iconMap[key] };
        if (typeof value === 'number' && value > 0) return { text: `${value} boost${value !== 1 ? 's' : ''} monthly`, icon: iconMap[key] };
        return null;
      case 'advanced_filters':
        return value ? { text: 'Advanced filters', icon: iconMap[key] } : null;
      case 'see_likes':
        return value ? { text: 'See who likes you', icon: iconMap[key] } : null;
      case 'rewind':
        return value ? { text: 'Rewind last swipe', icon: iconMap[key] } : null;
      case 'priority':
        return value ? { text: 'Priority support', icon: iconMap[key] } : null;
      case 'incognito':
        return value ? { text: 'Browse incognito', icon: iconMap[key] } : null;
      case 'travel_mode':
        return value ? { text: 'Travel anywhere', icon: iconMap[key] } : null;
      case 'profile_verification':
        return value ? { text: 'Profile verification badge', icon: iconMap[key] } : null;
      case 'read_receipts':
        return value ? { text: 'Read receipts', icon: iconMap[key] } : null;
      case 'video_chat':
        return value ? { text: 'Video chat enabled', icon: iconMap[key] } : null;
      case 'ai_recommendations':
        return value ? { text: 'AI-powered matching', icon: iconMap[key] } : null;
      case 'passport':
        return value ? { text: 'Global passport', icon: iconMap[key] } : null;
      case 'priority_likes':
        return value ? { text: 'Priority in likes queue', icon: iconMap[key] } : null;
      case 'personal_matchmaker':
        return value ? { text: 'Personal matchmaker', icon: iconMap[key] } : null;
      case 'exclusive_events':
        return value ? { text: 'Exclusive member events', icon: iconMap[key] } : null;
      case 'dating_coach':
        return value ? { text: 'Personal dating coach', icon: iconMap[key] } : null;
      case 'vip_support':
        return value ? { text: '24/7 VIP support', icon: iconMap[key] } : null;
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

  const getPlanTheme = (planName: string) => {
    switch (planName) {
      case 'Free':
        return {
          border: 'border-emerald-200',
          badge: 'bg-emerald-500',
          icon: 'text-emerald-600',
          iconBg: 'bg-emerald-50',
          button: 'bg-emerald-600 hover:bg-emerald-700',
          gradient: 'from-emerald-50 to-emerald-100'
        };
      case 'Plus':
        return {
          border: 'border-purple-300',
          badge: 'bg-purple-500',
          icon: 'text-purple-600',
          iconBg: 'bg-purple-50',
          button: 'bg-purple-600 hover:bg-purple-700',
          gradient: 'from-purple-50 to-purple-100'
        };
      case 'Premium':
        return {
          border: 'border-amber-300',
          badge: 'bg-amber-500',
          icon: 'text-amber-600',
          iconBg: 'bg-amber-50',
          button: 'bg-amber-600 hover:bg-amber-700',
          gradient: 'from-amber-50 to-amber-100'
        };
      case 'VIP':
        return {
          border: 'border-violet-300',
          badge: 'bg-violet-500',
          icon: 'text-violet-600',
          iconBg: 'bg-violet-50',
          button: 'bg-violet-600 hover:bg-violet-700',
          gradient: 'from-violet-50 to-violet-100'
        };
      default:
        return {
          border: 'border-gray-200',
          badge: 'bg-gray-500',
          icon: 'text-gray-600',
          iconBg: 'bg-gray-50',
          button: 'bg-gray-600 hover:bg-gray-700',
          gradient: 'from-gray-50 to-gray-100'
        };
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchPlans} />;
  if (plans.length === 0) return <EmptyPlansState onRefresh={fetchPlans} />;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent">
          Choose Your Perfect Plan
        </h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Unlock premium features to enhance your dating experience and connect with your perfect match.
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
              View All Plans
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = getCurrentPlanId() === plan.id;
          const isProcessing = processingPayment === plan.name;
          const features = Object.entries(plan.features || {});
          const theme = getPlanTheme(plan.name);
          
          return (
            <Card 
              key={plan.id}
              className={`relative h-fit transition-all duration-300 hover:shadow-lg ${theme.border} ${
                isCurrentPlan ? 'ring-2 ring-green-500/50' : ''
              }`}
            >
              {/* Top Badge */}
              <div className="relative">
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className={`${theme.badge} text-white border-0 px-3 py-1 text-xs font-medium shadow-md`}>
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {plan.name === 'Premium' && !plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className={`${theme.badge} text-white border-0 px-3 py-1 text-xs font-medium shadow-md`}>
                      <Crown className="w-3 h-3 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                )}

                {plan.name === 'VIP' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className={`${theme.badge} text-white border-0 px-3 py-1 text-xs font-medium shadow-md`}>
                      <Crown className="w-3 h-3 mr-1" />
                      VIP Elite
                    </Badge>
                  </div>
                )}
              </div>

              {/* Header */}
              <CardHeader className="text-center pt-6 pb-4">
                <CardTitle className={`text-xl font-bold ${theme.icon}`}>
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground">
                  {getPrice(plan)}
                </CardDescription>
                {billingCycle === 'annual' && plan.monthly_price > 0 && plan.annual_price && (
                  <Badge variant="secondary" className="text-green-700 bg-green-50 border-green-200 text-xs">
                    Save ${((plan.monthly_price * 12) - plan.annual_price).toFixed(0)}/year
                  </Badge>
                )}
              </CardHeader>

              {/* Features */}
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {features.slice(0, 6).map(([key, value]) => {
                    const feature = formatFeature(key, value);
                    if (!feature) return null;
                    
                    const IconComponent = feature.icon;
                    
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${theme.iconBg}`}>
                          <IconComponent className={`w-3 h-3 ${theme.icon}`} />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature.text}</span>
                      </div>
                    );
                  })}
                  
                  {features.length > 6 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      +{features.length - 6} more features
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full font-medium transition-all duration-200 ${
                    isCurrentPlan 
                      ? 'bg-muted text-muted-foreground cursor-default' 
                      : theme.button
                  }`}
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
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

export default ProfessionalMembershipPlans;