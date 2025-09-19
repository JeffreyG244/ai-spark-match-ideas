import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Database, Users, Heart, MessageCircle, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SeedingStatus {
  profiles: number;
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
    matches: 0,
    dailyMatches: 0,
    conversations: 0,
    messages: 0
  });

  const generateTestUsers = () => {
    const genders = ['male', 'female', 'non-binary'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'CA', 'TX', 'CA'];
    const interests = ['reading', 'traveling', 'cooking', 'photography', 'hiking', 'music', 'movies', 'sports', 'art', 'dancing', 'technology', 'business', 'leadership'];
    const industries = ['Technology', 'Finance', 'Healthcare', 'Marketing', 'Consulting', 'Real Estate', 'Legal', 'Education', 'Entertainment', 'Non-profit'];
    const jobTitles = ['CEO', 'VP Marketing', 'Senior Director', 'Managing Director', 'Chief Technology Officer', 'Principal Consultant', 'Senior Partner', 'Executive Director'];
    const companies = ['Microsoft', 'Goldman Sachs', 'McKinsey & Company', 'Google', 'JP Morgan', 'Deloitte', 'Meta', 'Tesla', 'Amazon', 'Apple'];
    
    const bios = [
      "Passionate executive focused on building innovative teams and driving results. Love traveling and exploring new cuisines.",
      "Strategic leader with a focus on digital transformation. Enjoy hiking, photography, and mentoring emerging professionals.",
      "C-suite executive with expertise in scaling organizations. When not working, you'll find me reading or at the wine country.",
      "Technology leader passionate about AI and sustainable business practices. Love cooking and hosting dinner parties.",
      "Financial services executive with global experience. Enjoy art galleries, classical music, and philanthropy work.",
      "Marketing executive specializing in brand strategy. Passionate about design thinking and social impact initiatives.",
      "Operations leader focused on organizational excellence. Enjoy fitness, mindfulness practices, and family time.",
      "Strategy consultant with Fortune 500 experience. Love adventure travel, fine dining, and continuous learning.",
      "Healthcare executive driving innovation in patient care. Passionate about wellness, yoga, and community service.",
      "Real estate executive with portfolio management expertise. Enjoy golf, sailing, and collecting vintage wines."
    ];

    const maleNames = ['James', 'Michael', 'Robert', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Alexander', 'Ryan'];
    const femaleNames = ['Sarah', 'Jennifer', 'Lisa', 'Michelle', 'Jessica', 'Emily', 'Ashley', 'Amanda', 'Nicole', 'Elizabeth', 'Rachel', 'Stephanie', 'Lauren', 'Melissa', 'Christina', 'Rebecca', 'Laura', 'Samantha', 'Katherine', 'Victoria'];
    const lastNames = ['Chen', 'Rodriguez', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Wilson', 'Thompson', 'Martinez', 'Clark', 'Lewis', 'Walker', 'Hall'];

    const users = [];
    for (let i = 0; i < 25; i++) {
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const cityIndex = Math.floor(Math.random() * cities.length);
      const isMale = gender === 'male';
      const firstName = isMale ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      // Professional profile images
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

      const photoUrls = isMale ? 
        [maleImages[Math.floor(Math.random() * maleImages.length)]] :
        [femaleImages[Math.floor(Math.random() * femaleImages.length)]];

      users.push({
        id: `exec-user-${i}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@executive.com`,
        first_name: firstName,
        last_name: lastName,
        age: Math.floor(Math.random() * 15) + 30, // Ages 30-44
        date_of_birth: new Date(1980 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        gender: gender,
        looking_for: gender === 'male' ? 'female' : gender === 'female' ? 'male' : 'non-binary',
        job_title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
        company: companies[Math.floor(Math.random() * companies.length)],
        industry: industries[Math.floor(Math.random() * industries.length)],
        city: cities[cityIndex],
        state: states[cityIndex],
        country: 'US',
        bio: bios[Math.floor(Math.random() * bios.length)],
        photos: photoUrls,
        interests: interests.slice(0, Math.floor(Math.random() * 4) + 3),
        salary_range: '$200,000+',
        education_level: 'Graduate Degree',
        university: 'Harvard Business School',
        work_schedule: 'Executive Hours',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    return users;
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
      // Step 1: Create current user profile if it doesn't exist
      setProgress(10);
      
      const userData = user.user_metadata || {};
      const firstName = userData.first_name || 'Executive';
      const lastName = userData.last_name || 'User';
      
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || 'user@executive.com',
          first_name: firstName,
          last_name: lastName,
          age: 35,
          date_of_birth: '1988-01-01',
          gender: 'male',
          looking_for: 'female',
          job_title: 'Chief Executive Officer',
          company: 'Innovative Solutions Inc',
          industry: 'Technology',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
          bio: 'Passionate about building innovative products and meaningful relationships.',
          photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
          interests: ['technology', 'leadership', 'travel', 'innovation'],
          salary_range: '$500,000+',
          education_level: 'Graduate Degree',
          university: 'Stanford University',
          work_schedule: 'Executive Hours',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      setProgress(25);

      // Step 2: Create test executive users
      const testUsers = generateTestUsers();
      
      // Clear existing test data first
      await supabase.from('users').delete().like('email', '%@executive.com').neq('id', user.id);
      
      const { error: usersError } = await supabase
        .from('users')
        .insert(testUsers);
      
      if (usersError) {
        console.error('Users creation error:', usersError);
        throw usersError;
      }
      
      setStatus(prev => ({ ...prev, profiles: testUsers.length + 1 }));
      setProgress(50);

      // Step 3: Create executive matches
      const matches = testUsers.slice(0, 8).map(testUser => ({
        user_id: user.id,
        matched_user_id: testUser.id,
        compatibility_score: Math.floor(Math.random() * 25) + 75, // 75-99
        status: 'pending',
        match_reasons: ['Professional compatibility', 'Shared interests', 'Geographic proximity'],
        common_interests: testUser.interests.slice(0, 2),
        professional_score: Math.floor(Math.random() * 20) + 80,
        personality_score: Math.floor(Math.random() * 20) + 80,
        values_alignment_score: Math.floor(Math.random() * 20) + 80,
        communication_compatibility: Math.floor(Math.random() * 20) + 80,
        created_at: new Date().toISOString()
      }));

      const { error: matchesError } = await supabase
        .from('executive_matches')
        .insert(matches);
      
      if (matchesError) {
        console.error('Matches creation error:', matchesError);
        throw matchesError;
      }
      
      setStatus(prev => ({ ...prev, matches: matches.length }));
      setProgress(75);

      // Step 4: Create daily matches
      const dailyMatches = testUsers.slice(0, 5).map(testUser => ({
        user_id: user.id,
        recommended_user_id: testUser.id,
        recommendation_score: Math.floor(Math.random() * 25) + 75,
        date: new Date().toISOString().split('T')[0],
        recommendation_reasons: ['High compatibility', 'Similar career level'],
        professional_highlight: `${testUser.job_title} at ${testUser.company}`,
        ai_confidence: Math.floor(Math.random() * 15) + 85,
        networking_opportunity: Math.random() > 0.5
      }));

      const { error: dailyMatchesError } = await supabase
        .from('daily_matches')
        .insert(dailyMatches);
      
      if (dailyMatchesError) {
        console.error('Daily matches creation error:', dailyMatchesError);
        throw dailyMatchesError;
      }
      
      setStatus(prev => ({ ...prev, dailyMatches: dailyMatches.length }));
      setProgress(90);

      // Step 5: Create sample conversations
      const conversations = testUsers.slice(0, 3).map(testUser => ({
        participant_1: user.id,
        participant_2: testUser.id,
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
        message_count: 2
      }));

      const { data: conversationData, error: conversationsError } = await supabase
        .from('conversations')
        .insert(conversations)
        .select();
      
      if (conversationsError) {
        console.error('Conversations creation error:', conversationsError);
        throw conversationsError;
      }
      
      setStatus(prev => ({ ...prev, conversations: conversations.length }));

      // Create sample messages
      if (conversationData && conversationData.length > 0) {
        const messages = conversationData.flatMap((conv, index) => [
          {
            conversation_id: conv.id,
            sender_id: conv.participant_2,
            content: `Hi! I saw your profile and was impressed by your work at ${user.user_metadata?.company || 'your company'}. Would love to connect over coffee!`,
            message_type: 'text',
            created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            conversation_id: conv.id,
            sender_id: user.id,
            content: `Thank you for reaching out! I'd enjoy connecting as well. Are you free for lunch this week?`,
            message_type: 'text',
            created_at: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
          }
        ]);

        const { error: messagesError } = await supabase
          .from('conversation_messages')
          .insert(messages);
        
        if (messagesError) {
          console.error('Messages creation error:', messagesError);
          throw messagesError;
        }
        
        setStatus(prev => ({ ...prev, messages: messages.length }));
      }

      setProgress(100);
      
      // Trigger N8N webhook
      try {
        await supabase.functions.invoke('professional-match-trigger', {
          body: { 
            user_id: user.id, 
            event_type: 'database_seeded',
            timestamp: new Date().toISOString()
          }
        });
        console.log('Professional matching triggered');
      } catch (webhookError) {
        console.warn('N8N webhook failed:', webhookError);
      }
      
      toast({
        title: 'Executive Database Seeded!',
        description: 'Test executive profiles and matches have been created successfully.',
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
      
      // Clear test data
      await supabase.from('conversation_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('daily_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('executive_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('users').delete().like('email', '%@executive.com').neq('id', user?.id || '');
      
      setStatus({
        profiles: 0,
        matches: 0,
        dailyMatches: 0,
        conversations: 0,
        messages: 0
      });
      
      toast({
        title: 'Test Data Cleared',
        description: 'All test executive data has been removed.',
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
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-purple-600" />
          Executive Data Seeder
        </CardTitle>
        <p className="text-sm text-gray-600">Generate executive test data for the professional dating platform</p>
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
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{status.profiles}</span>
            </div>
            <div className="text-sm text-gray-600">Executive Profiles</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-pink-600" />
              <span className="text-2xl font-bold text-pink-600">{status.matches}</span>
            </div>
            <div className="text-sm text-gray-600">Executive Matches</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{status.dailyMatches}</span>
            </div>
            <div className="text-sm text-gray-600">Daily Matches</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{status.conversations}</span>
            </div>
            <div className="text-sm text-gray-600">Conversations</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{status.messages}</span>
            </div>
            <div className="text-sm text-gray-600">Messages</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={seedDatabase}
            disabled={isSeeding}
            className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
          >
            {isSeeding ? 'Creating Executive Profiles...' : 'Seed Executive Data'}
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
        <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5" />
          <div className="text-sm text-purple-800">
            <strong>Executive Platform:</strong> This creates C-suite level professionals, VPs, and senior executives with realistic job titles, companies, and professional backgrounds. Perfect for testing the executive dating experience.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSeeder;