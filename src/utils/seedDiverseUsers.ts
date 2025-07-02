
import { supabase } from '@/integrations/supabase/client';
import { diverseUsersData } from '@/data/diverseUsersData';

export const checkIfSeedingNeeded = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id', { count: 'exact' });

    if (error) {
      console.error('Error checking profiles count:', error);
      return true;
    }

    const count = data?.length || 0;
    console.log(`Found ${count} existing profiles`);
    return count < 10; // Reduced threshold for testing
  } catch (error) {
    console.error('Error in checkIfSeedingNeeded:', error);
    return true;
  }
};

export const seedDiverseUsers = async (): Promise<{ success: boolean; message: string; count?: number }> => {
  try {
    console.log('Starting to seed diverse users for discovery...');
    
    // Check if seed profiles already exist to prevent duplicates
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .in('email', diverseUsersData.map(user => user.email));

    if (checkError) {
      console.error('Error checking existing profiles:', checkError);
      return { success: false, message: 'Failed to check existing profiles' };
    }

    const existingEmails = new Set(existingProfiles?.map(p => p.email) || []);
    const newUsers = diverseUsersData.filter(user => !existingEmails.has(user.email));

    if (newUsers.length === 0) {
      return { 
        success: true, 
        message: 'All seed profiles already exist in the database',
        count: 0
      };
    }

    console.log(`Creating ${newUsers.length} new seed profiles for discovery...`);

    // Create profiles that can be discovered by all users
    const seedProfiles = newUsers.map((user, index) => {
      // Create deterministic but unique user IDs for seed profiles
      const seedUserId = `seed-${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}-${Date.now()}-${index}`;
      
      return {
        user_id: seedUserId,
        email: user.email,
        bio: user.bio,
        photo_urls: user.photos,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    // Insert seed profiles in smaller batches
    const batchSize = 5;
    let insertedCount = 0;

    for (let i = 0; i < seedProfiles.length; i += batchSize) {
      const batch = seedProfiles.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        // Continue with other batches instead of failing completely
      } else {
        insertedCount += batch.length;
        console.log(`Successfully inserted batch ${i / batchSize + 1}: ${batch.length} profiles`);
      }
      
      // Small delay between batches to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (insertedCount > 0) {
      console.log(`Successfully seeded ${insertedCount} diverse profiles for discovery!`);
      return { 
        success: true, 
        message: `Successfully seeded ${insertedCount} professional profiles for your dating platform!`,
        count: insertedCount
      };
    } else {
      return { 
        success: false, 
        message: 'Failed to insert any profiles due to database errors' 
      };
    }

  } catch (error) {
    console.error('Error seeding diverse users:', error);
    return { 
      success: false, 
      message: `Failed to seed profiles: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};
