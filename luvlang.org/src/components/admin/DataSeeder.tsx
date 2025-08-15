import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Users, Heart, MessageCircle, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { seedDiverseProfiles } from '@/utils/diverseSeedProfiles';

interface SeedingStatus {
  profiles: number;
  compatibility: number;
  matches: number;
  dailyMatches: number;
  conversations: number;
  messages: number;
}

const DataSeeder = () => {
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<SeedingStatus>({
    profiles: 0,
    compatibility: 0,
    matches: 0,
    dailyMatches: 0,
    conversations: 0,
    messages: 0
  });

  const generateTestProfiles = () => {
    const genders = ['male', 'female', 'non-binary'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'CA', 'TX', 'CA'];
    const interests = ['reading', 'traveling', 'cooking', 'photography', 'hiking', 'music', 'movies', 'sports', 'art', 'dancing'];
    const bios = [
      "Love exploring new places and trying different cuisines. Looking for someone who shares my passion for adventure!",
      "Passionate about photography and capturing life's beautiful moments. Let's create memories together!",
      "Fitness enthusiast who enjoys hiking and outdoor activities. Seeking an active partner for life's journey.",
      "Book lover and coffee addict. Perfect date would be browsing bookstores and discussing our favorite reads.",
      "Travel enthusiast with a wanderlust spirit. Have passport, will travel - care to join me?",
      "Food lover who enjoys cooking and trying new restaurants. Let's explore the culinary world together!",
      "Music lover who plays guitar in spare time. Looking for someone to harmonize with in life.",
      "Art enthusiast who loves visiting museums and galleries. Seeking someone who appreciates creativity.",
      "Outdoor adventurer who loves camping and stargazing. Let's explore nature's wonders together!",
      "Tech professional by day, chef by night. Looking for someone to share delicious meals and great conversations."
    ];

    const maleNames = ['James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'];
    const femaleNames = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    const profiles = [];
    for (let i = 0; i < 50; i++) {
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const cityIndex = Math.floor(Math.random() * cities.length);
      const isMAle = gender === 'male';
      const firstName = isMAle ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      // Gender-appropriate profile images
      const maleImages = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop'
      ];
      
      const femaleImages = [
        'https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop'
      ];

      const photoUrls = isMAle ? 
        [maleImages[Math.floor(Math.random() * maleImages.length)]] :
        [femaleImages[Math.floor(Math.random() * femaleImages.length)]];

      profiles.push({
        user_id: `test-user-${i}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        first_name: firstName,
        last_name: lastName,
        age: Math.floor(Math.random() * 20) + 25, // Ages 25-44
        gender: gender,
        bio: bios[Math.floor(Math.random() * bios.length)],
        city: cities[cityIndex],
        state: states[cityIndex],
        interests: interests.slice(0, Math.floor(Math.random() * 5) + 3),
        photo_urls: photoUrls,
        relationship_goals: 'Long-term relationship',
        partner_preferences: 'Someone who shares similar interests and values'
      });
    }
    return profiles;
  };

  const generateCompatibilityAnswers = (profiles: any[]) => {
    return profiles.map(profile => {
      // Determine seeking preference based on profile context
      let seeking = 'Everyone';
      if (profile.partner_preferences) {
        const prefs = profile.partner_preferences.toLowerCase();
        if (prefs.includes('men') && !prefs.includes('women')) seeking = 'Men';
        else if (prefs.includes('women') && !prefs.includes('men')) seeking = 'Women';
        else if (prefs.includes('regardless of gender') || prefs.includes('any gender') || prefs.includes('transcends gender')) seeking = 'Everyone';
      }

      return {
        user_id: profile.user_id,
        answers: {
          "1": "Moderate importance",
          "2": "A few times a week", 
          "3": "Movies at home",
          "4": "Early bird",
          "5": "Cats",
          "6": "Ambitious",
          "7": profile.gender === 'Male' ? 'Male' : profile.gender === 'Female' ? 'Female' : 'Non-binary',
          "8": "City",
          "9": "Save it",
          "10": "Emotional connection",
          "11": "Long-term relationship",
          "12": seeking
        }
      };
    });
  };

  const seedDatabase = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to seed the database',
        variant: 'destructive'
      });
      return;
    }

    setIsSeeding(true);
    setProgress(0);
    
    try {
      // Step 0: Create current user's dating profile and compatibility answers
      setProgress(5);
      
      // Get user metadata
      const userData = user.user_metadata || {};
      const firstName = userData.first_name || 'User';
      const lastName = userData.last_name || 'Name';
      
      // Create user's dating profile
      const userProfile = {
        user_id: user.id,
        email: user.email || 'user@example.com',
        first_name: firstName,
        last_name: lastName,
        age: 28,
        gender: 'male', // Set based on your preference
        bio: 'Looking for meaningful connections and genuine relationships.',
        city: 'San Francisco',
        state: 'CA',
        interests: ['technology', 'travel', 'cooking', 'music'],
        photo_urls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
        relationship_goals: 'Long-term relationship',
        partner_preferences: 'Someone who shares similar interests and values'
      };

      await supabase
        .from('dating_profiles')
        .upsert(userProfile, { onConflict: 'user_id' });

      // Create user's compatibility answers
      const userCompatibilityAnswers = {
        user_id: user.id,
        answers: {
          "1": "Very important",
          "2": "A few times a week", 
          "3": "Movies at home",
          "4": "Early bird",
          "5": "Dogs",
          "6": "Ambitious",
          "7": "Male", // User's gender
          "8": "City",
          "9": "Save it",
          "10": "Emotional connection",
          "11": "Long-term relationship",
          "12": "Women" // What user is seeking
        }
      };

      await supabase
        .from('compatibility_answers')
        .upsert(userCompatibilityAnswers, { onConflict: 'user_id' });

      setProgress(10);

      // Step 1: Generate and insert dating profiles (including diverse LGBTQ+ profiles)
      const profiles = generateTestProfiles();
      const { error: profilesError } = await supabase
        .from('dating_profiles')
        .upsert(profiles, { onConflict: 'user_id' });
      
      if (profilesError) throw profilesError;

      // Step 1.5: Add diverse LGBTQ+ profiles
      const diverseResult = await seedDiverseProfiles();
      let diverseCount = 0;
      if (diverseResult.success && diverseResult.count) {
        diverseCount = diverseResult.count;
      }
      
      setStatus(prev => ({ ...prev, profiles: profiles.length + 1 + diverseCount })); // +1 for user profile + diverse profiles
      setProgress(25);

      // Step 2: Generate and insert compatibility answers
      const compatibilityAnswers = generateCompatibilityAnswers(profiles);
      const { error: compatibilityError } = await supabase
        .from('compatibility_answers')
        .upsert(compatibilityAnswers, { onConflict: 'user_id' });
      
      if (compatibilityError) {
        console.error('Compatibility answers error:', compatibilityError);
        throw compatibilityError;
      }
      setStatus(prev => ({ ...prev, compatibility: compatibilityAnswers.length + 1 })); // +1 for user
      setProgress(40);

      // Step 3: Create sample matches for current user
      const userCompatibleProfiles = profiles.slice(0, 10);
      const matches = userCompatibleProfiles.map(profile => ({
        user_id: user.id,
        matched_user_id: profile.user_id,
        compatibility: Math.floor(Math.random() * 30) + 70,
        status: 'accepted' as const
      }));

      const { error: matchesError } = await supabase
        .from('matches')
        .upsert(matches, { onConflict: 'user_id,matched_user_id' });
      
      if (matchesError) throw matchesError;
      setStatus(prev => ({ ...prev, matches: matches.length }));
      setProgress(60);

      // Step 4: Create daily matches
      const dailyMatches = profiles.slice(0, 5).map(profile => ({
        user_id: user.id,
        suggested_user_id: profile.user_id,
        compatibility_score: Math.floor(Math.random() * 30) + 70,
        suggested_date: new Date().toISOString().split('T')[0],
        viewed: false
      }));

      const { error: dailyMatchesError } = await supabase
        .from('daily_matches')
        .upsert(dailyMatches, { onConflict: 'user_id,suggested_user_id,suggested_date' });
      
      if (dailyMatchesError) throw dailyMatchesError;
      setStatus(prev => ({ ...prev, dailyMatches: dailyMatches.length }));
      setProgress(80);

      // Step 5: Create sample conversations and messages
      const conversations = userCompatibleProfiles.slice(0, 3).map(profile => ({
        participant_1: user.id,
        participant_2: profile.user_id
      }));

      const { data: conversationData, error: conversationsError } = await supabase
        .from('conversations')
        .upsert(conversations, { onConflict: 'participant_1,participant_2' })
        .select();
      
      if (conversationsError) throw conversationsError;
      setStatus(prev => ({ ...prev, conversations: conversations.length }));

      // Create sample messages
      if (conversationData && conversationData.length > 0) {
        const messages = conversationData.flatMap(conv => [
          {
            conversation_id: conv.id,
            sender_id: conv.participant_2,
            content: "Hey! I saw your profile and thought we might have a lot in common. How's your day going?",
            message_type: 'text'
          },
          {
            conversation_id: conv.id,
            sender_id: user.id,
            content: "Hi there! Thanks for reaching out. I'm doing well, just finished a great book. What about you?",
            message_type: 'text'
          }
        ]);

        const { error: messagesError } = await supabase
          .from('conversation_messages')
          .insert(messages);
        
        if (messagesError) throw messagesError;
        setStatus(prev => ({ ...prev, messages: messages.length }));
      }

      setProgress(100);
      
      // Trigger N8N webhook for the user profile
      try {
        await supabase.functions.invoke('profile-webhook', {
          body: { 
            user_id: user.id, 
            event_type: 'profile_seeded' 
          }
        });
        console.log('N8N webhook triggered for user profile');
      } catch (webhookError) {
        console.warn('N8N webhook failed:', webhookError);
      }
      
      toast({
        title: 'Database Seeded Successfully!',
        description: 'Test data has been created and N8N workflow triggered. You can now test all features.',
      });

    } catch (error: any) {
      console.error('Error seeding database:', error);
      toast({
        title: 'Seeding Failed',
        description: error.message || 'Failed to seed the database',
        variant: 'destructive'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const clearTestData = async () => {
    try {
      setIsSeeding(true);
      
      // Clear test data (be careful not to delete real user data)
      // Use the uuids directly since we can't use LIKE with uuid columns in Supabase
      const { data: testProfiles } = await supabase
        .from('dating_profiles')
        .select('user_id')
        .filter('email', 'like', '%@example.com');
      
      if (testProfiles && testProfiles.length > 0) {
        const testUserIds = testProfiles.map(p => p.user_id);
        
        // Delete related data
        await supabase.from('conversation_messages').delete().in('sender_id', testUserIds);
        await supabase.from('conversations').delete().in('participant_1', testUserIds);
        await supabase.from('conversations').delete().in('participant_2', testUserIds);
        await supabase.from('daily_matches').delete().in('suggested_user_id', testUserIds);
        await supabase.from('matches').delete().in('matched_user_id', testUserIds);
        await supabase.from('compatibility_answers').delete().in('user_id', testUserIds);
        await supabase.from('dating_profiles').delete().in('user_id', testUserIds);
      }
      
      setStatus({
        profiles: 0,
        compatibility: 0,
        matches: 0,
        dailyMatches: 0,
        conversations: 0,
        messages: 0
      });
      
      toast({
        title: 'Test Data Cleared',
        description: 'All test data has been removed from the database.',
      });
    } catch (error: any) {
      console.error('Error clearing test data:', error);
      toast({
        title: 'Clear Failed',
        description: error.message || 'Failed to clear test data',
        variant: 'destructive'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Test Data Seeder
        </CardTitle>
        <p className="text-sm text-gray-600">Generate test data to make all app features functional for testing</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {isSeeding && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Seeding Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{status.profiles}</span>
            </div>
            <div className="text-sm text-gray-600">Dating Profiles</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{status.compatibility}</span>
            </div>
            <div className="text-sm text-gray-600">Compatibility Data</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-pink-600" />
              <span className="text-2xl font-bold text-pink-600">{status.matches}</span>
            </div>
            <div className="text-sm text-gray-600">Matches</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{status.dailyMatches}</span>
            </div>
            <div className="text-sm text-gray-600">Daily Matches</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{status.conversations}</span>
            </div>
            <div className="text-sm text-gray-600">Conversations</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{status.messages}</span>
            </div>
            <div className="text-sm text-gray-600">Messages</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={seedDatabase}
            disabled={isSeeding}
            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
          >
            {isSeeding ? 'Seeding...' : 'Seed Test Data'}
          </Button>
          
          <Button 
            onClick={clearTestData}
            disabled={isSeeding}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Clear Test Data
          </Button>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Inclusive Dating Platform:</strong> This will create diverse test profiles including LGBTQ+ representation (lesbian, gay, bisexual, transgender, non-binary, and pansexual profiles) to ensure your platform works for all users. Use "Clear Test Data" to remove when done testing.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSeeder;