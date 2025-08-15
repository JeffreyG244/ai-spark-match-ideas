import React from 'react';
import ProfileForm from './ProfileForm';
import PersonalityQuestions from './PersonalityQuestions';
import InterestsSelector from './InterestsSelector';
import EnhancedPhotoUpload from './EnhancedPhotoUpload';
const ProfileSectionContent = ({ activeSection, profileData, updateProfileField, profileExists, personalityAnswers, onPersonalityAnswerChange, interests, onInterestsChange, photos, onPhotosChange }) => {
    return (<>
      {activeSection === 'profile' && (<ProfileForm profileData={profileData} updateProfileField={updateProfileField} saveProfile={() => { }} // We'll use the comprehensive save function
         isSaving={false} profileExists={profileExists}/>)}

      {activeSection === 'personality' && (<PersonalityQuestions answers={personalityAnswers} onAnswerChange={onPersonalityAnswerChange}/>)}

      {activeSection === 'interests' && (<InterestsSelector selectedInterests={interests} onInterestsChange={onInterestsChange}/>)}

      {activeSection === 'photos' && (<EnhancedPhotoUpload photos={photos} onPhotosChange={onPhotosChange}/>)}
    </>);
};
export default ProfileSectionContent;
