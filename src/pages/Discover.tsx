
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import DiscoverHeader from '@/components/discover/DiscoverHeader';
import ProfileCard from '@/components/discover/ProfileCard';
import SwipeActions from '@/components/discover/SwipeActions';
import EmptyState from '@/components/discover/EmptyState';

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
}

const Discover = () => {
  const { signOut, user } = useAuth();
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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('user_id', user?.id || '')
        .limit(10);

      if (error) throw error;

      // Transform the data to match the expected format
      const transformedProfiles = (data || []).map(profile => ({
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
        firstName: profile.email.split('@')[0] || 'User',
        lastName: ''
      }));

      setProfiles(transformedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'like' | 'pass') => {
    setSwipeDirection(direction);
    
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
          <p className="text-gray-600">Swipe right to like, left to pass</p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-md h-[600px]">
            {!hasMoreProfiles ? (
              <EmptyState />
            ) : (
              <AnimatePresence mode="wait">
                {currentProfile && (
                  <ProfileCard
                    key={currentIndex}
                    user={currentProfile}
                    swipeDirection={swipeDirection}
                    onDragEnd={handleDragEnd}
                    cardIndex={currentIndex}
                  />
                )}
              </AnimatePresence>
            )}

            {hasMoreProfiles && (
              <SwipeActions
                onLike={() => handleSwipe('like')}
                onPass={() => handleSwipe('pass')}
              />
            )}
          </div>
        </div>

        {hasMoreProfiles && (
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              💡 Drag the card or use the buttons below to interact
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
