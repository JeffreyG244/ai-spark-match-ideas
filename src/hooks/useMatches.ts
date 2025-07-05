import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Match {
  id: string;
  user_id: string;
  matched_user_id: string;
  compatibility: number;
  created_at: string;
  status: string;
  match_profile?: {
    user_id: string;
    email: string;
    bio: string | null;
    photo_urls: string[] | null;
    first_name?: string;
    age?: number;
    gender?: string;
  };
}

export const useMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get user's preferences first
      const { data: userProfileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get user's preferences from compatibility answers
      let userPreferences = {
        gender_preference: 'Everyone',
        age_min: 18,
        age_max: 65
      };

      const { data: compatibilityData } = await supabase
        .from('compatibility_answers')
        .select('answers')
        .eq('user_id', user.id)
        .maybeSingle();

      if (compatibilityData?.answers) {
        const answers = compatibilityData.answers as any;
        // Question 12 is "What partner gender are you interested in?"
        userPreferences.gender_preference = answers['12'] || 'Everyone';
        console.log('User gender preference:', userPreferences.gender_preference);
      }

      // Get matches from the matches table
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user_id.eq.${user.id},matched_user_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (matchesError) {
        console.error('Error loading matches:', matchesError);
        return;
      }

      if (!matchesData || matchesData.length === 0) {
        // If no matches in matches table, show sample profiles with BIDIRECTIONAL matching
        console.log('No matches found, applying bidirectional filtering for:', userPreferences.gender_preference);

        // Get user's own gender from compatibility answers
        let userGender = 'Unknown';
        if (compatibilityData?.answers) {
          const answers = compatibilityData.answers as any;
          userGender = answers['7'] || 'Unknown'; // Question 7 is user's gender identity
          console.log('Current user gender:', userGender);
        }

        // Apply bidirectional matching logic
        let query = supabase
          .from('dating_profiles')
          .select(`
            *,
            compatibility_answers!inner(answers)
          `)
          .gte('age', userPreferences.age_min)
          .lte('age', userPreferences.age_max);

        const { data: profilesWithAnswers, error: profilesError } = await query;

        if (profilesError) {
          console.error('Error loading profiles with answers:', profilesError);
          // Fallback to basic filtering without bidirectional matching
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

          const { data: sampleProfiles, error: sampleError } = await basicQuery.limit(10);

          if (sampleError) {
            console.error('Error loading basic profiles:', sampleError);
            setMatches([]);
            return;
          }

          // Apply basic filtering for fallback
          let filteredProfiles = sampleProfiles || [];
          if (userPreferences.gender_preference !== 'Everyone') {
            filteredProfiles = filteredProfiles.filter(profile => {
              const profileGender = profile.gender?.toLowerCase();
              const preferredGender = userPreferences.gender_preference;
              
              if (preferredGender === 'Men') return profileGender === 'male';
              if (preferredGender === 'Women') return profileGender === 'female';
              if (preferredGender === 'Non-binary') return profileGender === 'non-binary';
              
              return false; // Strict filtering - hide all mismatches
            });
          }

          console.log('Basic filtered profiles count:', filteredProfiles.length);
          
          // Convert to matches and return
          const basicMatches = filteredProfiles.map((profile) => ({
            id: `sample-${profile.id}`,
            user_id: user.id,
            matched_user_id: profile.user_id,
            compatibility: Math.floor(Math.random() * 30) + 70,
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'accepted',
            match_profile: {
              user_id: profile.user_id,
              email: profile.email,
              bio: profile.bio,
              photo_urls: profile.photo_urls,
              first_name: profile.first_name,
              age: profile.age,
              gender: profile.gender
            }
          }));

          setMatches(basicMatches);
          return;
        }

        // Apply BIDIRECTIONAL filtering for profiles with compatibility answers
        console.log('Applying bidirectional matching...');
        const bidirectionalMatches = profilesWithAnswers?.filter(profile => {
          const profileAnswers = (profile as any).compatibility_answers?.[0]?.answers as any;
          if (!profileAnswers) return false;

          const profileGender = profile.gender?.toLowerCase();
          const profileSeekingGender = profileAnswers['12']; // What they're seeking
          const profileUserGender = profileAnswers['7']; // Their own gender

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
            console.log(`✅ Bidirectional match: ${userGender} user seeking ${userPreferences.gender_preference} ↔ ${profileGender} profile seeking ${profileSeekingGender}`);
          }

          return match;
        }) || [];

        console.log('Bidirectional filtered profiles count:', bidirectionalMatches.length);

        // Convert bidirectional matches to match format
        const sampleMatches = bidirectionalMatches.map((profile) => ({
          id: `sample-${profile.id}`,
          user_id: user.id,
          matched_user_id: profile.user_id,
          compatibility: Math.floor(Math.random() * 30) + 70, // Random compatibility 70-100%
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
          status: 'accepted',
          match_profile: {
            user_id: profile.user_id,
            email: profile.email,
            bio: profile.bio,
            photo_urls: profile.photo_urls,
            first_name: profile.first_name,
            age: profile.age,
            gender: profile.gender
          }
        }));

        setMatches(sampleMatches);
        return;
      }

      // Get the other user IDs from matches
      const otherUserIds = matchesData.map(match => {
        return match.user_id === user.id ? match.matched_user_id : match.user_id;
      });

      // Get profiles for the other users from dating_profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('dating_profiles')
        .select('*')
        .in('user_id', otherUserIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      // Process matches to get the other user's profile
      const processedMatches = matchesData.map(match => {
        const otherUserId = match.user_id === user.id ? match.matched_user_id : match.user_id;
        const profile = profilesData?.find(p => p.user_id === otherUserId);
        
        return {
          id: match.uuid_id || `${match.user_id}-${match.matched_user_id}`,
          user_id: match.user_id,
          matched_user_id: match.matched_user_id,
          compatibility: match.compatibility || 75,
          created_at: match.created_at || new Date().toISOString(),
          status: match.status || 'accepted',
          match_profile: profile ? {
            user_id: profile.user_id,
            email: profile.email || '',
            bio: profile.bio,
            photo_urls: profile.photo_urls,
            first_name: profile.first_name,
            age: profile.age,
            gender: profile.gender
          } : undefined
        };
      });

      setMatches(processedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [user]);

  return {
    matches,
    isLoading,
    loadMatches
  };
};