import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMembershipPlans } from '@/hooks/useMembershipPlans';
import { useNavigate, useLocation } from 'react-router-dom';
import BillingCycleToggle from './BillingCycleToggle';
import PlanCard from './PlanCard';
import SubscriptionStatus from './SubscriptionStatus';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyPlansState from './EmptyPlansState';
import { Button } from '@/components/ui/button';
const MembershipPlans = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const { plans, userSubscription, loading, error, processingPayment, fetchPlans, handlePlanSelect, getCurrentPlanId } = useMembershipPlans();
    // Check if we're on the correct page for full membership functionality
    const isOnMembershipPage = location.pathname === '/membership';
    const handlePlanClick = (plan) => {
        if (!isOnMembershipPage) {
            // Redirect to membership page if not already there
            navigate('/membership');
            return;
        }
        // Only process payment if we're on the membership page
        handlePlanSelect(plan, billingCycle);
    };
    if (loading) {
        return <LoadingState />;
    }
    if (error) {
        return <ErrorState error={error} onRetry={fetchPlans}/>;
    }
    if (plans.length === 0) {
        return <EmptyPlansState onRefresh={fetchPlans}/>;
    }
    return (<div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-600 mb-6">Find your perfect match with the right features for you</p>
        
        {isOnMembershipPage && (<BillingCycleToggle billingCycle={billingCycle} setBillingCycle={setBillingCycle}/>)}

        {!isOnMembershipPage && (<div className="mb-6">
            <Button onClick={() => navigate('/membership')} className="bg-purple-600 hover:bg-purple-700">
              Go to Membership Page to Upgrade
            </Button>
          </div>)}

        {user && userSubscription && userSubscription.plan_id > 1 && isOnMembershipPage && (<div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              To manage your subscription, please visit your PayPal account
            </p>
          </div>)}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
            const isCurrentPlan = getCurrentPlanId() === plan.id;
            const isProcessing = processingPayment === plan.name;
            return (<PlanCard key={plan.id} plan={plan} billingCycle={billingCycle} isCurrentPlan={isCurrentPlan} isProcessing={isProcessing} user={user} onPlanSelect={handlePlanClick}/>);
        })}
      </div>

      {isOnMembershipPage && <SubscriptionStatus userSubscription={userSubscription}/>}
    </div>);
};
export default MembershipPlans;
