
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
  };
}

export const useDailyMatches = () => {
  const { user } = useAuth();
  const [dailyMatches, setDailyMatches] = useState<DailyMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDailyMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Loading daily matches for user:', user.id);
      
      // Try to get daily matches first
      const { data: matchesData, error: matchesError } = await supabase
        .from('daily_matches')
        .select('*')
        .eq('user_id', user.id)
        .eq('suggested_date', new Date().toISOString().split('T')[0])
        .order('compatibility_score', { ascending: false });

      if (matchesError) {
        console.error('Error loading daily matches:', matchesError);
      }

      console.log('Daily matches data:', matchesData);

      if (!matchesData || matchesData.length === 0) {
        console.log('No daily matches found, applying bidirectional filtering...');
        
        // Get user's preferences and gender
        let userPreferences = {
          gender_preference: 'Everyone',
          age_min: 18,
          age_max: 65
        };
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
        
        // Try dating_profiles with bidirectional matching first
        let { data: profilesWithAnswers, error: profilesError } = await supabase
          .from('dating_profiles')
          .select(`
            *,
            compatibility_answers!inner(answers)
          `)
          .gte('age', userPreferences.age_min)
          .lte('age', userPreferences.age_max);

        let profilesData: any[] = [];

        if (profilesWithAnswers && profilesWithAnswers.length > 0) {
          // Apply BIDIRECTIONAL filtering
          profilesData = profilesWithAnswers.filter(profile => {
            const profileAnswers = (profile as any).compatibility_answers?.[0]?.answers as any;
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

            const match = userWantsProfile && profileWantsUser;
            if (match) {
              console.log(`✅ Daily match bidirectional: ${userGender} seeking ${userPreferences.gender_preference} ↔ ${profileGender} seeking ${profileSeekingGender}`);
            }

            return match;
          });
        } else {
          // Fallback to basic filtering if no profiles with answers
          console.log('Daily matches - No profiles with answers, using basic filtering');
          let basicQuery = supabase
            .from('dating_profiles')
            .select('*')
            .gte('age', userPreferences.age_min)
            .lte('age', userPreferences.age_max);

          if (userPreferences.gender_preference !== 'Everyone') {
            let genderFilter = userPreferences.gender_preference;
            if (genderFilter === 'Men') genderFilter = 'Male';
            if (genderFilter === 'Women') genderFilter = 'Female';
            if (genderFilter === 'Non-binary') genderFilter = 'Non-binary';
            basicQuery = basicQuery.eq('gender', genderFilter);
          }

          const { data: basicProfiles, error: basicError } = await basicQuery.limit(10);
          profilesData = basicProfiles || [];

          // If still no dating profiles, fallback to regular profiles
          if (profilesData.length === 0) {
            console.log('No dating profiles found, falling back to regular profiles');
            const { data: fallbackProfiles, error: fallbackError } = await supabase
              .from('profiles')
              .select('*')
              .neq('user_id', user.id)
              .limit(10);
            
            profilesData = fallbackProfiles as any;
          }
        }

        if (profilesError) {
          console.error('Error loading profiles for matching:', profilesError);
          setDailyMatches([]);
          return;
        }

        console.log('Daily matches filtered profiles count:', profilesData.length);

        if (profilesData && profilesData.length > 0) {
          // Convert profiles to daily matches format (handle both dating_profiles and profiles)
          const convertedMatches = profilesData.map(profile => {
            // Handle different table structures
            const isFromDatingProfiles = 'first_name' in profile;
            const userId = profile.user_id || (profile as any).id;
            const email = profile.email || '';
            
            return {
              id: `match-${user.id}-${userId}`,
              user_id: user.id,
              suggested_user_id: userId,
              compatibility_score: Math.floor(Math.random() * 30) + 60, // 60-90%
              suggested_date: new Date().toISOString().split('T')[0],
              viewed: false,
              created_at: new Date().toISOString(),
              user_profile: {
                user_id: userId,
                email: email,
                bio: profile.bio,
                photo_urls: profile.photo_urls
              }
            };
          });

          setDailyMatches(convertedMatches);
          console.log(`Created ${convertedMatches.length} matches from available profiles`);
          return;
        }
      }

      // Get profiles for existing daily matches
      if (matchesData && matchesData.length > 0) {
        const userIds = matchesData.map(match => match.suggested_user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, email, bio, photo_urls')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          return;
        }

        const processedMatches = matchesData.map(match => {
          const profile = profilesData?.find(p => p.user_id === match.suggested_user_id);
          return {
            ...match,
            user_profile: profile ? {
              user_id: profile.user_id,
              email: profile.email || '',
              bio: profile.bio,
              photo_urls: profile.photo_urls
            } : undefined
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
      
      // Get available profiles for matching - try dating_profiles first
      let { data: profiles, error: profilesError } = await supabase
        .from('dating_profiles')
        .select('*')
        .limit(matchCount * 2); // Get more to filter from

      // If no dating profiles, fallback to regular profiles
      if (!profiles || profiles.length === 0) {
        const fallbackResult = await supabase
          .from('profiles')
          .select('*')
          .neq('user_id', user.id)
          .limit(matchCount * 2);
        
        // Handle the different data structure by casting to any
        profiles = fallbackResult.data as any;
        profilesError = fallbackResult.error;
      }

      if (profilesError) {
        console.error('Error fetching profiles for matching:', profilesError);
        return;
      }

      if (profiles && profiles.length > 0) {
        // Create daily matches
        const dailyMatchData = profiles.slice(0, matchCount).map(profile => {
          const userId = profile.user_id || (profile as any).id;
          return {
            user_id: user.id,
            suggested_user_id: userId,
            compatibility_score: Math.floor(Math.random() * 30) + 60, // 60-90% professional compatibility
            suggested_date: new Date().toISOString().split('T')[0],
            viewed: false
          };
        });

        const { error: insertError } = await supabase
          .from('daily_matches')
          .insert(dailyMatchData);

        if (insertError) {
          console.error('Error inserting daily matches:', insertError);
        } else {
          console.log(`Successfully generated ${dailyMatchData.length} daily matches`);
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
