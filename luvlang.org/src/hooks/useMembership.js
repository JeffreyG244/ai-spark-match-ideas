import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
export const useMembership = () => {
    const { user } = useAuth();
    const [currentPlan, setCurrentPlan] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (user) {
            fetchUserMembership();
        }
        else {
            fetchFreePlan();
        }
    }, [user]);
    const fetchFreePlan = async () => {
        try {
            const { data, error } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('name', 'Free')
                .single();
            if (error)
                throw error;
            setCurrentPlan(data);
        }
        catch (error) {
            console.error('Error fetching free plan:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchUserMembership = async () => {
        if (!user)
            return;
        try {
            // Check subscription status via edge function
            const { data: subscriptionCheck } = await supabase.functions.invoke('check-subscription');
            // Get user subscription from database
            const { data: subscriptionData, error: subError } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();
            if (subError && subError.code !== 'PGRST116')
                throw subError;
            setSubscription(subscriptionData);
            // Get plan details
            const planId = subscriptionData?.plan_id || 1;
            const { data: planData, error: planError } = await supabase
                .from('membership_plans')
                .select('*')
                .eq('id', planId)
                .single();
            if (planError)
                throw planError;
            setCurrentPlan(planData);
        }
        catch (error) {
            console.error('Error fetching user membership:', error);
            fetchFreePlan();
        }
        finally {
            setLoading(false);
        }
    };
    const hasFeature = (featureName) => {
        if (!currentPlan?.features)
            return false;
        const feature = currentPlan.features[featureName];
        if (typeof feature === 'boolean')
            return feature;
        if (typeof feature === 'object' && feature?.unlimited)
            return true;
        if (featureName === 'messaging' && feature === 'unlimited')
            return true;
        return false;
    };
    const getFeatureLimit = (featureName) => {
        if (!currentPlan?.features)
            return null;
        const feature = currentPlan.features[featureName];
        if (typeof feature === 'object') {
            if (feature?.daily_limit)
                return feature.daily_limit;
            if (feature?.credits)
                return feature.credits;
            if (feature?.unlimited)
                return -1;
        }
        if (typeof feature === 'number')
            return feature;
        return null;
    };
    const isPremiumUser = () => {
        return currentPlan?.name !== 'Free';
    };
    const canUseFeature = (featureName) => {
        return hasFeature(featureName);
    };
    const getSwipeLimit = () => {
        if (!currentPlan?.features?.swipes)
            return null;
        const swipes = currentPlan.features.swipes;
        if (swipes.unlimited)
            return -1;
        if (swipes.daily_limit)
            return swipes.daily_limit;
        return null;
    };
    const getMessagingType = () => {
        if (!currentPlan?.features?.messaging)
            return null;
        const messaging = currentPlan.features.messaging;
        if (messaging === 'unlimited')
            return 'unlimited';
        if (messaging === 'matches_only')
            return 'matches_only';
        if (typeof messaging === 'object' && messaging.credits)
            return 'credits';
        return null;
    };
    const getSuperLikesLimit = () => {
        if (!currentPlan?.features?.super_likes)
            return null;
        const superLikes = currentPlan.features.super_likes;
        if (typeof superLikes === 'object' && superLikes.unlimited)
            return -1;
        if (typeof superLikes === 'number')
            return superLikes;
        return null;
    };
    return {
        currentPlan,
        subscription,
        loading,
        hasFeature,
        getFeatureLimit,
        isPremiumUser,
        canUseFeature,
        getSwipeLimit,
        getMessagingType,
        getSuperLikesLimit,
        refetch: fetchUserMembership
    };
};
