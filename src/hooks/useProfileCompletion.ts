
import { useMemo } from 'react';
import { ProfileData } from '@/schemas/profileValidation';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

export const useProfileCompletion = (
  profileData: ProfileData,
  personalityAnswers: Record<string, string>,
  interests: string[],
  photos: Photo[]
) => {
  const completionPercentage = useMemo(() => {
    let completed = 0;
    let total = 4;

    // Basic profile (25%)
    if (profileData.bio && profileData.values && profileData.lifeGoals && profileData.greenFlags) {
      completed += 1;
    }

    // Personality questions (25%)
    if (Object.keys(personalityAnswers).length >= 6) {
      completed += 1;
    }

    // Interests (25%)
    if (interests.length >= 5) {
      completed += 1;
    }

    // Photos (25%)
    if (photos.length >= 3) {
      completed += 1;
    }

    return Math.round((completed / total) * 100);
  }, [profileData, personalityAnswers, interests, photos]);

  return { completionPercentage };
};
