
import { supabase } from '@/integrations/supabase/client';
import type { DiverseUser } from '@/data/diverseUsersData';

/**
 * Creates an auth user with the provided user data
 */
export async function createAuthUser(user: DiverseUser): Promise<string | null> {
  console.log(`Creating auth user for ${user.firstName} ${user.lastName}...`);
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        first_name: user.firstName,
        last_name: user.lastName
      }
    }
  });
  
  if (authError) {
    console.error('Auth creation error:', authError);
    return null;
  }
  
  const userId = authData.user?.id;
  if (!userId) {
    console.error('No user ID returned from auth creation');
    return null;
  }
  
  console.log(`✅ Auth user created: ${userId}`);
  return userId;
}
