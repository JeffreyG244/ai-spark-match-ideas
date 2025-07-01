
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
      
      // Get all profiles except current user
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user?.id || '')
        .limit(50);

      if (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
        return;
      }

      console.log(`Found ${profilesData?.length || 0} profiles to display`);

      if (!profilesData || profilesData.length === 0) {
        setProfiles([]);
        return;
      }

      // Transform profiles with compatibility scores
      const transformedProfiles = profilesData.map((profile) => {
        const firstName = profile.email?.split('@')[0] || 'User';
        const compatibilityScore = Math.floor(Math.random() * 40) + 50; // Random score between 50-90
        
        return {
          id: profile.user_id,
          user_id: profile.user_id,
          email: profile.email || 'No email',
          bio: profile.bio || 'No bio available',
          values: 'No values listed', // Default since not in profiles table
          life_goals: 'No life goals shared', // Default since not in profiles table
          green_flags: 'No green flags listed', // Default since not in profiles table
          photos: profile.photo_urls && profile.photo_urls.length > 0 
            ? profile.photo_urls 
            : ['https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60'],
          firstName,
          lastName: '',
          compatibility_score: compatibilityScore
        };
      });

      // Sort by compatibility score (highest first)
      transformedProfiles.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));
      
      console.log(`Setting ${transformedProfiles.length} profiles for display`);
      setProfiles(transformedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
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
          {profiles.length > 0 && (
            <p className="text-purple-600 text-sm mt-2">
              {profiles.length} professional profiles available • {profiles.length - currentIndex} remaining
            </p>
          )}
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
