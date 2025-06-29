
import { supabase } from '@/integrations/supabase/client';
import { diverseUsersData } from '@/data/diverseUsersData';

/**
 * Creates auth users and their corresponding profiles
 */
export async function seedDiverseUsers() {
  console.log('Starting to seed diverse users...');
  
  for (const user of diverseUsersData) {
    try {
      console.log(`Creating user: ${user.firstName} ${user.lastName}`);
      
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          firstName: user.firstName,
          lastName: user.lastName
        }
      });

      if (authError) {
        console.error(`Auth creation error for ${user.firstName}:`, authError);
        continue;
      }

      const userId = authData.user?.id;
      if (!userId) {
        console.error(`No user ID returned for ${user.firstName}`);
        continue;
      }

      console.log(`Created auth user for ${user.firstName} with ID: ${userId}`);
      
      // Step 2: Create user profile with complete data
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          email: user.email,
          bio: user.bio,
          values: user.values,
          life_goals: user.lifeGoals,
          green_flags: user.greenFlags,
          photos: user.photos,
          interests: user.interests,
          personality_answers: {
            age: user.age.toString(),
            gender: user.gender,
            location: user.location,
            relationship_goals: user.relationshipGoals,
            partner_age_min: Math.max(user.age - 8, 18).toString(),
            partner_age_max: Math.min(user.age + 12, 65).toString(),
            partner_gender: user.genderPreference,
            max_distance: '50',
            occupation: user.occupation,
            education: user.education,
            lifestyle: user.lifestyle,
            deal_breakers: user.dealBreakers
          },
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (profileError) {
        console.error(`Profile creation error for ${user.firstName}:`, profileError);
        continue;
      }

      console.log(`✅ Successfully created profile for ${user.firstName} ${user.lastName}`);
      
      // Wait 1 second between users to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Failed to create user ${user.email}:`, error);
    }
  }
  
  console.log('✅ Finished seeding diverse users!');
}

/**
 * Helper function to check if seeding is needed
 */
export async function checkIfSeedingNeeded(): Promise<boolean> {
  const { count, error } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Error checking profiles:', error);
    return true;
  }
  
  // If there are less than 5 user profiles, we probably need seeding
  return count !== null && count < 5;
}
