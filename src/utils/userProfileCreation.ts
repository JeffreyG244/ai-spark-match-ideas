
import { supabase } from '@/integrations/supabase/client';
import type { DiverseUser } from '@/data/diverseUsersData';

/**
 * Creates a user profile in the database
 */
export async function createUserProfile(user: DiverseUser, userId: string, photoUrls: string[]): Promise<boolean> {
  console.log(`Creating profile for ${user.firstName}...`);
  
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
