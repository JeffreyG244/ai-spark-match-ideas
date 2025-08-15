import { useMembership } from './useMembership';

export const useFeatureAccess = () => {
  const { 
    currentPlan, 
    hasFeature, 
    getFeatureLimit, 
    isPremiumUser,
    getSwipeLimit,
    getMessagingType,
    getSuperLikesLimit
  } = useMembership();

  // Swipe functionality
  const canSwipe = () => {
    const limit = getSwipeLimit();
    return limit === -1 || (limit && limit > 0); // -1 means unlimited, positive number means has swipes left
  };

  const getSwipesRemaining = () => {
    return getSwipeLimit();
  };

  // Messaging functionality
  const canSendMessage = (isMatch: boolean = false) => {
    const messagingType = getMessagingType();
    if (messagingType === 'unlimited') return true;
    if (messagingType === 'matches_only') return isMatch;
    if (messagingType === 'credits') {
      const credits = getFeatureLimit('messaging');
      return credits && credits > 0;
    }
    return false;
  };

  // Super likes functionality
  const canSuperLike = () => {
    const limit = getSuperLikesLimit();
    return limit === -1 || (limit && limit > 0);
  };

  const getSuperLikesRemaining = () => {
    return getSuperLikesLimit();
  };

  // Premium features
  const canUseAdvancedFilters = () => hasFeature('advanced_filters');
  const canSeeWhoLikedMe = () => hasFeature('see_likes');
  const canRewind = () => hasFeature('rewind');
  const canUseIncognito = () => hasFeature('incognito');
  const canUseTravelMode = () => hasFeature('travel_mode');
  const canUseBoosts = () => hasFeature('boosts');
  const canUseVideoChat = () => hasFeature('video_chat');
  const canUseReadReceipts = () => hasFeature('read_receipts');
  const hasProfileVerification = () => hasFeature('profile_verification');
  const hasAIRecommendations = () => hasFeature('ai_recommendations');
  const hasPrioritySupport = () => hasFeature('priority');
  const hasVIPSupport = () => hasFeature('vip_support');

  // Helper to check if user needs to upgrade for a feature
  const requiresUpgrade = (featureName: string) => {
    return !hasFeature(featureName) && !isPremiumUser();
  };

  return {
    // Plan info
    currentPlan,
    isPremiumUser: isPremiumUser(),
    
    // Swipe features
    canSwipe,
    getSwipesRemaining,
    
    // Messaging features
    canSendMessage,
    getMessagingType,
    
    // Super likes
    canSuperLike,
    getSuperLikesRemaining,
    
    // Premium features
    canUseAdvancedFilters,
    canSeeWhoLikedMe,
    canRewind,
    canUseIncognito,
    canUseTravelMode,
    canUseBoosts,
    canUseVideoChat,
    canUseReadReceipts,
    hasProfileVerification,
    hasAIRecommendations,
    hasPrioritySupport,
    hasVIPSupport,
    
    // Utility
    requiresUpgrade,
    hasFeature
  };
};