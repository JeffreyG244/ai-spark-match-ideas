import { supabase } from '@/integrations/supabase/client';

// More realistic, diverse professional profiles with varied photo styles
const realisticSeedProfiles = [
  // High-Quality Women's Profiles
  {
    first_name: "Sarah",
    last_name: "Chen",
    email: "sarah.chen@professional.com",
    age: 29,
    gender: "Female",
    seeking_gender: "Male",
    orientation: "Straight",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    bio: "Product manager at a tech startup. Love hiking the Bay Area trails, trying new restaurants, and weekend wine tastings. Looking for someone who shares my passion for adventure and good conversation.",
    interests: ["Hiking", "Wine Tasting", "Tech", "Travel", "Fitness"],
    photo_urls: [
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },
  {
    first_name: "Emma",
    last_name: "Rodriguez",
    email: "emma.rodriguez@professional.com",
    age: 31,
    gender: "Female",
    seeking_gender: "Male",
    orientation: "Straight",
    city: "Austin",
    state: "TX",
    country: "United States",
    bio: "Marketing director who loves live music and food trucks. Austin native who knows all the best spots. Looking for someone to explore the city with and maybe catch some shows together.",
    interests: ["Live Music", "Food", "Marketing", "Photography", "Dogs"],
    photo_urls: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },
  {
    first_name: "Jessica",
    last_name: "Park",
    email: "jessica.park@professional.com",
    age: 27,
    gender: "Female",
    seeking_gender: "Male",
    orientation: "Straight",
    city: "Seattle",
    state: "WA",
    country: "United States",
    bio: "Software engineer with a love for coffee and the outdoors. When I'm not coding, you'll find me at Pike Place Market or hiking the Cascades. Seeking someone who appreciates both city life and nature.",
    interests: ["Software Engineering", "Coffee", "Hiking", "Reading", "Yoga"],
    photo_urls: [
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },
  {
    first_name: "Olivia",
    last_name: "Thompson",
    email: "olivia.thompson@professional.com",
    age: 33,
    gender: "Female",
    seeking_gender: "Male",
    orientation: "Straight",
    city: "Chicago",
    state: "IL",
    country: "United States",
    bio: "Environmental lawyer passionate about sustainability. Love farmers markets, cooking, and exploring Chicago's neighborhoods. Looking for someone who cares about making the world better.",
    interests: ["Environmental Law", "Cooking", "Sustainability", "Art", "Travel"],
    photo_urls: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },
  {
    first_name: "Sophia",
    last_name: "Williams",
    email: "sophia.williams@professional.com",
    age: 28,
    gender: "Female",
    seeking_gender: "Male",
    orientation: "Straight",
    city: "New York",
    state: "NY",
    country: "United States",
    bio: "Fashion designer with a studio in Brooklyn. Love art galleries, rooftop bars, and weekend trips upstate. Seeking someone creative who appreciates both culture and adventure.",
    interests: ["Fashion Design", "Art", "Culture", "Travel", "Photography"],
    photo_urls: [
      "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },

  // High-Quality Men's Profiles
  {
    first_name: "Michael",
    last_name: "Johnson",
    email: "michael.johnson@professional.com",
    age: 32,
    gender: "Male",
    seeking_gender: "Female",
    orientation: "Straight",
    city: "Denver",
    state: "CO",
    country: "United States",
    bio: "Investment advisor who loves the mountains. Skiing in winter, hiking in summer. Also enjoy craft beer, cooking, and live music. Looking for an adventurous partner to explore Colorado with.",
    interests: ["Skiing", "Hiking", "Finance", "Craft Beer", "Cooking"],
    photo_urls: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },
  {
    first_name: "David",
    last_name: "Kim",
    email: "david.kim@professional.com",
    age: 30,
    gender: "Male",
    seeking_gender: "Female",
    orientation: "Straight",
    city: "Los Angeles",
    state: "CA",
    country: "United States",
    bio: "Film producer who loves storytelling and great cinematography. When not on set, I'm surfing Malibu or exploring LA's food scene. Seeking someone who appreciates creativity and adventure.",
    interests: ["Film Production", "Surfing", "Food", "Travel", "Photography"],
    photo_urls: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },
  {
    first_name: "James",
    last_name: "Taylor",
    email: "james.taylor@professional.com",
    age: 34,
    gender: "Male",
    seeking_gender: "Female",
    orientation: "Straight",
    city: "Miami",
    state: "FL",
    country: "United States",
    bio: "Architect with a passion for sustainable design. Love beach volleyball, salsa dancing, and exploring Miami's art scene. Looking for someone who enjoys both beach life and cultural experiences.",
    interests: ["Architecture", "Beach Volleyball", "Salsa Dancing", "Art", "Sustainability"],
    photo_urls: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },
  {
    first_name: "Ryan",
    last_name: "Davis",
    email: "ryan.davis@professional.com",
    age: 29,
    gender: "Male",
    seeking_gender: "Female",
    orientation: "Straight",
    city: "Boston",
    state: "MA",
    country: "United States",
    bio: "Doctor who loves helping people and staying active. Marathon runner, book club member, and weekend chef. Seeking someone who values health, learning, and meaningful conversations.",
    interests: ["Medicine", "Running", "Reading", "Cooking", "Health"],
    photo_urls: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },
  {
    first_name: "Alex",
    last_name: "Martinez",
    email: "alex.martinez@professional.com",
    age: 31,
    gender: "Male",
    seeking_gender: "Female",
    orientation: "Straight",
    city: "Portland",
    state: "OR",
    country: "United States",
    bio: "Environmental scientist and craft brewery owner. Love sustainability, great beer, and Pacific Northwest adventures. Looking for someone who shares my passion for the environment and good times.",
    interests: ["Environmental Science", "Brewing", "Sustainability", "Hiking", "Music"],
    photo_urls: [
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },

  // Additional Diverse Profiles
  {
    first_name: "Maria",
    last_name: "Gonzalez",
    email: "maria.gonzalez@professional.com",
    age: 26,
    gender: "Female",
    seeking_gender: "Male",
    orientation: "Straight",
    city: "Phoenix",
    state: "AZ",
    country: "United States",
    bio: "Bilingual teacher who loves cultural exchange and travel. Salsa dancing on weekends, hiking desert trails, and hosting dinner parties. Seeking someone who values family and adventure.",
    interests: ["Teaching", "Salsa Dancing", "Travel", "Cooking", "Languages"],
    photo_urls: [
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  },
  {
    first_name: "Kevin",
    last_name: "Chang",
    email: "kevin.chang@professional.com",
    age: 28,
    gender: "Male",
    seeking_gender: "Female",
    orientation: "Straight",
    city: "San Diego",
    state: "CA",
    country: "United States",
    bio: "Data scientist who loves solving complex problems and spending time outdoors. Surfing, rock climbing, and discovering new breweries. Looking for someone who's curious about the world.",
    interests: ["Data Science", "Surfing", "Rock Climbing", "Technology", "Craft Beer"],
    photo_urls: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&auto=format&q=75",
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=600&fit=crop&auto=format&q=75"
    ],
    visible: true
  }
];

export const seedRealisticProfiles = async (): Promise<{ success: boolean; message: string; count?: number }> => {
  try {
    console.log('Starting to seed realistic professional profiles...');
    
    // Check if profiles already exist
    const { data: existingProfiles, error: checkError } = await supabase
      .from('users')
      .select('email')
      .in('email', realisticSeedProfiles.map(user => user.email));

    if (checkError) {
      console.error('Error checking existing profiles:', checkError);
      return { success: false, message: 'Failed to check existing profiles' };
    }

    const existingEmails = new Set(existingProfiles?.map(p => p.email) || []);
    const newProfiles = realisticSeedProfiles.filter(user => !existingEmails.has(user.email));

    if (newProfiles.length === 0) {
      return { 
        success: true, 
        message: 'All realistic profiles already exist in the database',
        count: 0
      };
    }

    console.log(`Creating ${newProfiles.length} new realistic profiles...`);

    // Create seed profiles for users table
    const seedProfiles = newProfiles.map((user, index) => {
      const seedUserId = `realistic-${user.first_name.toLowerCase()}-${user.last_name.toLowerCase()}-${Date.now()}-${index}`;
      
      return {
        id: seedUserId,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        gender: user.gender,
        city: user.city,
        state: user.state,
        country: user.country,
        bio: user.bio,
        interests: user.interests,
        photos: user.photo_urls,
        date_of_birth: new Date(Date.now() - (user.age * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    // Insert in batches
    const batchSize = 5;
    let insertedCount = 0;

    for (let i = 0; i < seedProfiles.length; i += batchSize) {
      const batch = seedProfiles.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('users')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
      } else {
        insertedCount += batch.length;
        console.log(`Successfully inserted batch ${i / batchSize + 1}: ${batch.length} profiles`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (insertedCount > 0) {
      console.log(`Successfully seeded ${insertedCount} realistic professional profiles!`);
      return { 
        success: true, 
        message: `Successfully seeded ${insertedCount} realistic, high-quality professional profiles!`,
        count: insertedCount
      };
    } else {
      return { 
        success: false, 
        message: 'Failed to insert any profiles due to database errors' 
      };
    }

  } catch (error) {
    console.error('Error seeding realistic profiles:', error);
    return { 
      success: false, 
      message: `Failed to seed profiles: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

export const clearDuplicateProfiles = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Clearing duplicate and low-quality profiles...');
    
    // Get all profiles grouped by email to find duplicates
    const { data: profiles, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return { success: false, message: 'Failed to fetch profiles' };
    }

    if (!profiles || profiles.length === 0) {
      return { success: true, message: 'No profiles found to clean up' };
    }

    // Find duplicates by email
    const emailMap = new Map();
    const duplicateIds = [];

    profiles.forEach(profile => {
      if (emailMap.has(profile.email)) {
        // Keep the most recent one, mark others for deletion
        duplicateIds.push(profile.id);
      } else {
        emailMap.set(profile.email, profile.id);
      }
    });

    if (duplicateIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .in('id', duplicateIds);

      if (deleteError) {
        console.error('Error deleting duplicates:', deleteError);
        return { success: false, message: 'Failed to delete duplicate profiles' };
      }

      console.log(`Successfully removed ${duplicateIds.length} duplicate profiles`);
    }

    return { 
      success: true, 
      message: `Successfully cleaned up ${duplicateIds.length} duplicate profiles`
    };

  } catch (error) {
    console.error('Error cleaning duplicate profiles:', error);
    return { 
      success: false, 
      message: `Failed to clean profiles: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};
