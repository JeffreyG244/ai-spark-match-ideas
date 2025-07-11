
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
    user_id: string;
    email: string;
    bio: string | null;
    photo_urls: string[] | null;
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

      const { data: compatibilityData } = await supabase
        .from('compatibility_answers')
        .select('answers')
        .eq('user_id', user.id)
        .maybeSingle();

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
        .eq('suggested_date', new Date().toISOString().split('T')[0])
        .order('compatibility_score', { ascending: false });

      if (matchesError) {
        console.error('Error loading daily matches:', matchesError);
      }

      let profilesData: any[] = [];

      if (!existingMatches || existingMatches.length === 0) {
        console.log('No existing daily matches, generating new ones with bidirectional filtering...');
        
        // Get profiles first
        let { data: allProfiles, error: profilesError } = await supabase
          .from('dating_profiles')
          .select('*')
          .eq('visible', true)
          .gte('age', userPreferences.age_min)
          .lte('age', userPreferences.age_max)
          .neq('user_id', user.id);

        if (profilesError || !allProfiles) {
          console.error('Error loading profiles:', profilesError);
          setDailyMatches([]);
          return;
        }

        // Get compatibility answers for these profiles
        const profileUserIds = allProfiles.map(p => p.user_id).filter(Boolean);
        let { data: answersData, error: answersError } = await supabase
          .from('compatibility_answers')
          .select('user_id, answers')
          .in('user_id', profileUserIds);

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
          compatibility_answers: answersMap.get(profile.user_id) || null
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
            } else if (userPreferences.gender_preference === 'Men' && profileGender === 'male') {
              userWantsProfile = true;
            } else if (userPreferences.gender_preference === 'Women' && profileGender === 'female') {
              userWantsProfile = true;
            } else if (userPreferences.gender_preference === 'Non-binary' && profileGender === 'non-binary') {
              userWantsProfile = true;
            }

            // PROFILE WANTS TO SEE USER (BIDIRECTIONAL CHECK)
            let profileWantsUser = false;
            if (profileSeekingGender === 'Everyone') {
              profileWantsUser = true;
            } else if (profileSeekingGender === 'Men' && userGender === 'Male') {
              profileWantsUser = true;
            } else if (profileSeekingGender === 'Women' && userGender === 'Female') {
              profileWantsUser = true;
            } else if (profileSeekingGender === 'Non-binary' && userGender === 'Non-binary') {
              profileWantsUser = true;
            }

            return userWantsProfile && profileWantsUser;
          });
        }

        console.log('Daily matches bidirectional filtered profiles count:', profilesData.length);

        if (profilesData && profilesData.length > 0) {
          // Convert profiles to daily matches format
          const convertedMatches = profilesData.slice(0, 5).map(profile => ({
            id: `daily-${user.id}-${profile.user_id}`,
            user_id: user.id,
            suggested_user_id: profile.user_id,
            compatibility_score: Math.floor(Math.random() * 30) + 60,
            suggested_date: new Date().toISOString().split('T')[0],
            viewed: false,
            created_at: new Date().toISOString(),
            user_profile: {
              user_id: profile.user_id,
              email: profile.email,
              bio: profile.bio,
              photo_urls: Array.isArray(profile.photo_urls) && profile.photo_urls.length > 0 
                ? profile.photo_urls 
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
        const userIds = existingMatches.map(match => match.suggested_user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('dating_profiles')
          .select('*')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error loading profiles for daily matches:', profilesError);
          return;
        }

        const processedMatches = existingMatches.map(match => {
          const profile = profilesData?.find(p => p.user_id === match.suggested_user_id);
          return {
            ...match,
            user_profile: profile ? {
              user_id: profile.user_id,
              email: profile.email || `${profile.user_id}@example.com`,
              bio: profile.bio || '',
              photo_urls: profile.photo_urls && Array.isArray(profile.photo_urls) && profile.photo_urls.length > 0 
                ? profile.photo_urls 
                : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
              first_name: profile.first_name || 'User',
              age: profile.age || 25,
              gender: profile.gender || 'Unknown'
            } : {
              user_id: match.suggested_user_id,
              email: `${match.suggested_user_id}@example.com`,
              bio: '',
              photo_urls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
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

      const { data: compatibilityData } = await supabase
        .from('compatibility_answers')
        .select('answers')
        .eq('user_id', user.id)
        .maybeSingle();

      if (compatibilityData?.answers) {
        const answers = compatibilityData.answers as any;
        userPreferences.gender_preference = answers['12'] || 'Everyone';
        userGender = answers['7'] || 'Unknown';
      }

      // Get compatible profiles first
      let { data: allProfiles, error: profilesError } = await supabase
        .from('dating_profiles')
        .select('*')
        .eq('visible', true)
        .gte('age', userPreferences.age_min)
        .lte('age', userPreferences.age_max)
        .neq('user_id', user.id)
        .limit(matchCount * 2);

      if (profilesError || !allProfiles) {
        console.error('Error fetching profiles for daily matches:', profilesError);
        return;
      }

      // Get compatibility answers for these profiles
      const profileUserIds = allProfiles.map(p => p.user_id).filter(Boolean);
      let { data: answersData, error: answersError } = await supabase
        .from('compatibility_answers')
        .select('user_id, answers')
        .in('user_id', profileUserIds);

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
        compatibility_answers: answersMap.get(profile.user_id) || null
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
            (userPreferences.gender_preference === 'Men' && profileGender === 'male') ||
            (userPreferences.gender_preference === 'Women' && profileGender === 'female') ||
            (userPreferences.gender_preference === 'Non-binary' && profileGender === 'non-binary');

           let profileWantsUser = profileSeekingGender === 'Everyone' ||
            (profileSeekingGender === 'Men' && userGender === 'Male') ||
            (profileSeekingGender === 'Women' && userGender === 'Female') ||
            (profileSeekingGender === 'Non-binary' && userGender === 'Non-binary') ||
            userGender === 'Unknown'; // Be lenient if user gender is unknown

          return userWantsProfile && profileWantsUser;
        });

        // Create daily matches from filtered profiles
        const dailyMatchData = filteredProfiles.slice(0, matchCount).map(profile => ({
          user_id: user.id,
          suggested_user_id: profile.user_id,
          compatibility_score: Math.floor(Math.random() * 30) + 60,
          suggested_date: new Date().toISOString().split('T')[0],
          viewed: false
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
        .update({ viewed: true })
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
