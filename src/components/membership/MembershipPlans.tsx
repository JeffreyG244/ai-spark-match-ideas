
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMembershipPlans } from '@/hooks/useMembershipPlans';
import BillingCycleToggle from './BillingCycleToggle';
import PlanCard from './PlanCard';
import SubscriptionStatus from './SubscriptionStatus';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyPlansState from './EmptyPlansState';

const MembershipPlans = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  const {
    plans,
    userSubscription,
    loading,
    error,
    processingPayment,
    fetchPlans,
    handlePlanSelect,
    handleManageSubscription,
    getCurrentPlanId
  } = useMembershipPlans();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchPlans} />;
  }

  if (plans.length === 0) {
    return <EmptyPlansState onRefresh={fetchPlans} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-600 mb-6">Find your perfect match with the right features for you</p>
        
        <BillingCycleToggle 
          billingCycle={billingCycle}
          setBillingCycle={setBillingCycle}
        />

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
          const isProcessing = processingPayment === plan.name;

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              isCurrentPlan={isCurrentPlan}
              isProcessing={isProcessing}
              user={user}
              onPlanSelect={(plan) => handlePlanSelect(plan, billingCycle)}
            />
          );
        })}
      </div>

      <SubscriptionStatus userSubscription={userSubscription} />
    </div>
  );
};

export default MembershipPlans;
