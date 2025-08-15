import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfileData } from '@/hooks/useProfileData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ProfileCompletionHeader from './ProfileCompletionHeader';
import ProfileSectionNavigation from './ProfileSectionNavigation';
import ProfileSectionContent from './ProfileSectionContent';
import ProfileSaveButton from './ProfileSaveButton';
const ComprehensiveProfileBuilder = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const [personalityAnswers, setPersonalityAnswers] = useState({});
    const [interests, setInterests] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const { profileData, profileExists, isLoading, loadProfile, updateProfileField } = useProfileData();
    const { completionPercentage } = useProfileCompletion(profileData, personalityAnswers, interests, photos);
    useEffect(() => {
        if (user) {
            loadProfile();
            loadAdditionalData();
        }
    }, [user]);
    const loadAdditionalData = async () => {
        if (!user)
            return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
            if (error) {
                console.error('Error loading additional data:', error);
                return;
            }
            if (data) {
                // Handle personality answers - check if column exists
                const profileData = data;
                setPersonalityAnswers(profileData.personality_answers || {});
                // Handle interests - could be stored in different formats
                const interestsData = profileData.interests || [];
                setInterests(Array.isArray(interestsData) ? interestsData : []);
                // Handle photos
                const photoUrls = profileData.photo_urls || [];
                const photoObjects = photoUrls.map((url, index) => ({
                    id: `existing-${index}`,
                    url,
                    isPrimary: index === 0
                }));
                setPhotos(photoObjects);
            }
        }
        catch (error) {
            console.error('Error loading additional data:', error);
        }
    };
    const handlePersonalityAnswer = (questionId, answer) => {
        setPersonalityAnswers(prev => ({ ...prev, [questionId]: answer }));
    };
    const handlePhotosChange = (newPhotos) => {
        setPhotos(newPhotos);
    };
    const sendToWebhook = async (profilePayload) => {
        try {
            // Send to both the original n8n webhook AND our matchmaking service
            const webhookUrl = 'https://luvlang.app.n8n.cloud/webhook-test/1c19d72c-85ea-4e4c-901b-2b09013bc4d6';
            // Enhanced webhook data with all required matchmaking fields
            const webhookData = {
                user_id: user?.id,
                email: user?.email,
                profile_data: {
                    // Basic profile info
                    bio: profileData.bio,
                    values: profileData.values,
                    life_goals: profileData.lifeGoals,
                    green_flags: profileData.greenFlags,
                    // Demographics (extracted from personality answers or default values)
                    age: personalityAnswers.age || Math.floor(Math.random() * 20) + 25,
                    gender: personalityAnswers.gender || 'Not specified',
                    location: personalityAnswers.location || 'Location not specified',
                    // Relationship preferences
                    relationship_goals: personalityAnswers.relationship_goals || profileData.lifeGoals || 'Long-term relationship',
                    partner_age_min: personalityAnswers.partner_age_min || Math.max((parseInt(personalityAnswers.age) || 30) - 5, 18),
                    partner_age_max: personalityAnswers.partner_age_max || Math.min((parseInt(personalityAnswers.age) || 30) + 10, 65),
                    partner_gender_preference: personalityAnswers.partner_gender || 'Any',
                    // Profile completion data
                    personality_answers: personalityAnswers,
                    interests: interests,
                    photos: photos.map(photo => photo.url),
                    completion_percentage: completionPercentage,
                    // Matching criteria
                    max_distance: personalityAnswers.max_distance || 50,
                    deal_breakers: personalityAnswers.deal_breakers || [],
                },
                timestamp: new Date().toISOString(),
                profile_exists: profileExists,
                // Matchmaking request
                action: 'find_matches',
                matchmaking_request: {
                    user_id: user?.id,
                    age: personalityAnswers.age || Math.floor(Math.random() * 20) + 25,
                    gender: personalityAnswers.gender || 'Not specified',
                    location: personalityAnswers.location || 'Location not specified',
                    interests: interests,
                    values: profileData.values,
                    relationship_goals: personalityAnswers.relationship_goals || 'Long-term relationship',
                    preferences: {
                        age_range: {
                            min: personalityAnswers.partner_age_min || Math.max((parseInt(personalityAnswers.age) || 30) - 5, 18),
                            max: personalityAnswers.partner_age_max || Math.min((parseInt(personalityAnswers.age) || 30) + 10, 65)
                        },
                        gender: personalityAnswers.partner_gender || 'Any',
                        max_distance: personalityAnswers.max_distance || 50
                    }
                }
            };
            console.log('Sending enhanced profile data to webhook:', webhookData);
            // Send to n8n webhook
            const n8nResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData)
            });
            // Send to our matchmaking service
            const { data: matchResponse, error: matchError } = await supabase.functions.invoke('process-matches', {
                body: webhookData
            });
            if (n8nResponse.ok) {
                console.log('Profile data sent to n8n webhook successfully');
            }
            if (matchError) {
                console.error('Matchmaking service error:', matchError);
            }
            else {
                console.log('Matchmaking service response:', matchResponse);
            }
            toast({
                title: 'Profile Updated & Matches Processing',
                description: 'Your profile has been saved and we are finding your potential matches!',
            });
        }
        catch (error) {
            console.error('Error sending data to webhook:', error);
            toast({
                title: 'Profile Saved',
                description: 'Profile saved locally, but matchmaking service may be temporarily unavailable.',
                variant: 'destructive'
            });
        }
    };
    const saveCompleteProfile = async () => {
        if (!user) {
            toast({
                title: 'Authentication Required',
                description: 'Please log in to save your profile.',
                variant: 'destructive'
            });
            return;
        }
        setIsSaving(true);
        try {
            const photoUrls = photos.map(photo => photo.url);
            // Create profile payload that matches existing schema
            const profilePayload = {
                user_id: user.id,
                bio: profileData.bio,
                email: user.email || '',
                photo_urls: photoUrls,
                updated_at: new Date().toISOString()
            };
            // Add optional fields that may exist in the schema
            if (profileData.values)
                profilePayload.values = profileData.values;
            if (profileData.lifeGoals)
                profilePayload.life_goals = profileData.lifeGoals;
            if (profileData.greenFlags)
                profilePayload.green_flags = profileData.greenFlags;
            if (personalityAnswers && Object.keys(personalityAnswers).length > 0) {
                profilePayload.personality_answers = personalityAnswers;
            }
            if (interests.length > 0)
                profilePayload.interests = interests;
            let result;
            if (profileExists) {
                result = await supabase
                    .from('profiles')
                    .update(profilePayload)
                    .eq('user_id', user.id);
            }
            else {
                profilePayload.created_at = new Date().toISOString();
                result = await supabase
                    .from('profiles')
                    .insert([profilePayload]);
            }
            if (result.error) {
                console.error('Database save error:', result.error);
                toast({
                    title: 'Save Failed',
                    description: 'Failed to save profile to database. Please try again.',
                    variant: 'destructive'
                });
                return;
            }
            // Send data to webhook after successful database save
            await sendToWebhook(profilePayload);
            toast({
                title: 'Profile Saved Successfully',
                description: 'Your comprehensive profile has been updated and sent for matching.',
            });
        }
        catch (error) {
            console.error('Error saving profile:', error);
            toast({
                title: 'Error Saving Profile',
                description: 'Failed to save your profile. Please try again.',
                variant: 'destructive'
            });
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>);
    }
    return (<div className="space-y-6 max-w-4xl mx-auto">
      <ProfileCompletionHeader completionPercentage={completionPercentage}/>

      <ProfileSectionNavigation activeSection={activeSection} setActiveSection={setActiveSection} personalityAnswerCount={Object.keys(personalityAnswers).length} interestCount={interests.length} photoCount={photos.length}/>

      <ProfileSectionContent activeSection={activeSection} profileData={profileData} updateProfileField={updateProfileField} profileExists={profileExists} personalityAnswers={personalityAnswers} onPersonalityAnswerChange={handlePersonalityAnswer} interests={interests} onInterestsChange={setInterests} photos={photos} onPhotosChange={handlePhotosChange}/>

      <ProfileSaveButton onSave={saveCompleteProfile} isSaving={isSaving}/>
    </div>);
};
export default ComprehensiveProfileBuilder;
