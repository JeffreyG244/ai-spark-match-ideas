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
import { Check, Star, Loader2, Crown, Heart, Zap, Shield, Video, Users, Globe, Sparkles, Briefcase, Diamond, Gift } from 'lucide-react';

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

  const getHardcodedFeatures = (planName: string) => {
    switch (planName) {
      case 'Free':
        return [
          { text: '3 daily swipes', icon: Heart },
          { text: 'Basic profile viewing', icon: Users },
          { text: 'Message matches only', icon: Users },
          { text: 'Standard matching algorithm', icon: Sparkles },
          { text: 'Basic profile setup', icon: Shield }
        ];
      case 'Basic':
        return [
          { text: '25 daily swipes', icon: Heart },
          { text: 'Unlimited messaging', icon: Users },
          { text: '5 super likes per day', icon: Sparkles },
          { text: 'See who likes you', icon: Heart },
          { text: 'Advanced filters', icon: Shield },
          { text: 'Read receipts', icon: Check },
          { text: 'Profile boost (1x/month)', icon: Zap },
          { text: 'Priority customer support', icon: Crown }
        ];
      case 'Plus':
      case 'Premium':
      case 'Standard':
        return [
          { text: 'Unlimited daily swipes', icon: Heart },
          { text: 'Unlimited messaging', icon: Users },
          { text: 'Unlimited super likes', icon: Sparkles },
          { text: 'Profile boost (5x/month)', icon: Zap },
          { text: 'Rewind last swipe', icon: Zap },
          { text: 'Browse incognito mode', icon: Shield },
          { text: 'AI-powered matching', icon: Sparkles },
          { text: 'Video chat enabled', icon: Video },
          { text: 'Travel mode access', icon: Globe },
          { text: 'Profile verification badge', icon: Shield },
          { text: 'Premium customer support', icon: Crown }
        ];
      case 'Executive':
        return [
          { text: 'Everything in Standard', icon: Sparkles },
          { text: 'Unlimited profile boosts', icon: Zap },
          { text: 'Priority in matching queue', icon: Crown },
          { text: 'Executive networking events', icon: Star },
          { text: 'Personal dating coach', icon: Users },
          { text: 'Advanced compatibility analysis', icon: Sparkles },
          { text: 'Executive-only matches', icon: Diamond },
          { text: 'Concierge dating service', icon: Crown },
          { text: 'Professional photo review', icon: Video },
          { text: 'VIP customer support', icon: Crown },
          { text: 'Monthly dating strategy session', icon: Users },
          { text: 'Industry networking access', icon: Briefcase }
        ];
      case 'C-suite':
      case 'VIP':
        return [
          { text: 'Everything in Executive', icon: Diamond },
          { text: 'Personal matchmaker assigned', icon: Crown },
          { text: 'C-level exclusive events', icon: Star },
          { text: 'Private dining experiences', icon: Star },
          { text: 'Executive retreat access', icon: Globe },
          { text: 'Background verification', icon: Shield },
          { text: 'Luxury travel dating', icon: Globe },
          { text: 'Personal brand consulting', icon: Briefcase },
          { text: '24/7 concierge support', icon: Crown },
          { text: 'White-glove onboarding', icon: Crown },
          { text: 'Executive coaching', icon: Users },
          { text: 'Private jet meetups', icon: Star },
          { text: 'Elite member directory', icon: Diamond },
          { text: 'Relationship psychology sessions', icon: Heart }
        ];
      default:
        return [];
    }
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
          border: 'border-emerald-600',
          badge: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
          icon: 'text-emerald-700',
          iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
          button: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
          gradient: 'from-emerald-50 to-emerald-100',
          cardBg: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100',
          planIcon: Gift,
          shadow: 'shadow-xl shadow-emerald-500/20'
        };
      case 'Basic':
        return {
          border: 'border-red-800',
          badge: 'bg-gradient-to-r from-red-800 to-red-900',
          icon: 'text-red-800',
          iconBg: 'bg-gradient-to-br from-red-100 to-red-200',
          button: 'bg-gradient-to-r from-red-800 to-red-900 hover:from-red-900 hover:to-red-950',
          gradient: 'from-red-50 to-red-100',
          cardBg: 'bg-gradient-to-br from-red-50 via-white to-red-100',
          planIcon: Heart,
          shadow: 'shadow-xl shadow-red-800/20'
        };
      case 'Plus':
      case 'Premium':
      case 'Standard':
        return {
          border: 'border-purple-800',
          badge: 'bg-gradient-to-r from-purple-800 to-purple-900',
          icon: 'text-purple-800',
          iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200',
          button: 'bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-900 hover:to-purple-950',
          gradient: 'from-purple-50 to-purple-100',
          cardBg: 'bg-gradient-to-br from-purple-50 via-white to-purple-100',
          planIcon: Sparkles,
          shadow: 'shadow-xl shadow-purple-800/20'
        };
      case 'Executive':
        return {
          border: 'border-2 border-[hsl(var(--silver-2))]',
          badge: 'bg-gradient-to-r from-[hsl(var(--silver-1))] via-[hsl(var(--silver-2))] to-[hsl(var(--silver-3))] text-white',
          icon: 'text-[hsl(var(--silver-3))]',
          iconBg: 'bg-gradient-to-br from-[hsl(var(--silver-1))] via-[hsl(var(--silver-2))] to-[hsl(var(--silver-3))]',
          button: 'bg-gradient-to-r from-[hsl(var(--silver-2))] via-[hsl(var(--silver-3))] to-[hsl(var(--silver-2))] hover:from-[hsl(var(--silver-3))] hover:via-[hsl(var(--silver-3))] hover:to-[hsl(var(--silver-3))]',
          gradient: 'from-[hsl(var(--silver-1))] to-[hsl(var(--silver-2))]',
          cardBg: 'bg-gradient-to-br from-[hsl(var(--silver-1))/20 via-[hsl(var(--silver-1))/10 to-[hsl(var(--silver-2))/20',
          planIcon: Briefcase,
          shadow: 'shadow-2xl shadow-[hsl(var(--silver-2))]/30'
        };
      case 'C-suite':
      case 'VIP':
        return {
          border: 'border-4 border-[hsl(var(--gold-2))]',
          badge: 'bg-gradient-to-r from-[hsl(var(--gold-1))] via-[hsl(var(--gold-2))] to-[hsl(var(--gold-3))] text-black',
          icon: 'text-[hsl(var(--gold-3))]',
          iconBg: 'bg-gradient-to-br from-[hsl(var(--gold-1))] via-[hsl(var(--gold-2))] to-[hsl(var(--gold-3))]',
          button: 'bg-gradient-to-r from-[hsl(var(--gold-2))] via-[hsl(var(--gold-3))] to-[hsl(var(--gold-2))] hover:from-[hsl(var(--gold-3))] hover:via-[hsl(var(--gold-3))] hover:to-[hsl(var(--gold-3))]',
          gradient: 'from-[hsl(var(--gold-1))] to-[hsl(var(--gold-2))]',
          cardBg: 'bg-gradient-to-br from-[hsl(var(--gold-1))/20 via-[hsl(var(--gold-1))/10 to-[hsl(var(--gold-2))/20',
          planIcon: Star,
          shadow: 'shadow-2xl shadow-[hsl(var(--gold-2))]/40'
        };
      default:
        return {
          border: 'border-gray-200',
          badge: 'bg-gray-500',
          icon: 'text-gray-600',
          iconBg: 'bg-gray-50',
          button: 'bg-gray-600 hover:bg-gray-700',
          gradient: 'from-gray-50 to-gray-100',
          cardBg: 'bg-white',
          planIcon: Star,
          shadow: 'shadow-xl'
        };
    }
  };

  const getDisplayName = (planName: string) => {
    switch (planName) {
      case 'Free': return 'Free';
      case 'Basic': return 'Basic';
      case 'Plus': return 'Standard';
      case 'Premium': return 'Standard';
      case 'VIP': return 'C-suite';
      default: return planName;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {plans.map((plan) => {
          const isCurrentPlan = getCurrentPlanId() === plan.id;
          const isProcessing = processingPayment === plan.name;
          const hardcodedFeatures = getHardcodedFeatures(plan.name);
          const theme = getPlanTheme(plan.name);
          
          return (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-500 hover:scale-105 animate-enter ${theme.cardBg} ${theme.border} ${theme.shadow} ${
                isCurrentPlan ? 'ring-2 ring-green-500/50' : ''
              } overflow-hidden rounded-xl`}
            >
              {/* Decorative gradient overlay */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.badge}`} />
              
              {/* Top Badge */}
              <div className="relative pt-10">
                {plan.is_popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className={`${theme.badge} text-white border-0 px-3 py-1 text-xs font-bold shadow-lg rounded-full`}>
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {(plan.name === 'Plus' || plan.name === 'Premium' || plan.name === 'Standard') && !plan.is_popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className={`${theme.badge} text-white border-0 px-3 py-1 text-xs font-bold shadow-lg rounded-full`}>
                      <Crown className="w-3 h-3 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                )}

                {(plan.name === 'VIP' || plan.name === 'C-suite') && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className={`${theme.badge} border-0 px-3 py-1 text-xs font-bold shadow-lg rounded-full`}>
                      <Star className="w-3 h-3 mr-1 text-[hsl(var(--star-bright))]" />
                      Elite Access
                    </Badge>
                  </div>
                )}

                {plan.name === 'Executive' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className={`${theme.badge} text-white border-0 px-3 py-1 text-xs font-bold shadow-lg rounded-full`}>
                      <Briefcase className="w-3 h-3 mr-1" />
                      Professional
                    </Badge>
                  </div>
                )}
              </div>

              {/* Header */}
              <CardHeader className="text-center pt-2 pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme.iconBg} shadow-lg`}>
                  <theme.planIcon className={`w-8 h-8 ${theme.icon}`} />
                </div>
                <CardTitle className={`text-xl font-bold ${theme.icon} mb-2`}>
                  {getDisplayName(plan.name)}
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground mb-1">
                  {getPrice(plan)}
                </CardDescription>
                <p className="text-xs text-muted-foreground font-medium">
                  {getDisplayName(plan.name) === 'Free' && "Perfect for getting started"}
                  {getDisplayName(plan.name) === 'Basic' && "Essential features for dating"}
                  {getDisplayName(plan.name) === 'Standard' && "Most popular choice"}
                  {getDisplayName(plan.name) === 'Executive' && "Advanced professional features"}
                  {getDisplayName(plan.name) === 'C-suite' && "Engineered for elite executives — exceed every expectation"}
                </p>
                {billingCycle === 'annual' && plan.monthly_price > 0 && plan.annual_price && (
                  <Badge variant="secondary" className="text-green-700 bg-green-50 border-green-200 text-xs mt-2">
                    Save ${((plan.monthly_price * 12) - plan.annual_price).toFixed(0)}/year
                  </Badge>
                )}
              </CardHeader>

              {/* Features */}
              <CardContent className="pt-0 pb-6">
                <div className="space-y-2 mb-6">
                  <h4 className={`font-semibold text-sm ${theme.icon} mb-3 text-center`}>What's Included:</h4>
                  <div className="max-h-48 overflow-y-auto scrollbar-thin">
                    {hardcodedFeatures.map((feature, index) => {
                      const IconComponent = feature.icon;
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/30 transition-colors">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${theme.iconBg} shadow-sm flex-shrink-0`}>
                            <IconComponent className={`w-3 h-3 ${theme.icon}`} />
                          </div>
                          <span className="text-xs text-foreground font-medium leading-tight">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanClick(plan)}
                  size="sm"
                  className={`w-full font-bold text-sm py-4 transition-all duration-300 ${
                    isCurrentPlan 
                      ? 'bg-muted text-muted-foreground cursor-default' 
                      : `${theme.button} text-white shadow-lg hover:shadow-xl`
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
                    `Get ${getDisplayName(plan.name)}`
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