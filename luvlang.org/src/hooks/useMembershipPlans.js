import { useMembershipData } from './useMembershipData';
import { usePayPalCheckout } from './usePayPalCheckout';
export const useMembershipPlans = () => {
    const { plans, userSubscription, loading, error, fetchPlans, checkSubscriptionStatus, getCurrentPlanId } = useMembershipData();
    const { processingPayment, handlePlanSelect, handleManageSubscription } = usePayPalCheckout(checkSubscriptionStatus);
    return {
        plans,
        userSubscription,
        loading,
        error,
        processingPayment,
        fetchPlans,
        handlePlanSelect,
        handleManageSubscription,
        getCurrentPlanId
    };
};
