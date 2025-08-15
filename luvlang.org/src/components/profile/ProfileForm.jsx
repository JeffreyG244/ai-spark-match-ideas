import { Button } from '@/components/ui/button';
import { Shield, CheckCircle } from 'lucide-react';
import SecureInput from '@/components/SecureInput';
import { LIMITS, validateProfileContent } from '@/utils/security';
const ProfileForm = ({ profileData, updateProfileField, saveProfile, isSaving, profileExists }) => {
    return (<div className="space-y-6">
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-green-600"/>
          <div>
            <h3 className="font-semibold text-green-800">Database Connected</h3>
            <p className="text-sm text-green-600">
              Your profile is securely stored with Row Level Security enabled
            </p>
          </div>
          <CheckCircle className="h-5 w-5 text-green-600"/>
        </div>
      </div>

      <SecureInput id="bio" label="Authentic Bio" placeholder="Tell your story in a way that showcases your personality and attracts meaningful connections..." value={profileData.bio} onChange={(value) => updateProfileField('bio', value)} maxLength={LIMITS.BIO_MAX_LENGTH} minLength={LIMITS.MIN_FIELD_LENGTH} required validation={(value) => {
            if (value.length < LIMITS.MIN_FIELD_LENGTH) {
                return `Bio must be at least ${LIMITS.MIN_FIELD_LENGTH} characters`;
            }
            const result = validateProfileContent(value, LIMITS.BIO_MAX_LENGTH);
            return result.isValid ? null : result.errors.join(', ');
        }}/>

      <SecureInput id="values" label="Core Values" placeholder="What principles guide your life? (e.g., integrity, growth, family, adventure...)" value={profileData.values} onChange={(value) => updateProfileField('values', value)} maxLength={LIMITS.VALUES_MAX_LENGTH} minLength={LIMITS.MIN_FIELD_LENGTH} validation={(value) => {
            if (value.length < LIMITS.MIN_FIELD_LENGTH) {
                return `Values must be at least ${LIMITS.MIN_FIELD_LENGTH} characters`;
            }
            const result = validateProfileContent(value, LIMITS.VALUES_MAX_LENGTH);
            return result.isValid ? null : result.errors.join(', ');
        }}/>

      <SecureInput id="goals" label="Life Goals & Timeline" placeholder="Where do you see yourself in 5 years? What are you building toward?" value={profileData.lifeGoals} onChange={(value) => updateProfileField('lifeGoals', value)} maxLength={LIMITS.GOALS_MAX_LENGTH} minLength={LIMITS.MIN_FIELD_LENGTH} validation={(value) => {
            if (value.length < LIMITS.MIN_FIELD_LENGTH) {
                return `Life goals must be at least ${LIMITS.MIN_FIELD_LENGTH} characters`;
            }
            const result = validateProfileContent(value, LIMITS.GOALS_MAX_LENGTH);
            return result.isValid ? null : result.errors.join(', ');
        }}/>

      <SecureInput id="greenFlags" label="Green Flags You Offer" placeholder="What positive qualities do you bring to a relationship?" value={profileData.greenFlags} onChange={(value) => updateProfileField('greenFlags', value)} maxLength={LIMITS.GREEN_FLAGS_MAX_LENGTH} minLength={LIMITS.MIN_FIELD_LENGTH} validation={(value) => {
            if (value.length < LIMITS.MIN_FIELD_LENGTH) {
                return `Green flags must be at least ${LIMITS.MIN_FIELD_LENGTH} characters`;
            }
            const result = validateProfileContent(value, LIMITS.GREEN_FLAGS_MAX_LENGTH);
            return result.isValid ? null : result.errors.join(', ');
        }}/>

      <Button onClick={saveProfile} disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-700">
        {isSaving ? (<>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving Securely...
          </>) : (<>
            <Shield className="h-4 w-4 mr-2"/>
            {profileExists ? 'Update Profile' : 'Create Profile'}
          </>)}
      </Button>
    </div>);
};
export default ProfileForm;
