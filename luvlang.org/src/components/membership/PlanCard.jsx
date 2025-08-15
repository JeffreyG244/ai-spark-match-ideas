import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Loader2, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const PlanCard = ({ plan, billingCycle, isCurrentPlan, isProcessing, user, onPlanSelect }) => {
    const navigate = useNavigate();
    const formatFeature = (key, value) => {
        switch (key) {
            case 'swipes':
                if (value.unlimited)
                    return 'Unlimited swipes';
                if (value.daily_limit)
                    return `${value.daily_limit} daily swipes`;
                return null;
            case 'messaging':
                if (value === 'unlimited')
                    return 'Unlimited messaging';
                if (value === 'matches_only')
                    return 'Message matches only';
                if (value.credits)
                    return `${value.credits} messaging credits`;
                return null;
            case 'super_likes':
                if (typeof value === 'object' && value.unlimited)
                    return 'Unlimited super likes';
                if (typeof value === 'number')
                    return `${value} super like${value !== 1 ? 's' : ''} per day`;
                return null;
            case 'boosts':
                if (typeof value === 'object' && value.unlimited)
                    return 'Unlimited boosts';
                if (typeof value === 'number' && value > 0)
                    return `${value} boost${value !== 1 ? 's' : ''} per month`;
                if (typeof value === 'number' && value === 0)
                    return null;
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
    const getPrice = () => {
        if (plan.monthly_price === 0)
            return 'Free';
        const price = billingCycle === 'annual' ? (plan.annual_price || 0) : plan.monthly_price;
        const period = billingCycle === 'annual' ? '/year' : '/month';
        return `$${price.toFixed(2)}${period}`;
    };
    const handlePlanClick = async () => {
        if (!user) {
            navigate('/auth');
            return;
        }
        if (plan.name === 'Free') {
            return;
        }
        if (isCurrentPlan) {
            return;
        }
        // Call the onPlanSelect which handles the PayPal checkout process
        onPlanSelect(plan);
    };
    const features = Object.entries(plan.features || {});
    const isPremium = plan.name === 'Premium';
    const isPlus = plan.name === 'Plus';
    const isFree = plan.name === 'Free';
    return (<Card className={`relative ${isPlus ? 'border-2 border-purple-500 shadow-lg' :
            isPremium ? 'border-2 border-yellow-500 shadow-lg' :
                isFree ? 'border-2 border-green-500 shadow-lg' :
                    'border-purple-200'} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
      {plan.is_popular && (<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-500 text-white border-purple-500">
            <Star className="w-3 h-3 mr-1"/>
            Most Popular
          </Badge>
        </div>)}

      {isPremium && (<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-yellow-500 text-white border-yellow-500">
            <Crown className="w-3 h-3 mr-1"/>
            Best Value
          </Badge>
        </div>)}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl" style={{ color: isPlus ? '#7C3AED' : isPremium ? '#EAB308' : isFree ? '#10B981' : plan.highlight_color || '#7C3AED' }}>
          {plan.name}
        </CardTitle>
        <CardDescription className="text-3xl font-bold text-gray-900">
          {getPrice()}
        </CardDescription>
        {billingCycle === 'annual' && plan.monthly_price > 0 && plan.annual_price && (<p className="text-sm text-gray-500">
            Save ${((plan.monthly_price * 12) - plan.annual_price).toFixed(2)} per year
          </p>)}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 min-h-[200px]">
          {features.map(([key, value]) => {
            const featureText = formatFeature(key, value);
            if (!featureText)
                return null;
            return (<div key={key} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0"/>
                <span className="text-sm">{featureText}</span>
              </div>);
        })}
        </div>

        <Button onClick={handlePlanClick} className="w-full" variant={isCurrentPlan ? "outline" : "default"} disabled={isCurrentPlan || isProcessing} style={{
            backgroundColor: !isCurrentPlan ? (isFree ? '#10B981' :
                isPlus ? '#7C3AED' :
                    isPremium ? '#EAB308' :
                        plan.highlight_color || '#7C3AED') : undefined,
            borderColor: isCurrentPlan && isFree ? '#10B981' : undefined,
            color: isCurrentPlan && isFree ? '#10B981' : undefined
        }}>
          {isProcessing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Processing...</>) : isCurrentPlan ? (isFree ? 'Free Plan' : 'Current Plan') : !user ? ('Sign In to Upgrade') : (`Choose ${plan.name}`)}
        </Button>
      </CardContent>
    </Card>);
};
export default PlanCard;
