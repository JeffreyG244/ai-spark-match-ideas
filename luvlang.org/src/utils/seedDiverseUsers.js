import { supabase } from '@/integrations/supabase/client';
const generateSeedProfiles = () => {
    const maleNames = [
        'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher',
        'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
        'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan'
    ];
    const femaleNames = [
        'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
        'Lisa', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle',
        'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen'
    ];
    const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
        'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
        'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
    ];
    const professions = [
        'Software Engineer', 'Marketing Manager', 'Doctor', 'Teacher', 'Lawyer', 'Designer', 'Consultant',
        'Entrepreneur', 'Nurse', 'Accountant', 'Architect', 'Sales Manager', 'Project Manager', 'Analyst'
    ];
    const locations = [
        'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
        'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA'
    ];
    const profiles = [];
    // Generate 25 male profiles
    for (let i = 0; i < 25; i++) {
        const firstName = maleNames[i % maleNames.length];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const profession = professions[Math.floor(Math.random() * professions.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const age = Math.floor(Math.random() * 15) + 25; // 25-40
        profiles.push({
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@professional.com`,
            firstName,
            lastName,
            age,
            location,
            profession,
            bio: `${profession} based in ${location}. Looking for meaningful connections with like-minded professionals. Love traveling, fitness, and good conversations.`,
            photos: [`https://images.unsplash.com/photo-150700321116${9 + (i % 10)}-0a1dd7228f2d?w=400&h=600&fit=crop`]
        });
    }
    // Generate 25 female profiles
    for (let i = 0; i < 25; i++) {
        const firstName = femaleNames[i % femaleNames.length];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const profession = professions[Math.floor(Math.random() * professions.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const age = Math.floor(Math.random() * 15) + 25; // 25-40
        profiles.push({
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 25}@professional.com`,
            firstName,
            lastName,
            age,
            location,
            profession,
            bio: `${profession} passionate about career growth and work-life balance. Enjoy yoga, reading, and exploring new restaurants. Looking for genuine connections.`,
            photos: [`https://images.unsplash.com/photo-149479010875${5 + (i % 10)}-2616c2b10db8?w=400&h=600&fit=crop`]
        });
    }
    return profiles;
};
export const checkIfSeedingNeeded = async () => {
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
        return count < 20;
    }
    catch (error) {
        console.error('Error in checkIfSeedingNeeded:', error);
        return true;
    }
};
export const seedDiverseUsers = async () => {
    try {
        console.log('Starting to seed diverse professional profiles...');
        const profilesData = generateSeedProfiles();
        // Check if seed profiles already exist
        const { data: existingProfiles, error: checkError } = await supabase
            .from('profiles')
            .select('email')
            .in('email', profilesData.map(user => user.email));
        if (checkError) {
            console.error('Error checking existing profiles:', checkError);
            return { success: false, message: 'Failed to check existing profiles' };
        }
        const existingEmails = new Set(existingProfiles?.map(p => p.email) || []);
        const newProfiles = profilesData.filter(user => !existingEmails.has(user.email));
        if (newProfiles.length === 0) {
            return {
                success: true,
                message: 'All seed profiles already exist in the database',
                count: 0
            };
        }
        console.log(`Creating ${newProfiles.length} new seed profiles...`);
        // Create seed profiles
        const seedProfiles = newProfiles.map((user, index) => {
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
        // Insert in batches
        const batchSize = 10;
        let insertedCount = 0;
        for (let i = 0; i < seedProfiles.length; i += batchSize) {
            const batch = seedProfiles.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('profiles')
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
            console.log(`Successfully seeded ${insertedCount} professional profiles!`);
            return {
                success: true,
                message: `Successfully seeded ${insertedCount} professional profiles for your dating platform!`,
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
        console.error('Error seeding diverse users:', error);
        return {
            success: false,
            message: `Failed to seed profiles: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};
