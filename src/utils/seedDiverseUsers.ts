
import { supabase } from '@/integrations/supabase/client';
import { diverseUsersData } from '@/data/diverseUsersData';

export const checkIfSeedingNeeded = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id', { count: 'exact' });

    if (error) {
      console.error('Error checking profiles count:', error);
      return true; // Default to needing seeding if we can't check
    }

    // If we have fewer than 5 profiles, we need seeding
    const count = data?.length || 0;
    return count < 5;
  } catch (error) {
    console.error('Error in checkIfSeedingNeeded:', error);
    return true; // Default to needing seeding if there's an error
  }
};

export const seedDiverseUsers = async (): Promise<{ success: boolean; message: string; count?: number }> => {
  try {
    console.log('Starting to seed diverse users...');
    
    // Check if users already exist to prevent duplicates
    const { data: existingUsers, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .in('email', diverseUsersData.map(user => user.email));

    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return { success: false, message: 'Failed to check existing users' };
    }

    const existingEmails = new Set(existingUsers?.map(u => u.email) || []);
    const newUsers = diverseUsersData.filter(user => !existingEmails.has(user.email));

    if (newUsers.length === 0) {
      return { 
        success: true, 
        message: 'All diverse users already exist in the database',
        count: 0
      };
    }

    console.log(`Inserting ${newUsers.length} new diverse users...`);

    // Prepare user profiles for insertion
    const userProfiles = newUsers.map(user => ({
      // Generate a fake user_id for each profile (in a real app, this would come from auth.users)
      user_id: `fake-${user.email.split('@')[0]}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: user.email,
      bio: user.bio,
      photo_urls: user.photos,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert profiles in batches to avoid overwhelming the database
    const batchSize = 10;
    let insertedCount = 0;

    for (let i = 0; i < userProfiles.length; i += batchSize) {
      const batch = userProfiles.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        return { 
          success: false, 
          message: `Failed to insert user batch: ${insertError.message}` 
        };
      }

      insertedCount += batch.length;
      console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length} users (Total: ${insertedCount})`);
    }

    console.log(`Successfully seeded ${insertedCount} diverse users!`);
    
    return { 
      success: true, 
      message: `Successfully seeded ${insertedCount} diverse professional users!`,
      count: insertedCount
    };

  } catch (error) {
    console.error('Error seeding diverse users:', error);
    return { 
      success: false, 
      message: `Failed to seed users: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};
