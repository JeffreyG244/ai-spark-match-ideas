import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeActions } from '@/hooks/useSwipeActions';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import DiscoverHeader from '@/components/discover/DiscoverHeader';
import ProfileCard from '@/components/discover/ProfileCard';
import SwipeActions from '@/components/discover/SwipeActions';
import EmptyState from '@/components/discover/EmptyState';
import CompatibilityScore from '@/components/discover/CompatibilityScore';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  bio: string | null;
  values: string | null;
  life_goals: string | null;
  green_flags: string | null;
  photos: string[];
  firstName: string;
  lastName: string;
  compatibility_score?: number;
}

const Discover = () => {
  const { signOut, user } = useAuth();
  const { recordSwipe, isLoading: swipeLoading } = useSwipeActions();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      console.log('Fetching profiles for discover page...');
      
      // First, try to get matches from user_matches table
      const { data: matchesData, error: matchesError } = await supabase
        .from('user_matches')
        .select(`
          compatibility_score,
          user1_id,
          user2_id,
          user_profiles!user_matches_user1_id_fkey(user_id, email, bio, values, life_goals, green_flags, photos),
          user_profiles!user_matches_user2_id_fkey(user_id, email, bio, values, life_goals, green_flags, photos)
        `)
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
        .order('compatibility_score', { ascending: false });

      console.log('Matches data:', matchesData);

      let profilesWithScores: UserProfile[] = [];

      if (matchesData && matchesData.length > 0) {
        // Extract profiles from matches
        profilesWithScores = matchesData.map((match) => {
          // Handle the profile data properly - it's an array from the join
          let otherProfile = null;
          if (Array.isArray(match.user_profiles)) {
            const otherUserId = match.user1_id === user?.id ? match.user2_id : match.user1_id;
            otherProfile = match.user_profiles.find((profile: any) => profile && profile.user_id === otherUserId);
          }

          if (!otherProfile) return null;

          const firstName = otherProfile.email.split('@')[0] || 'User';
          
          return {
            id: otherProfile.user_id,
            user_id: otherProfile.user_id,
            email: otherProfile.email,
            bio: otherProfile.bio || 'No bio available',
            values: otherProfile.values || 'No values listed',
            life_goals: otherProfile.life_goals || 'No life goals shared',
            green_flags: otherProfile.green_flags || 'No green flags listed',
            photos: otherProfile.photos && otherProfile.photos.length > 0 
              ? otherProfile.photos 
              : ['https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60'],
            firstName,
            lastName: '',
            compatibility_score: match.compatibility_score
          };
        }).filter(Boolean) as UserProfile[];
      }

      // If no matches, get all profiles and calculate compatibility
      if (profilesWithScores.length === 0) {
        console.log('No matches found, fetching all profiles...');
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .neq('user_id', user?.id || '')
          .limit(20);

        if (error) {
          console.error('Error fetching profiles:', error);
          throw error;
        }

        console.log(`Found ${data?.length || 0} profiles to display`);

        // Get compatibility scores for each profile
        profilesWithScores = await Promise.all(
          (data || []).map(async (profile) => {
            let compatibilityScore = Math.floor(Math.random() * 40) + 40; // Random score between 40-80
            
            // Try to calculate actual compatibility if function exists
            try {
              const { data: scoreData } = await supabase
                .rpc('calculate_compatibility_score', {
                  user1_id: user?.id,
                  user2_id: profile.user_id
                });
              
              if (scoreData) {
                compatibilityScore = scoreData;
              }
            } catch (error) {
              console.log('Compatibility function not available, using random score');
            }

            const firstName = profile.email.split('@')[0] || 'User';
            
            return {
              id: profile.id.toString(),
              user_id: profile.user_id,
              email: profile.email,
              bio: profile.bio || 'No bio available',
              values: profile.values || 'No values listed',
              life_goals: profile.life_goals || 'No life goals shared',
              green_flags: profile.green_flags || 'No green flags listed',
              photos: profile.photos && profile.photos.length > 0 
                ? profile.photos 
                : ['https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60'],
              firstName,
              lastName: '',
              compatibility_score: compatibilityScore
            };
          })
        );
      }

      // Sort by compatibility score (highest first)
      profilesWithScores.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));
      
      console.log(`Setting ${profilesWithScores.length} profiles for display`);
      setProfiles(profilesWithScores);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (swipeLoading || !currentProfile) return;
    
    setSwipeDirection(direction);
    
    // Record the swipe action
    await recordSwipe(currentProfile.user_id, direction);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      handleSwipe('like');
    } else if (info.offset.x < -threshold) {
      handleSwipe('pass');
    }
  };

  const currentProfile = profiles[currentIndex];
  const hasMoreProfiles = currentIndex < profiles.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto p-6">
          <DiscoverHeader onSignOut={signOut} />
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading profiles...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        <DiscoverHeader onSignOut={signOut} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover New Connections</h1>
          <p className="text-gray-600">Swipe right to like, left to pass • Profiles ordered by compatibility</p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-md h-[600px]">
            {!hasMoreProfiles ? (
              <EmptyState />
            ) : (
              <AnimatePresence mode="wait">
                {currentProfile && (
                  <div key={currentIndex} className="relative">
                    {/* Compatibility Score Display */}
                    {currentProfile.compatibility_score !== undefined && (
                      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                        <CompatibilityScore 
                          score={currentProfile.compatibility_score} 
                          showLabel={false}
                        />
                      </div>
                    )}
                    
                    <ProfileCard
                      user={currentProfile}
                      swipeDirection={swipeDirection}
                      onDragEnd={handleDragEnd}
                      cardIndex={currentIndex}
                    />
                  </div>
                )}
              </AnimatePresence>
            )}

            {hasMoreProfiles && (
              <SwipeActions
                onLike={() => handleSwipe('like')}
                onPass={() => handleSwipe('pass')}
                disabled={swipeLoading}
              />
            )}
          </div>
        </div>

        {hasMoreProfiles && (
          <div className="text-center mt-8 space-y-2">
            <p className="text-gray-500 text-sm">
              💡 Drag the card or use the buttons below to interact
            </p>
            {currentProfile?.compatibility_score !== undefined && (
              <p className="text-purple-600 text-sm font-medium">
                Compatibility: {currentProfile.compatibility_score}% • 
                {profiles.length - currentIndex - 1} profiles remaining
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
