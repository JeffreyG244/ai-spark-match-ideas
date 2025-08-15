import { useMemo } from 'react';
export const useProfileCompletion = (profileData, personalityAnswers, interests, photos) => {
    const completionPercentage = useMemo(() => {
        let completed = 0;
        let total = 4;
        // Basic profile (25%) - safely check bio length
        const bioLength = profileData?.bio?.length || 0;
        if (bioLength >= 50) {
            completed += 1;
        }
        // Personality questions (25%)
        if (personalityAnswers && Object.keys(personalityAnswers).length >= 6) {
            completed += 1;
        }
        // Interests (25%)
        if (interests && interests.length >= 5) {
            completed += 1;
        }
        // Photos (25%) - requires at least 3 photos
        if (photos && photos.length >= 3) {
            completed += 1;
        }
        return Math.round((completed / total) * 100);
    }, [profileData, personalityAnswers, interests, photos]);
    const isProfileComplete = completionPercentage === 100;
    return { completionPercentage, isProfileComplete };
};
