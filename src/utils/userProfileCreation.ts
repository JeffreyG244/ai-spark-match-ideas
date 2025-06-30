
import { supabase } from '@/integrations/supabase/client';
import type { DiverseUser } from '@/data/diverseUsersData';

/**
 * Creates a user profile in the database
 */
export async function createUserProfile(user: DiverseUser, userId: string, photoUrls: string[]): Promise<boolean> {
  console.log(`Creating profile for ${user.firstName}...`);
  
  // Create comprehensive personality answers for matching
  const personalityAnswers = {
    age: user.age.toString(),
    gender: user.gender,
    location: user.location,
    relationship_goals: user.relationshipGoals || 'Long-term relationship',
    partner_age_min: Math.max(user.age - 8, 18).toString(),
    partner_age_max: Math.min(user.age + 12, 65).toString(),
    partner_gender: user.genderPreference || 'Any',
    max_distance: '50',
    occupation: user.occupation || 'Professional',
    education: user.education || 'College Graduate',
    lifestyle: user.lifestyle || 'Active',
    deal_breakers: user.dealBreakers || 'Dishonesty, lack of ambition'
  };
  
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      email: user.email,
      bio: user.bio,
      values: user.values,
      life_goals: user.lifeGoals,
      green_flags: user.greenFlags,
      photos: photoUrls,
      interests: user.interests,
      personality_answers: personalityAnswers,
      verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
  if (profileError) {
    console.error('Profile creation error:', profileError);
    return false;
  }
  
  console.log(`✅ Profile created successfully for ${user.firstName} ${user.lastName}`);
  return true;
}
import { supabase } from '@/integrations/supabase/client';
import type { Diverselser } from '@/data/diverselsersData';

// ADD THIS FUNCTION (paste near top after imports)
function getSecurePhotoUrl(filename: string) {
  return `https://storage.luvlang.org/storage/v1/object/public/profile-photos/${filename}`;
}

export async function createUserProfile(user: Diverselser, userId: string, photoUrls: string[]) {
  console.log(`Creating profile for ${user.firstName}...`);

  // Convert all photo URLs to secure versions (ADD THIS)
  const securePhotoUrls = photoUrls.map(url => {
    const filename = url.split('/').pop(); // Extract filename
    return getSecurePhotoUrl(filename!);
  });

  const personalityAnswers = {
    // ... (keep your existing code)
  };

  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      email: user.email,
      bio: user.bio,
      photos: securePhotoUrls, // CHANGED: Now uses HTTPS URLs
      // ... (rest of your existing fields)
    });
}