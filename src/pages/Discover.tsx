
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { diverseUsersData } from '@/data/diverseUsersData';
import { motion, AnimatePresence } from 'framer-motion';
import DiscoverHeader from '@/components/discover/DiscoverHeader';
import ProfileCard from '@/components/discover/ProfileCard';
import SwipeActions from '@/components/discover/SwipeActions';
import EmptyState from '@/components/discover/EmptyState';

const Discover = () => {
  const { signOut } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | null>(null);

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

  const currentUser = diverseUsersData[currentIndex];
  const hasMoreProfiles = currentIndex < diverseUsersData.length;

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
                {currentUser && (
                  <ProfileCard
                    key={currentIndex}
                    user={currentUser}
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
