import { supabase } from '@/integrations/supabase/client';
// Diverse, inclusive seed profiles with LGBTQ+ representation
const diverseSeedProfiles = [
    // Lesbian Women
    {
        first_name: "Riley",
        last_name: "Thompson",
        email: "riley.thompson@dating.com",
        age: 29,
        gender: "Female",
        city: "Portland",
        state: "OR",
        bio: "Environmental scientist and avid rock climber. I love exploring national parks, sustainable living, and cozy coffee shop dates. Looking for a genuine connection with someone who shares my passion for nature.",
        interests: ["Rock Climbing", "Environmental Science", "Sustainability", "Coffee", "National Parks"],
        photo_urls: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Seeking an adventurous, environmentally conscious woman who loves the outdoors",
        relationship_goals: "Long-term partnership built on shared values and adventures"
    },
    {
        first_name: "Taylor",
        last_name: "Brooks",
        email: "taylor.brooks@dating.com",
        age: 27,
        gender: "Female",
        city: "San Francisco",
        state: "CA",
        bio: "Software engineer by day, indie musician by night. I write songs about love, life, and everything in between. Looking for someone to harmonize with both musically and romantically.",
        interests: ["Music", "Software Engineering", "Indie Rock", "Songwriting", "Live Music"],
        photo_urls: [
            "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Looking for a creative, music-loving woman who appreciates authentic connections",
        relationship_goals: "Deep emotional bond with creative collaboration"
    },
    // Gay Men
    {
        first_name: "Marcus",
        last_name: "Rivera",
        email: "marcus.rivera@dating.com",
        age: 31,
        gender: "Male",
        city: "West Hollywood",
        state: "CA",
        bio: "Personal trainer and wellness coach helping people become their best selves. I believe in living authentically and supporting each other's growth. Fitness enthusiast who also loves quiet movie nights.",
        interests: ["Fitness", "Wellness Coaching", "Movies", "Healthy Living", "Personal Development"],
        photo_urls: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Seeking a genuine, health-conscious man who values personal growth and authenticity",
        relationship_goals: "Committed partnership focused on mutual support and growth"
    },
    {
        first_name: "David",
        last_name: "Chen",
        email: "david.chen@dating.com",
        age: 28,
        gender: "Male",
        city: "New York",
        state: "NY",
        bio: "Art curator with a passion for contemporary works and cultural events. I love gallery openings, theater nights, and exploring the city's diverse neighborhoods. Looking for someone who appreciates art and culture.",
        interests: ["Art Curation", "Theater", "Contemporary Art", "Cultural Events", "City Exploration"],
        photo_urls: [
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Looking for a cultured, artistic man who loves exploring museums and trying new experiences",
        relationship_goals: "Long-term relationship with shared cultural interests and city adventures"
    },
    // Bisexual Individuals
    {
        first_name: "Alex",
        last_name: "Morgan",
        email: "alex.morgan@dating.com",
        age: 26,
        gender: "Female",
        city: "Austin",
        state: "TX",
        bio: "Freelance graphic designer with a love for live music and food trucks. I'm bisexual and believe love has no boundaries. Looking for authentic connections regardless of gender.",
        interests: ["Graphic Design", "Live Music", "Food Trucks", "Art", "Creative Writing"],
        photo_urls: [
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Open to dating people of all genders who share my love for creativity and music",
        relationship_goals: "Meaningful connection based on shared values and interests"
    },
    {
        first_name: "Jordan",
        last_name: "Smith",
        email: "jordan.smith@dating.com",
        age: 30,
        gender: "Male",
        city: "Chicago",
        state: "IL",
        bio: "Marketing professional who loves travel, photography, and meeting new people. I'm bisexual and believe in connection beyond labels. Always up for adventure and deep conversations.",
        interests: ["Marketing", "Travel", "Photography", "Adventure", "Cultural Exchange"],
        photo_urls: [
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Seeking someone authentic and adventurous, regardless of gender identity",
        relationship_goals: "Partnership built on trust, adventure, and mutual respect"
    },
    // Non-Binary Individuals
    {
        first_name: "River",
        last_name: "Johnson",
        email: "river.johnson@dating.com",
        age: 25,
        gender: "Non-binary",
        city: "Seattle",
        state: "WA",
        bio: "They/them pronouns. Mental health counselor passionate about helping others and creating safe spaces. I love hiking, reading, and cozy game nights. Looking for someone who values empathy and understanding.",
        interests: ["Mental Health", "Hiking", "Reading", "Board Games", "Social Justice"],
        photo_urls: [
            "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Seeking a compassionate person of any gender who values emotional intelligence and growth",
        relationship_goals: "Supportive partnership focused on mental health and personal development"
    },
    // Transgender Individuals
    {
        first_name: "Maya",
        last_name: "Rodriguez",
        email: "maya.rodriguez@dating.com",
        age: 32,
        gender: "Female",
        city: "Denver",
        state: "CO",
        bio: "Transgender woman and proud advocate for LGBTQ+ rights. I work in tech and love skiing, hiking, and mountain adventures. Looking for someone who appreciates authenticity and outdoor fun.",
        interests: ["Technology", "LGBTQ+ Advocacy", "Skiing", "Hiking", "Mountain Adventures"],
        photo_urls: [
            "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Looking for an open-minded partner who loves outdoor adventures and values equality",
        relationship_goals: "Authentic, loving relationship with mutual respect and adventure"
    },
    {
        first_name: "Sam",
        last_name: "Parker",
        email: "sam.parker@dating.com",
        age: 29,
        gender: "Male",
        city: "Miami",
        state: "FL",
        bio: "Transgender man who loves beach volleyball, cooking, and hosting dinner parties. I believe in living life to the fullest and surrounding myself with positive, genuine people.",
        interests: ["Beach Volleyball", "Cooking", "Hosting", "Beach Life", "Community Building"],
        photo_urls: [
            "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Seeking someone who loves beach life, good food, and authentic connections",
        relationship_goals: "Fun, supportive relationship filled with laughter and shared experiences"
    },
    // Pansexual Individuals
    {
        first_name: "Casey",
        last_name: "Williams",
        email: "casey.williams@dating.com",
        age: 28,
        gender: "Non-binary",
        city: "Nashville",
        state: "TN",
        bio: "They/them pronouns. Musician and music producer who believes love transcends all boundaries. I'm pansexual and looking for deep connections based on personality and shared passions.",
        interests: ["Music Production", "Live Performance", "Sound Design", "Creative Arts", "Music History"],
        photo_urls: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Looking for connection that transcends gender - seeking someone with a beautiful soul and shared love for music",
        relationship_goals: "Deep emotional and creative partnership regardless of gender identity"
    },
    // Additional Diverse Straight Profiles
    {
        first_name: "Aisha",
        last_name: "Hassan",
        email: "aisha.hassan@dating.com",
        age: 31,
        gender: "Female",
        city: "Atlanta",
        state: "GA",
        bio: "Immigration lawyer fighting for justice and equality. I love cultural festivals, trying international cuisines, and meaningful conversations about making the world better.",
        interests: ["Immigration Law", "Cultural Events", "International Cuisine", "Social Justice", "Travel"],
        photo_urls: [
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Seeking a socially conscious man who values diversity and is passionate about making a difference",
        relationship_goals: "Partnership built on shared values of justice and cultural appreciation"
    },
    {
        first_name: "Carlos",
        last_name: "Mendoza",
        email: "carlos.mendoza@dating.com",
        age: 33,
        gender: "Male",
        city: "Phoenix",
        state: "AZ",
        bio: "Bilingual teacher and community organizer. I'm passionate about education, salsa dancing, and bringing people together. Family means everything to me.",
        interests: ["Education", "Salsa Dancing", "Community Organizing", "Language", "Family"],
        photo_urls: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&auto=format"
        ],
        partner_preferences: "Looking for a warm, family-oriented woman who values education and community",
        relationship_goals: "Marriage and building a loving, bilingual family together"
    }
];
export const seedDiverseProfiles = async () => {
    try {
        console.log('Starting to seed diverse dating profiles...');
        // Check if profiles already exist
        const { data: existingProfiles, error: checkError } = await supabase
            .from('dating_profiles')
            .select('email')
            .in('email', diverseSeedProfiles.map(user => user.email));
        if (checkError) {
            console.error('Error checking existing profiles:', checkError);
            return { success: false, message: 'Failed to check existing profiles' };
        }
        const existingEmails = new Set(existingProfiles?.map(p => p.email) || []);
        const newProfiles = diverseSeedProfiles.filter(user => !existingEmails.has(user.email));
        if (newProfiles.length === 0) {
            return {
                success: true,
                message: 'All diverse profiles already exist in the database',
                count: 0
            };
        }
        console.log(`Creating ${newProfiles.length} new diverse profiles...`);
        // Create seed profiles for dating_profiles table
        const seedProfiles = newProfiles.map((user, index) => {
            const seedUserId = `diverse-${user.first_name.toLowerCase()}-${user.last_name.toLowerCase()}-${Date.now()}-${index}`;
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
            }
            else {
                insertedCount += batch.length;
                console.log(`Successfully inserted batch ${i / batchSize + 1}: ${batch.length} profiles`);
            }
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (insertedCount > 0) {
            console.log(`Successfully seeded ${insertedCount} diverse dating profiles!`);
            return {
                success: true,
                message: `Successfully seeded ${insertedCount} diverse, inclusive dating profiles with LGBTQ+ representation!`,
                count: insertedCount
            };
        }
        else {
            return {
                success: false,
                message: 'Failed to insert any profiles due to database errors'
            };
        }
    }
    catch (error) {
        console.error('Error seeding diverse profiles:', error);
        return {
            success: false,
            message: `Failed to seed profiles: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};
