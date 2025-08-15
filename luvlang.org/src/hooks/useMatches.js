import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
export const useMatches = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // N8N Webhook Integration for Enhanced Matching
    const triggerN8NMatching = async (userId) => {
        try {
            const response = await fetch('http://localhost:5678/webhook/luvlang-match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    action: 'find_matches',
                    timestamp: new Date().toISOString(),
                    trigger_source: 'user_request'
                })
            });
            if (response.ok) {
                const result = await response.json();
                console.log('N8N matching workflow triggered:', result);
                return result;
            }
        }
        catch (error) {
            console.warn('N8N webhook failed, falling back to standard matching:', error);
        }
        return null;
    };
    const loadMatches = async () => {
        if (!user) {
            setMatches([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            console.log('Loading matches for user:', user.id);
            // Get user's gender and preferences for proper filtering
            let userGender = 'Unknown';
            let userPreferences = { gender_preference: 'Everyone' };
            const { data: compatibilityData } = await supabase
                .from('compatibility_answers')
                .select('answers')
                .eq('user_id', user.id)
                .maybeSingle();
            if (compatibilityData?.answers) {
                const answers = compatibilityData.answers;
                userGender = answers['7'] || 'Unknown';
                userPreferences.gender_preference = answers['12'] || 'Everyone';
                console.log('User gender:', userGender, 'seeking:', userPreferences.gender_preference);
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
                console.log('No matches found, applying bidirectional filtering for sample profiles');
                // Get all visible profiles and their compatibility answers separately
                let { data: allProfiles, error: profilesError } = await supabase
                    .from('dating_profiles')
                    .select('*')
                    .eq('visible', true)
                    .neq('user_id', user.id);
                if (profilesError || !allProfiles) {
                    console.error('Error loading profiles:', profilesError);
                    setMatches([]);
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
                    // Continue without answers - still show profiles
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
                // Apply strict bidirectional filtering
                const bidirectionalMatches = profilesWithAnswers.filter(profile => {
                    const profileAnswers = profile.compatibility_answers;
                    if (!profileAnswers)
                        return false;
                    const profileGender = profile.gender?.toLowerCase();
                    const profileSeekingGender = profileAnswers['12'];
                    // USER WANTS TO SEE THIS PROFILE
                    let userWantsProfile = false;
                    if (userPreferences.gender_preference === 'Everyone') {
                        userWantsProfile = true;
                    }
                    else if (userPreferences.gender_preference === 'Men' && profileGender === 'male') {
                        userWantsProfile = true;
                    }
                    else if (userPreferences.gender_preference === 'Women' && profileGender === 'female') {
                        userWantsProfile = true;
                    }
                    else if (userPreferences.gender_preference === 'Non-binary' && profileGender === 'non-binary') {
                        userWantsProfile = true;
                    }
                    // PROFILE WANTS TO SEE USER (BIDIRECTIONAL CHECK)
                    let profileWantsUser = false;
                    if (profileSeekingGender === 'Everyone') {
                        profileWantsUser = true;
                    }
                    else if (profileSeekingGender === 'Men' && userGender === 'Male') {
                        profileWantsUser = true;
                    }
                    else if (profileSeekingGender === 'Women' && userGender === 'Female') {
                        profileWantsUser = true;
                    }
                    else if (profileSeekingGender === 'Non-binary' && userGender === 'Non-binary') {
                        profileWantsUser = true;
                    }
                    else if (userGender === 'Unknown') {
                        // If user gender is unknown, be more lenient
                        profileWantsUser = true;
                    }
                    const isMatch = userWantsProfile && profileWantsUser;
                    console.log(`Match check for ${profile.first_name}: User wants: ${userWantsProfile}, Profile wants user: ${profileWantsUser}, Result: ${isMatch}`);
                    return isMatch;
                });
                console.log('Bidirectional filtered matches count:', bidirectionalMatches.length);
                // Convert to matches format
                const sampleMatches = bidirectionalMatches.slice(0, 10).map((profile) => ({
                    id: `sample-${profile.id}`,
                    user_id: user.id,
                    matched_user_id: profile.user_id,
                    compatibility: Math.floor(Math.random() * 30) + 70,
                    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'accepted',
                    match_profile: {
                        user_id: profile.user_id,
                        email: profile.email || `${profile.user_id}@example.com`,
                        bio: profile.bio || '',
                        photo_urls: profile.photo_urls && Array.isArray(profile.photo_urls) ? profile.photo_urls : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
                        first_name: profile.first_name || 'User',
                        age: profile.age || 25,
                        gender: profile.gender || 'Unknown'
                    }
                }));
                setMatches(sampleMatches);
                return;
            }
            // Process existing matches
            const otherUserIds = matchesData.map(match => {
                return match.user_id === user.id ? match.matched_user_id : match.user_id;
            });
            const { data: profilesData, error: profilesError } = await supabase
                .from('dating_profiles')
                .select('*')
                .in('user_id', otherUserIds);
            if (profilesError) {
                console.error('Error loading profiles:', profilesError);
                return;
            }
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
                        email: profile.email || `${profile.user_id}@example.com`,
                        bio: profile.bio || '',
                        photo_urls: profile.photo_urls && Array.isArray(profile.photo_urls) ? profile.photo_urls : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
                        first_name: profile.first_name || 'User',
                        age: profile.age || 25,
                        gender: profile.gender || 'Unknown'
                    } : undefined
                };
            });
            setMatches(processedMatches);
        }
        catch (error) {
            console.error('Error loading matches:', error);
        }
        finally {
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
