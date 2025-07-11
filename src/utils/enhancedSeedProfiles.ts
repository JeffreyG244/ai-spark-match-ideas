import { supabase } from '@/integrations/supabase/client';

// Enhanced seed profiles with ages 25-45 and diverse backgrounds
const enhancedSeedProfiles = [
  // Women 25-45
  {
    first_name: "Emma",
    last_name: "Rodriguez",
    email: "emma.rodriguez@enhanced.com",
    age: 25,
    gender: "female",
    city: "Miami",
    state: "FL",
    bio: "Marketing coordinator who loves beach volleyball, salsa dancing, and exploring new restaurants. Always up for an adventure!",
    interests: ["Beach Volleyball", "Salsa Dancing", "Food", "Travel", "Marketing"],
    photo_urls: [
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Sophia",
    last_name: "Kim",
    email: "sophia.kim@enhanced.com",
    age: 27,
    gender: "female",
    city: "Seattle",
    state: "WA",
    bio: "Software engineer by day, rock climber by weekend. Love hiking, craft beer, and building cool apps.",
    interests: ["Rock Climbing", "Hiking", "Craft Beer", "Programming", "Outdoors"],
    photo_urls: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Maya",
    last_name: "Patel",
    email: "maya.patel@enhanced.com",
    age: 29,
    gender: "female",
    city: "Chicago",
    state: "IL",
    bio: "Pediatric nurse who loves helping kids and making a difference. Enjoys yoga, cooking, and weekend farmers markets.",
    interests: ["Healthcare", "Yoga", "Cooking", "Farmers Markets", "Kids"],
    photo_urls: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Zoe",
    last_name: "Thompson",
    email: "zoe.thompson@enhanced.com",
    age: 31,
    gender: "female",
    city: "Denver",
    state: "CO",
    bio: "Graphic designer with a passion for sustainability and mountain adventures. Love skiing, camping, and indie music.",
    interests: ["Design", "Sustainability", "Skiing", "Camping", "Indie Music"],
    photo_urls: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Ava",
    last_name: "Wilson",
    email: "ava.wilson@enhanced.com",
    age: 33,
    gender: "female",
    city: "Portland",
    state: "OR",
    bio: "Veterinarian who adores animals and nature. When not caring for pets, I'm hiking trails or reading fantasy novels.",
    interests: ["Animals", "Veterinary", "Hiking", "Reading", "Fantasy"],
    photo_urls: [
      "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Luna",
    last_name: "Garcia",
    email: "luna.garcia@enhanced.com",
    age: 35,
    gender: "female",
    city: "Phoenix",
    state: "AZ",
    bio: "High school teacher passionate about education and travel. Love exploring new cultures, languages, and cuisines.",
    interests: ["Teaching", "Travel", "Languages", "Culture", "Education"],
    photo_urls: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Aria",
    last_name: "Davis",
    email: "aria.davis@enhanced.com",
    age: 37,
    gender: "female",
    city: "Boston",
    state: "MA",
    bio: "Financial advisor who enjoys helping people secure their futures. Love sailing, wine tasting, and historical fiction.",
    interests: ["Finance", "Sailing", "Wine", "History", "Books"],
    photo_urls: [
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Chloe",
    last_name: "Anderson",
    email: "chloe.anderson@enhanced.com",
    age: 39,
    gender: "female",
    city: "Nashville",
    state: "TN",
    bio: "Music therapist who believes in the healing power of music. Love concerts, songwriting, and volunteering at shelters.",
    interests: ["Music Therapy", "Concerts", "Songwriting", "Volunteering", "Healing"],
    photo_urls: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Nora",
    last_name: "Mitchell",
    email: "nora.mitchell@enhanced.com",
    age: 41,
    gender: "female",
    city: "San Diego",
    state: "CA",
    bio: "Physical therapist helping people regain mobility and strength. Enjoy surfing, CrossFit, and healthy cooking.",
    interests: ["Physical Therapy", "Surfing", "CrossFit", "Healthy Cooking", "Fitness"],
    photo_urls: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Ivy",
    last_name: "Taylor",
    email: "ivy.taylor@enhanced.com",
    age: 43,
    gender: "female",
    city: "Atlanta",
    state: "GA",
    bio: "Real estate agent who loves showing people their dream homes. Passionate about interior design, gardening, and family time.",
    interests: ["Real Estate", "Interior Design", "Gardening", "Family", "Home"],
    photo_urls: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },
  {
    first_name: "Ruby",
    last_name: "White",
    email: "ruby.white@enhanced.com",
    age: 45,
    gender: "female",
    city: "Minneapolis",
    state: "MN",
    bio: "University professor researching environmental science. Love nature photography, cross-country skiing, and sustainability.",
    interests: ["Environmental Science", "Photography", "Skiing", "Sustainability", "Research"],
    photo_urls: [
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&h=600&fit=crop"
    ],
    seeking_gender: "male"
  },

  // Men 25-45
  {
    first_name: "Ethan",
    last_name: "Rodriguez",
    email: "ethan.rodriguez@enhanced.com",
    age: 25,
    gender: "male",
    city: "Los Angeles",
    state: "CA",
    bio: "Personal trainer passionate about fitness and helping others reach their goals. Love surfing, meal prep, and motivational podcasts.",
    interests: ["Fitness", "Surfing", "Nutrition", "Podcasts", "Motivation"],
    photo_urls: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Mason",
    last_name: "Chen",
    email: "mason.chen@enhanced.com",
    age: 27,
    gender: "male",
    city: "New York",
    state: "NY",
    bio: "Investment banker who works hard and plays hard. Enjoy fine dining, jazz clubs, and weekend trips to the Hamptons.",
    interests: ["Finance", "Jazz", "Fine Dining", "Travel", "Investment"],
    photo_urls: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Liam",
    last_name: "Johnson",
    email: "liam.johnson@enhanced.com",
    age: 29,
    gender: "male",
    city: "Chicago",
    state: "IL",
    bio: "Architect designing sustainable buildings. Love sketching, urban exploration, and discovering hidden gems in the city.",
    interests: ["Architecture", "Sustainability", "Sketching", "Urban Exploration", "Design"],
    photo_urls: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Noah",
    last_name: "Davis",
    email: "noah.davis@enhanced.com",
    age: 31,
    gender: "male",
    city: "Austin",
    state: "TX",
    bio: "Software developer by day, musician by night. Love coding innovative solutions and jamming with my band on weekends.",
    interests: ["Programming", "Music", "Innovation", "Bands", "Technology"],
    photo_urls: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Oliver",
    last_name: "Martinez",
    email: "oliver.martinez@enhanced.com",
    age: 33,
    gender: "male",
    city: "Denver",
    state: "CO",
    bio: "Emergency room physician dedicated to saving lives. When not at the hospital, I'm mountain biking or rock climbing.",
    interests: ["Medicine", "Mountain Biking", "Rock Climbing", "Emergency Care", "Outdoors"],
    photo_urls: [
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Lucas",
    last_name: "Thompson",
    email: "lucas.thompson@enhanced.com",
    age: 35,
    gender: "male",
    city: "Seattle",
    state: "WA",
    bio: "Environmental engineer working on clean energy solutions. Love hiking, craft coffee, and sustainable living.",
    interests: ["Environmental Engineering", "Hiking", "Coffee", "Sustainability", "Clean Energy"],
    photo_urls: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Alexander",
    last_name: "Garcia",
    email: "alexander.garcia@enhanced.com",
    age: 37,
    gender: "male",
    city: "Phoenix",
    state: "AZ",
    bio: "High school football coach inspiring the next generation. Enjoy desert hiking, BBQ cooking, and sports analytics.",
    interests: ["Coaching", "Football", "Hiking", "BBQ", "Sports"],
    photo_urls: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Ryan",
    last_name: "Wilson",
    email: "ryan.wilson@enhanced.com",
    age: 39,
    gender: "male",
    city: "Portland",
    state: "OR",
    bio: "Craft brewery owner passionate about creating unique flavors. Love beer tasting, food pairing, and live music venues.",
    interests: ["Brewing", "Beer", "Food Pairing", "Music", "Entrepreneurship"],
    photo_urls: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Jack",
    last_name: "Brown",
    email: "jack.brown@enhanced.com",
    age: 41,
    gender: "male",
    city: "Nashville",
    state: "TN",
    bio: "Recording studio owner working with amazing artists. Love music production, songwriting, and discovering new talent.",
    interests: ["Music Production", "Songwriting", "Recording", "Artist Development", "Audio"],
    photo_urls: [
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Daniel",
    last_name: "Lee",
    email: "daniel.lee@enhanced.com",
    age: 43,
    gender: "male",
    city: "San Diego",
    state: "CA",
    bio: "Marine biologist studying ocean conservation. Passionate about scuba diving, underwater photography, and protecting marine life.",
    interests: ["Marine Biology", "Scuba Diving", "Photography", "Conservation", "Ocean"],
    photo_urls: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  },
  {
    first_name: "Michael",
    last_name: "Taylor",
    email: "michael.taylor@enhanced.com",
    age: 45,
    gender: "male",
    city: "Boston",
    state: "MA",
    bio: "History professor and published author. Love traveling to historical sites, writing, and sharing fascinating stories from the past.",
    interests: ["History", "Writing", "Travel", "Teaching", "Research"],
    photo_urls: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop"
    ],
    seeking_gender: "female"
  }
];

export const seedEnhancedProfiles = async (): Promise<{ success: boolean; message: string; count?: number }> => {
  try {
    console.log('Starting to seed enhanced dating profiles (25-45 years old)...');
    
    // Check if profiles already exist
    const { data: existingProfiles } = await supabase
      .from('dating_profiles')
      .select('email')
      .in('email', enhancedSeedProfiles.map(user => user.email));

    const existingEmails = new Set(existingProfiles?.map(p => p.email) || []);
    console.log(`Found ${existingEmails.size} existing enhanced profiles`);

    // Filter out existing profiles
    const newProfiles = enhancedSeedProfiles.filter(user => !existingEmails.has(user.email));
    
    if (newProfiles.length === 0) {
      console.log('All enhanced profiles already exist');
      return {
        success: true,
        message: 'All enhanced profiles already exist in the database',
        count: 0
      };
    }

    // Create profiles for dating_profiles table
    const profilesData = newProfiles.map((user, index) => ({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      city: user.city,
      state: user.state,
      country: "United States",
      bio: user.bio,
      interests: user.interests,
      photo_urls: user.photo_urls,
      profile_image_url: user.photo_urls[0],
      visible: true,
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1, // Random coordinates around NYC
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      location: `${user.city}, ${user.state}`,
      seeking_gender: user.seeking_gender,
      orientation: "straight"
    }));

    // Insert profiles in batches
    const batchSize = 10;
    let insertedCount = 0;

    for (let i = 0; i < profilesData.length; i += batchSize) {
      const batch = profilesData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('dating_profiles')
        .insert(batch)
        .select();

      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }

      insertedCount += batch.length;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}, total: ${insertedCount}`);
    }

    // Create compatibility answers for all new profiles
    const compatibilityAnswers = profilesData.map(profile => ({
      user_id: profile.email.replace('@enhanced.com', ''), // Use email prefix as user_id for seeding
      answers: {
        '7': profile.gender === 'male' ? 'Male' : 'Female', // Gender
        '12': profile.seeking_gender === 'male' ? 'Men' : 'Women', // Seeking
        '1': 'Serious long-term relationship', // Relationship goals
        '2': profile.age < 30 ? '25-30' : profile.age < 35 ? '30-35' : profile.age < 40 ? '35-40' : '40-45', // Age preference
        '3': 'Very important', // Family importance
        '4': 'Social drinker', // Drinking habits
        '5': 'Non-smoker', // Smoking
        '6': 'Regularly', // Exercise
        '8': 'College graduate', // Education
        '9': profile.city, // Location
        '10': 'Monogamous', // Relationship style
        '11': 'Yes', // Want children
      },
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert compatibility answers in batches
    for (let i = 0; i < compatibilityAnswers.length; i += batchSize) {
      const batch = compatibilityAnswers.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('compatibility_answers')
        .insert(batch);

      if (error) {
        console.error('Error inserting compatibility answers:', error);
        // Continue even if compatibility answers fail
      }
    }

    if (insertedCount > 0) {
      console.log(`Successfully seeded ${insertedCount} enhanced dating profiles!`);
      return {
        success: true,
        message: `Successfully seeded ${insertedCount} enhanced dating profiles (ages 25-45) with compatibility answers!`,
        count: insertedCount
      };
    } else {
      return {
        success: false,
        message: 'No new profiles were created'
      };
    }
  } catch (error) {
    console.error('Error seeding enhanced profiles:', error);
    return {
      success: false,
      message: `Failed to seed profiles: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};