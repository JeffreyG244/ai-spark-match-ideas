
import React from 'react';
import { ProfileData } from '@/schemas/profileValidation';
import ProfileForm from './ProfileForm';
import PersonalityQuestions from './PersonalityQuestions';
import InterestsSelector from './InterestsSelector';
import EnhancedPhotoUpload from './EnhancedPhotoUpload';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface ProfileSectionContentProps {
  activeSection: 'profile' | 'personality' | 'interests' | 'photos';
  profileData: ProfileData;
  updateProfileField: (field: keyof ProfileData, value: string) => void;
  profileExists: boolean;
  personalityAnswers: Record<string, string>;
  onPersonalityAnswerChange: (questionId: string, answer: string) => void;
  interests: string[];
  onInterestsChange: (interests: string[]) => void;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

const ProfileSectionContent = ({
  activeSection,
  profileData,
  updateProfileField,
  profileExists,
  personalityAnswers,
  onPersonalityAnswerChange,
  interests,
  onInterestsChange,
  photos,
  onPhotosChange
}: ProfileSectionContentProps) => {
  return (
    <>
      {activeSection === 'profile' && (
        <ProfileForm
          profileData={profileData}
          updateProfileField={updateProfileField}
          saveProfile={() => {}} // We'll use the comprehensive save function
          isSaving={false}
          profileExists={profileExists}
        />
      )}

      {activeSection === 'personality' && (
        <PersonalityQuestions
          answers={personalityAnswers}
          onAnswerChange={onPersonalityAnswerChange}
        />
      )}

      {activeSection === 'interests' && (
        <InterestsSelector
          selectedInterests={interests}
          onInterestsChange={onInterestsChange}
        />
      )}

      {activeSection === 'photos' && (
        <EnhancedPhotoUpload
          photos={photos}
          onPhotosChange={onPhotosChange}
        />
      )}
    </>
  );
};

export default ProfileSectionContent;
