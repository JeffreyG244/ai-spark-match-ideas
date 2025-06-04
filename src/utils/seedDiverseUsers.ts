
import { supabase } from '@/integrations/supabase/client';
import { diverseUsersData } from '@/data/diverseUsersData';
import { createAuthUser } from '@/utils/authUserCreation';
import { createUserProfile } from '@/utils/userProfileCreation';
import { uploadProfilePhoto } from '@/utils/photoUploadUtils';

/**
 * Creates auth users and their corresponding profiles
 */
export async function seedDiverseUsers() {
  console.log('Starting to seed diverse users...');
  
  for (const user of diverseUsersData) {
    try {
      // Step 1: Create auth user
      const userId = await createAuthUser(user);
      if (!userId) {
        continue;
      }
      
      // Step 2: Upload profile photos
      const uploadedPhotoUrls: string[] = [];
      
      console.log(`Uploading ${user.photos.length} photos for ${user.firstName}...`);
      
      for (let i = 0; i < user.photos.length; i++) {
        try {
          const photoUrl = await uploadProfilePhoto(userId, user.photos[i], i);
          uploadedPhotoUrls.push(photoUrl);
        } catch (error) {
          console.error(`Failed to upload photo ${i + 1} for ${user.firstName}:`, error);
        }
      }
      
      // Step 3: Create user profile
      await createUserProfile(user, userId, uploadedPhotoUrls);
      
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
