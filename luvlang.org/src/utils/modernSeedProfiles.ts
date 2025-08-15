import { supabase } from '@/integrations/supabase/client';

// Modern, attractive seed profiles with professional photos
const modernSeedProfiles = [
  // Women
  {
    first_name: "Sophia",
    last_name: "Martinez",
    email: "sophia.martinez@dating.com",
    age: 28,
    gender: "Female",
    city: "New York",
    state: "NY",
    bio: "Creative marketing director who loves art galleries, yoga, and weekend brunches. Looking for someone who appreciates both spontaneous adventures and cozy nights in.",
    interests: ["Art", "Yoga", "Brunch", "Travel", "Photography"],
    photo_urls: [
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Looking for genuine connections with ambitious, kind-hearted men aged 26-35",
    relationship_goals: "Long-term relationship leading to marriage"
  },
  {
    first_name: "Isabella",
    last_name: "Chen",
    email: "isabella.chen@dating.com",
    age: 30,
    gender: "Female",
    city: "San Francisco",
    state: "CA",
    bio: "Tech entrepreneur passionate about innovation and social impact. When I'm not building the next big thing, you'll find me hiking trails or trying new restaurants.",
    interests: ["Technology", "Hiking", "Entrepreneurship", "Fine Dining", "Sustainability"],
    photo_urls: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Seeking intellectually curious, ambitious men who share my passion for making a difference",
    relationship_goals: "Equal partnership with shared goals and values"
  },
  {
    first_name: "Aria",
    last_name: "Johnson",
    email: "aria.johnson@dating.com",
    age: 26,
    gender: "Female",
    city: "Austin",
    state: "TX",
    bio: "Pediatric nurse with a heart for helping others. I love live music, outdoor festivals, and making people smile. Family and genuine connections mean everything to me.",
    interests: ["Music", "Healthcare", "Festivals", "Family", "Community Service"],
    photo_urls: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Looking for a caring, family-oriented man who values kindness and authenticity",
    relationship_goals: "Building a loving family together"
  },
  {
    first_name: "Maya",
    last_name: "Patel",
    email: "maya.patel@dating.com",
    age: 32,
    gender: "Female",
    city: "Seattle",
    state: "WA",
    bio: "Environmental lawyer fighting for our planet's future. I'm passionate about sustainability, rock climbing, and finding balance in everything I do.",
    interests: ["Environmental Law", "Rock Climbing", "Sustainability", "Meditation", "Travel"],
    photo_urls: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Seeking an environmentally conscious, active man who shares my values",
    relationship_goals: "Partnership built on shared values and mutual growth"
  },
  {
    first_name: "Zoe",
    last_name: "Williams",
    email: "zoe.williams@dating.com",
    age: 29,
    gender: "Female",
    city: "Chicago",
    state: "IL",
    bio: "Financial advisor by day, foodie by night. I love exploring new cuisines, wine tastings, and helping people achieve their dreams. Looking for my partner in all adventures.",
    interests: ["Finance", "Cooking", "Wine", "Travel", "Personal Development"],
    photo_urls: [
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1594736797933-d0f06ba4e356?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Looking for an ambitious, genuine man who loves good food and great conversations",
    relationship_goals: "Long-term commitment with shared financial and life goals"
  },

  // Men
  {
    first_name: "Alexander",
    last_name: "Rodriguez",
    email: "alexander.rodriguez@dating.com",
    age: 31,
    gender: "Male",
    city: "Miami",
    state: "FL",
    bio: "Architect who believes in designing not just buildings, but a beautiful life. I'm passionate about modern design, salsa dancing, and exploring new cultures.",
    interests: ["Architecture", "Design", "Dancing", "Culture", "Travel"],
    photo_urls: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Seeking a creative, passionate woman who loves culture and adventure",
    relationship_goals: "Building something beautiful together, both in life and love"
  },
  {
    first_name: "Ethan",
    last_name: "Thompson",
    email: "ethan.thompson@dating.com",
    age: 33,
    gender: "Male",
    city: "Denver",
    state: "CO",
    bio: "Software engineer and outdoor enthusiast. Whether I'm coding the next breakthrough or conquering mountain peaks, I bring passion to everything I do.",
    interests: ["Technology", "Mountain Climbing", "Skiing", "Innovation", "Outdoor Adventures"],
    photo_urls: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Looking for an adventurous, independent woman who loves the outdoors",
    relationship_goals: "Partnership filled with adventure and mutual support"
  },
  {
    first_name: "Noah",
    last_name: "Davis",
    email: "noah.davis@dating.com",
    age: 29,
    gender: "Male",
    city: "Boston",
    state: "MA",
    bio: "Doctor specializing in cardiology, dedicated to saving lives and living life to the fullest. I enjoy cooking, jazz music, and meaningful conversations over coffee.",
    interests: ["Medicine", "Cooking", "Jazz", "Coffee", "Health & Wellness"],
    photo_urls: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Seeking a compassionate, intelligent woman who values health and family",
    relationship_goals: "Marriage and building a healthy, loving family"
  },
  {
    first_name: "Lucas",
    last_name: "Kim",
    email: "lucas.kim@dating.com",
    age: 27,
    gender: "Male",
    city: "Portland",
    state: "OR",
    bio: "Creative director and photographer capturing life's beautiful moments. When I'm not behind the camera, I'm exploring coffee shops, art galleries, or planning my next adventure.",
    interests: ["Photography", "Art", "Coffee", "Creativity", "Adventure"],
    photo_urls: [
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Looking for an artistic, creative woman who appreciates beauty in everyday life",
    relationship_goals: "Deep emotional connection and creative partnership"
  },
  {
    first_name: "Gabriel",
    last_name: "Anderson",
    email: "gabriel.anderson@dating.com",
    age: 34,
    gender: "Male",
    city: "Los Angeles",
    state: "CA",
    bio: "Investment banker turned startup founder. I believe in working hard and playing harder. Love surfing, fitness, and exploring LA's vibrant food scene.",
    interests: ["Business", "Surfing", "Fitness", "Food", "Entrepreneurship"],
    photo_urls: [
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=600&fit=crop&auto=format"
    ],
    partner_preferences: "Seeking an ambitious, fun-loving woman who's ready for life's adventures",
    relationship_goals: "Power couple building an amazing life together"
  }
];

export const seedModernProfiles = async (): Promise<{ success: boolean; message: string; count?: number }> => {
  try {
    console.log('Starting to seed modern dating profiles...');
    
    // Check if profiles already exist
    const { data: existingProfiles, error: checkError } = await supabase
      .from('dating_profiles')
      .select('email')
      .in('email', modernSeedProfiles.map(user => user.email));

    if (checkError) {
      console.error('Error checking existing profiles:', checkError);
      return { success: false, message: 'Failed to check existing profiles' };
    }

    const existingEmails = new Set(existingProfiles?.map(p => p.email) || []);
    const newProfiles = modernSeedProfiles.filter(user => !existingEmails.has(user.email));

    if (newProfiles.length === 0) {
      return { 
        success: true, 
        message: 'All modern profiles already exist in the database',
        count: 0
      };
    }

    console.log(`Creating ${newProfiles.length} new modern profiles...`);

    // Create seed profiles for dating_profiles table
    const seedProfiles = newProfiles.map((user, index) => {
      const seedUserId = `modern-${user.first_name.toLowerCase()}-${user.last_name.toLowerCase()}-${Date.now()}-${index}`;
      
      return {
        user_id: seedUserId,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        gender: user.gender,
        city: user.city,
        state: user.state,
        bio: user.bio,
        interests: user.interests,
        photo_urls: user.photo_urls,
        partner_preferences: user.partner_preferences,
        relationship_goals: user.relationship_goals,
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
        .from('dating_profiles')
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
      console.log(`Successfully seeded ${insertedCount} modern dating profiles!`);
      return { 
        success: true, 
        message: `Successfully seeded ${insertedCount} modern, attractive dating profiles!`,
        count: insertedCount
      };
    } else {
      return { 
        success: false, 
        message: 'Failed to insert any profiles due to database errors' 
      };
    }

  } catch (error) {
    console.error('Error seeding modern profiles:', error);
    return { 
      success: false, 
      message: `Failed to seed profiles: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};