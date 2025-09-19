
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
    .from('users')
    .insert({
      id: userId,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      age: user.age,
      bio: user.bio,
      photos: photoUrls,
      city: user.location.split(',')[0].trim(),
      date_of_birth: new Date(Date.now() - (user.age * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
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

// Function to get secure photo URL using Supabase storage
function getSecurePhotoUrl(filename: string) {
  return `https://tzskjzkolyiwhijslqmq.supabase.co/storage/v1/object/public/profile-photos/${filename}`;
}

export async function updateProfilePhotos(user: DiverseUser, userId: string, photoUrls: string[]) {
  console.log(`Updating photos for ${user.firstName}...`);

  // Convert all photo URLs to secure versions
  const securePhotoUrls = photoUrls.map(url => {
    const filename = url.split('/').pop(); // Extract filename
    return getSecurePhotoUrl(filename!);
  });

  const { error: updateError } = await supabase
    .from('users')
    .update({
      photos: securePhotoUrls,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Photo update error:', updateError);
    return false;
  }

  console.log(`✅ Photos updated successfully for ${user.firstName}`);
  return true;
}
