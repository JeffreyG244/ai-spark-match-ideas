
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Sample diverse user data
const diverseUsers = [
  {
    email: 'sophia.wong@example.com',
    password: 'Password123!',
    firstName: 'Sophia',
    lastName: 'Wong',
    bio: 'Software engineer with a passion for sustainable tech. Love hiking on weekends and experimenting with plant-based cooking.',
    values: 'Compassion, innovation, and continuous learning guide my decisions.',
    lifeGoals: 'Building technology that helps people connect meaningfully while reducing our environmental footprint.',
    greenFlags: 'Someone who values deep conversations, respects different perspectives, and has their own passions.',
    gender: 'female',
    ageGroup: '25-35',
    ethnicity: 'Asian',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?q=80&w=400&h=400&fit=crop'
    ]
  },
  {
    email: 'marcus.johnson@example.com',
    password: 'Password123!',
    firstName: 'Marcus',
    lastName: 'Johnson',
    bio: 'Music producer and amateur chef. Looking for someone who appreciates good food and soulful music.',
    values: 'Creativity, authenticity, and bringing joy to others through art.',
    lifeGoals: 'Open my own recording studio and teach music to underprivileged kids.',
    greenFlags: 'Someone who isn\'t afraid to be silly, appreciates art, and treats everyone with respect.',
    gender: 'male',
    ageGroup: '30-40',
    ethnicity: 'Black',
    photos: [
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=400&h=400&fit=crop'
    ]
  },
  {
    email: 'elena.garcia@example.com',
    password: 'Password123!',
    firstName: 'Elena',
    lastName: 'Garcia',
    bio: 'Architect by day, salsa dancer by night. I believe in sustainable design and building communities through shared spaces.',
    values: 'Family, cultural heritage, environmental responsibility, and artistic expression.',
    lifeGoals: 'Design affordable eco-housing that brings people together rather than isolates them.',
    greenFlags: 'Someone who appreciates culture, dances like no one is watching, and wants to make a difference.',
    gender: 'female',
    ageGroup: '30-40',
    ethnicity: 'Hispanic',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&h=400&fit=crop'
    ]
  },
  {
    email: 'raj.patel@example.com',
    password: 'Password123!',
    firstName: 'Raj',
    lastName: 'Patel',
    bio: 'Doctor specializing in global health. I love traveling, trying new cuisines, and meaningful conversations about how we can improve healthcare access.',
    values: 'Compassion, equity, continuous learning, and finding joy in everyday moments.',
    lifeGoals: 'Establish medical clinics in underserved areas and advocate for healthcare as a human right.',
    greenFlags: 'Someone with empathy, intellectual curiosity, and who challenges me to grow.',
    gender: 'male',
    ageGroup: '35-45',
    ethnicity: 'South Asian',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&h=400&fit=crop'
    ]
  },
  {
    email: 'aisha.abdullah@example.com',
    password: 'Password123!',
    firstName: 'Aisha',
    lastName: 'Abdullah',
    bio: 'Fintech entrepreneur passionate about financial inclusion. When not working, you\'ll find me rock climbing or volunteering with youth programs.',
    values: 'Innovation, social impact, resilience, and creating opportunities for others.',
    lifeGoals: 'Build tech solutions that help people in developing countries access financial services and education.',
    greenFlags: 'Someone ambitious but humble, who values giving back and isn\'t afraid of adventure.',
    gender: 'female',
    ageGroup: '25-35',
    ethnicity: 'Middle Eastern',
    photos: [
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=400&h=400&fit=crop'
    ]
  },
  {
    email: 'david.kim@example.com',
    password: 'Password123!',
    firstName: 'David',
    lastName: 'Kim',
    bio: 'Environmental scientist working on ocean conservation. I\'m happiest when I\'m diving, hiking, or having deep conversations about how we can protect our planet.',
    values: 'Environmental stewardship, intellectual honesty, and finding purpose through protecting nature.',
    lifeGoals: 'Develop innovative solutions for ocean plastic pollution and inspire the next generation of environmental advocates.',
    greenFlags: 'Someone who loves the outdoors, asks thoughtful questions, and lives mindfully.',
    gender: 'male',
    ageGroup: '30-40',
    ethnicity: 'East Asian',
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&h=400&fit=crop'
    ]
  },
  {
    email: 'maya.jackson@example.com',
    password: 'Password123!',
    firstName: 'Maya',
    lastName: 'Jackson',
    bio: 'Artist and educator focused on empowering youth through creative expression. I believe art can heal communities and bridge cultural divides.',
    values: 'Creativity, empowerment, cultural appreciation, and finding beauty in diversity.',
    lifeGoals: 'Create community art spaces in underserved neighborhoods and develop arts education programs that celebrate cultural heritage.',
    greenFlags: 'Someone who appreciates diversity, supports my passion projects, and has their own creative pursuits.',
    gender: 'female',
    ageGroup: '25-35',
    ethnicity: 'Mixed/Multiracial',
    photos: [
      'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&fit=crop'
    ]
  },
  {
    email: 'james.miller@example.com',
    password: 'Password123!',
    firstName: 'James',
    lastName: 'Miller',
    bio: 'Retired military now working in cybersecurity. I love woodworking, cooking for friends, and mentoring young professionals in my field.',
    values: 'Integrity, service to others, lifelong learning, and finding purpose in my second career.',
    lifeGoals: 'Build a sustainable homestead and create a mentorship program for veterans transitioning to tech careers.',
    greenFlags: 'Someone grounded, authentic, who values emotional intelligence and has a good sense of humor.',
    gender: 'male',
    ageGroup: '45-55',
    ethnicity: 'White',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&h=400&fit=crop'
    ]
  },
  {
    email: 'zara.hassan@example.com',
    password: 'Password123!',
    firstName: 'Zara',
    lastName: 'Hassan',
    bio: 'Pediatrician and children\'s book author. I believe in the healing power of stories and laughter. Looking for someone kind and thoughtful.',
    values: 'Compassion, joy in simple things, work-life balance, and making a difference in children\'s lives.',
    lifeGoals: 'Create a series of children\'s books that help kids understand and navigate big emotions.',
    greenFlags: 'Someone patient, family-oriented, who can be silly and serious in equal measure.',
    gender: 'female',
    ageGroup: '35-45',
    ethnicity: 'South Asian',
    photos: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=400&h=400&fit=crop'
    ]
  },
  {
    email: 'leo.rodriguez@example.com',
    password: 'Password123!',
    firstName: 'Leo',
    lastName: 'Rodriguez',
    bio: 'Sustainable urban farmer and community organizer. I grow food in city spaces and teach others to do the same. Let\'s build a greener future together.',
    values: 'Environmental stewardship, community resilience, knowledge sharing, and finding joy in growing things.',
    lifeGoals: 'Create a network of urban farms that provide fresh food and green jobs in cities across the country.',
    greenFlags: 'Someone who doesn\'t mind dirt under their fingernails, cares about sustainability, and wants to build something meaningful.',
    gender: 'male',
    ageGroup: '30-40',
    ethnicity: 'Hispanic',
    photos: [
      'https://images.unsplash.com/photo-1534614971-6be99a7a3ffd?q=80&w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1563452965085-2e77e5bf2607?q=80&w=400&h=400&fit=crop'
    ]
  }
];

