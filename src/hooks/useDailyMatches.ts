
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DailyMatch {
  id: string;
  user_id: string;
  suggested_user_id: string;
  compatibility_score: number;
  suggested_date: string;
  viewed: boolean;
  created_at: string;
  user_profile?: {
    id: string;
    email: string;
    bio: string | null;
    photos: string[] | null;
    first_name?: string;
    age?: number;
    gender?: string;
  };
}

export const useDailyMatches = () => {
  const { user } = useAuth();
  const [dailyMatches, setDailyMatches] = useState<DailyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDailyMatches = async () => {
    if (!user) {
      setDailyMatches([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Loading daily matches for user:', user.id);
      
      // Get user's preferences and gender for bidirectional matching
      let userPreferences = { gender_preference: 'Everyone', age_min: 18, age_max: 65 };
      let userGender = 'Unknown';

      // Mock compatibility data since the table doesn't exist
      const compatibilityData = null;

      if (compatibilityData?.answers) {
        const answers = compatibilityData.answers as any;
        userPreferences.gender_preference = answers['12'] || 'Everyone';
        userGender = answers['7'] || 'Unknown';
        console.log('Daily matches - User:', userGender, 'seeking:', userPreferences.gender_preference);
      }
      
      // Try to get existing daily matches
      const { data: existingMatches, error: matchesError } = await supabase
        .from('daily_matches')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .order('recommendation_score', { ascending: false });

      if (matchesError) {
        console.error('Error loading daily matches:', matchesError);
      }

      let profilesData: any[] = [];

      if (!existingMatches || existingMatches.length === 0) {
        console.log('No existing daily matches, generating new ones with bidirectional filtering...');
        
        // Get profiles first
        let { data: allProfiles, error: profilesError } = await supabase
          .from('users')
          .select('*')
          .eq('is_active', true)
          .gte('age', userPreferences.age_min)
          .lte('age', userPreferences.age_max)
          .neq('id', user.id);

        if (profilesError || !allProfiles) {
          console.error('Error loading profiles:', profilesError);
          setDailyMatches([]);
          return;
        }

        // Mock compatibility answers since the table doesn't exist
        const profileUserIds = allProfiles.map(p => p.id).filter(Boolean);
        let answersData: any[] = [];
        const answersError = null;

        if (answersError) {
          console.error('Error loading compatibility answers:', answersError);
          answersData = [];
        }

        // Create a map of user_id to answers for quick lookup
        const answersMap = new Map();
        answersData?.forEach(answer => {
          answersMap.set(answer.user_id, answer.answers);
        });

        // Combine profiles with their answers
        const profilesWithAnswers = allProfiles.map(profile => ({
          ...profile,
          compatibility_answers: answersMap.get(profile.id) || null
        }));

        if (profilesWithAnswers && profilesWithAnswers.length > 0) {
          // Apply bidirectional filtering - add safety checks
          profilesData = profilesWithAnswers.filter(profile => {
            if (!profile || !profile.compatibility_answers) {
              return false;
            }
            const profileAnswers = profile.compatibility_answers;
            if (!profileAnswers) return false;

            const profileGender = profile.gender?.toLowerCase();
            const profileSeekingGender = profileAnswers['12'];

            // USER WANTS TO SEE THIS PROFILE
            let userWantsProfile = false;
            if (userPreferences.gender_preference === 'Everyone') {
              userWantsProfile = true;
            } else if (userPreferences.gender_preference === 'Men' && (profileGender === 'male' || profileGender === 'man' || profileGender === 'men')) {
              userWantsProfile = true;
            } else if (userPreferences.gender_preference === 'Women' && (profileGender === 'female' || profileGender === 'woman' || profileGender === 'women')) {
              userWantsProfile = true;
            } else if (userPreferences.gender_preference === 'Non-binary' && (profileGender === 'non-binary' || profileGender === 'nonbinary')) {
              userWantsProfile = true;
            }

            // PROFILE WANTS TO SEE USER (BIDIRECTIONAL CHECK)
            let profileWantsUser = false;
            if (profileSeekingGender === 'Everyone') {
              profileWantsUser = true;
            } else if (profileSeekingGender === 'Men' && (userGender === 'Male' || userGender === 'Man' || userGender === 'male' || userGender === 'man')) {
              profileWantsUser = true;
            } else if (profileSeekingGender === 'Women' && (userGender === 'Female' || userGender === 'Woman' || userGender === 'female' || userGender === 'woman')) {
              profileWantsUser = true;
            } else if (profileSeekingGender === 'Non-binary' && (userGender === 'Non-binary' || userGender === 'Nonbinary' || userGender === 'non-binary' || userGender === 'nonbinary')) {
              profileWantsUser = true;
            }

            return userWantsProfile && profileWantsUser;
          });
        }

        console.log('Daily matches bidirectional filtered profiles count:', profilesData.length);

        if (profilesData && profilesData.length > 0) {
          // Convert profiles to daily matches format
          const convertedMatches = profilesData.slice(0, 5).map(profile => ({
            id: `daily-${user.id}-${profile.id}`,
            user_id: user.id,
            suggested_user_id: profile.id,
            compatibility_score: Math.floor(Math.random() * 30) + 60,
            suggested_date: new Date().toISOString().split('T')[0],
            viewed: false,
            created_at: new Date().toISOString(),
            user_profile: {
              id: profile.id,
              email: profile.email,
              bio: profile.bio,
              photos: Array.isArray(profile.photos) && profile.photos.length > 0 
                ? profile.photos 
                : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
              first_name: profile.first_name,
              age: profile.age,
              gender: profile.gender
            }
          }));

          setDailyMatches(convertedMatches);
          console.log(`Created ${convertedMatches.length} daily matches`);
          return;
        }
      }

      // Process existing daily matches
      if (existingMatches && existingMatches.length > 0) {
        const userIds = existingMatches.map(match => match.recommended_user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('users')
          .select('*')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error loading profiles for daily matches:', profilesError);
          return;
        }

        const processedMatches = existingMatches.map(match => {
          const profile = profilesData?.find(p => p.id === match.recommended_user_id);
          return {
            id: match.id,
            user_id: match.user_id,
            suggested_user_id: match.recommended_user_id,
            compatibility_score: match.recommendation_score || 75,
            suggested_date: match.date,
            viewed: false,
            created_at: new Date().toISOString(),
            user_profile: profile ? {
              id: profile.id,
              email: profile.email || `${profile.id}@example.com`,
              bio: profile.bio || '',
              photos: profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0 
                ? profile.photos 
                : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
              first_name: profile.first_name || 'User',
              age: profile.age || 25,
              gender: profile.gender || 'Unknown'
            } : {
              id: match.recommended_user_id,
              email: `${match.recommended_user_id}@example.com`,
              bio: '',
              photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
              first_name: 'User',
              age: 25,
              gender: 'Unknown'
            }
          };
        });

        setDailyMatches(processedMatches);
      } else {
        setDailyMatches([]);
      }
    } catch (error) {
      console.error('Error loading daily matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyMatches = async (matchCount = 5) => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Generating daily matches for user:', user.id);
      
      // Get user preferences for better matching
      let userPreferences = { gender_preference: 'Everyone', age_min: 18, age_max: 65 };
      let userGender = 'Unknown';

      // Mock compatibility data since the table doesn't exist
      const compatibilityData = null;

      if (compatibilityData?.answers) {
        const answers = compatibilityData.answers as any;
        userPreferences.gender_preference = answers['12'] || 'Everyone';
        userGender = answers['7'] || 'Unknown';
      }

      // Get compatible profiles first
      let { data: allProfiles, error: profilesError } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .gte('age', userPreferences.age_min)
        .lte('age', userPreferences.age_max)
        .neq('id', user.id)
        .limit(matchCount * 2);

      if (profilesError || !allProfiles) {
        console.error('Error fetching profiles for daily matches:', profilesError);
        return;
      }

      // Mock compatibility answers since the table doesn't exist
      const profileUserIds = allProfiles.map(p => p.id).filter(Boolean);
      let answersData: any[] = [];
      const answersError = null;

      if (answersError) {
        console.error('Error loading compatibility answers:', answersError);
        answersData = [];
      }

      // Create a map of user_id to answers for quick lookup
      const answersMap = new Map();
      answersData?.forEach(answer => {
        answersMap.set(answer.user_id, answer.answers);
      });

      // Combine profiles with their answers
      const profiles = allProfiles.map(profile => ({
        ...profile,
        compatibility_answers: answersMap.get(profile.id) || null
      }));


      if (profiles && profiles.length > 0) {
        // Apply bidirectional filtering - add safety checks
        const filteredProfiles = profiles.filter(profile => {
          if (!profile || !profile.compatibility_answers) {
            return false;
          }
          const profileAnswers = profile.compatibility_answers;
          if (!profileAnswers) return false;

          const profileGender = profile.gender?.toLowerCase();
          const profileSeekingGender = profileAnswers['12'];

          // Check bidirectional compatibility
          let userWantsProfile = userPreferences.gender_preference === 'Everyone' ||
            (userPreferences.gender_preference === 'Men' && (profileGender === 'male' || profileGender === 'man' || profileGender === 'men')) ||
            (userPreferences.gender_preference === 'Women' && (profileGender === 'female' || profileGender === 'woman' || profileGender === 'women')) ||
            (userPreferences.gender_preference === 'Non-binary' && (profileGender === 'non-binary' || profileGender === 'nonbinary'));

           let profileWantsUser = profileSeekingGender === 'Everyone' ||
            (profileSeekingGender === 'Men' && (userGender === 'Male' || userGender === 'Man' || userGender === 'male' || userGender === 'man')) ||
            (profileSeekingGender === 'Women' && (userGender === 'Female' || userGender === 'Woman' || userGender === 'female' || userGender === 'woman')) ||
            (profileSeekingGender === 'Non-binary' && (userGender === 'Non-binary' || userGender === 'Nonbinary' || userGender === 'non-binary' || userGender === 'nonbinary')) ||
            userGender === 'Unknown'; // Be lenient if user gender is unknown

          return userWantsProfile && profileWantsUser;
        });

        // Create daily matches from filtered profiles
        const dailyMatchData = filteredProfiles.slice(0, matchCount).map(profile => ({
          user_id: user.id,
          recommended_user_id: profile.id,
          recommendation_score: Math.floor(Math.random() * 30) + 60,
          date: new Date().toISOString().split('T')[0]
        }));

        if (dailyMatchData.length > 0) {
          const { error: insertError } = await supabase
            .from('daily_matches')
            .insert(dailyMatchData);

          if (insertError) {
            console.error('Error inserting daily matches:', insertError);
          } else {
            console.log(`Successfully generated ${dailyMatchData.length} daily matches`);
          }
        }
      }

      // Reload matches after generation
      await loadDailyMatches();
    } catch (error) {
      console.error('Error generating daily matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsViewed = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('daily_matches')
        .update({ action: 'viewed' })
        .eq('id', matchId);

      if (error) {
        console.error('Error marking match as viewed:', error);
      }
    } catch (error) {
      console.error('Error marking match as viewed:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadDailyMatches();
    }
  }, [user]);

  return {
    dailyMatches,
    isLoading,
    loadDailyMatches,
    generateDailyMatches,
    markAsViewed
  };
};