/**
 * Downloads an image from a URL and returns it as a Blob
 */
async function fetchImageAsBlob(imageUrl: string): Promise<Blob> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
}

/**
 * Uploads a photo to the user's folder in the storage bucket
 */
async function uploadProfilePhoto(userId: string, imageUrl: string, index: number): Promise<string> {
  try {
    console.log(`Downloading image from ${imageUrl}`);
    const blob = await fetchImageAsBlob(imageUrl);
    
    const filename = `${userId}/${Date.now()}_photo_${index + 1}.jpg`;
    console.log(`Uploading to profile-photos/${filename}`);
    
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filename);
      
    console.log('Photo uploaded successfully:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

/**
 * Creates auth users and their corresponding profiles
 */
export async function seedDiverseUsers() {
  console.log('Starting to seed diverse users...');
  
  for (const user of diverseUsers) {
    try {
      // Step 1: Create auth user
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
        continue;
      }
      
      const userId = authData.user?.id;
      if (!userId) {
        console.error('No user ID returned from auth creation');
        continue;
      }
      
      console.log(`✅ Auth user created: ${userId}`);
      
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
          photos: uploadedPhotoUrls,
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (profileError) {
        console.error('Profile creation error:', profileError);
        continue;
      }
      
      console.log(`✅ Profile created successfully for ${user.firstName} ${user.lastName}`);
      
      // Wait 1 second between users to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Failed to create user ${user.email}:`, error);
    }
  }
  
  console.log('✅ Finished seeding diverse users!');
}

// Helper function to check if seeding is needed
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
