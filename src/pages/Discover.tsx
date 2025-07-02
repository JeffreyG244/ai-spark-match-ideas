
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeActions } from '@/hooks/useSwipeActions';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, X, ArrowLeft, Settings, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  bio: string | null;
  photo_urls: string[];
  firstName: string;
  lastName: string;
  age: number;
  location: string;
  compatibility_score?: number;
}

const Discover = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { recordSwipe, isLoading: swipeLoading } = useSwipeActions();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      console.log('Fetching profiles for discovery...');
      
      let query = supabase.from('profiles').select('*');
      
      if (user?.id) {
        query = query.neq('user_id', user.id);
      }

      const { data: profilesData, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profiles. Please try again.',
          variant: 'destructive'
        });
        setProfiles([]);
        return;
      }

      console.log(`Found ${profilesData?.length || 0} profiles`);

      if (!profilesData || profilesData.length === 0) {
        setProfiles([]);
        return;
      }

      // Get swiped user IDs to exclude
      let swipedUserIds: string[] = [];
      if (user?.id) {
        const { data: swipeData } = await supabase
          .from('swipe_actions')
          .select('swiped_user_id')
          .eq('swiper_id', user.id);
        
        swipedUserIds = swipeData?.map(s => s.swiped_user_id) || [];
      }

      // Transform profiles
      const transformedProfiles = profilesData
        .filter(profile => !swipedUserIds.includes(profile.user_id))
        .map((profile) => {
          const emailName = profile.email?.split('@')[0] || 'User';
          const nameParts = emailName.split('.');
          const firstName = nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || 'Professional';
          const lastName = nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || 'User';
          
          const compatibilityScore = Math.floor(Math.random() * 30) + 60;
          const age = Math.floor(Math.random() * 20) + 25;
          const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'];
          const location = locations[Math.floor(Math.random() * locations.length)];
          
          return {
            id: profile.user_id,
            user_id: profile.user_id,
            email: profile.email || 'Professional User',
            bio: profile.bio || 'Experienced professional looking for meaningful connections.',
            photo_urls: profile.photo_urls && profile.photo_urls.length > 0 
              ? profile.photo_urls 
              : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
            firstName,
            lastName,
            age,
            location,
            compatibility_score: compatibilityScore
          };
        });

      transformedProfiles.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));
      
      setProfiles(transformedProfiles);
      
      if (transformedProfiles.length > 0) {
        toast({
          title: 'Profiles Loaded',
          description: `Found ${transformedProfiles.length} potential matches!`
        });
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
      toast({
        title: 'Error',
        description: 'Failed to load profiles. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (swipeLoading || !currentProfile) return;
    
    setSwipeDirection(direction);
    
    if (user?.id) {
      await recordSwipe(currentProfile.user_id, direction);
    }
    
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <span className="ml-3 text-gray-600">Loading profiles...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Discover
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            {hasMoreProfiles ? `${profiles.length - currentIndex} potential matches remaining` : 'No more profiles to show'}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-sm h-[600px]">
            {!hasMoreProfiles ? (
              <Card className="border-pink-200 text-center py-12 h-full flex items-center justify-center">
                <CardContent>
                  <Heart className="h-12 w-12 text-pink-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">That's everyone for now!</h3>
                  <p className="text-gray-600 mb-6">
                    Check back later for new matches, or expand your preferences.
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                  >
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                {currentProfile && (
                  <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ 
                      scale: 0.9, 
                      opacity: 0,
                      x: swipeDirection === 'like' ? 300 : swipeDirection === 'pass' ? -300 : 0,
                      rotate: swipeDirection === 'like' ? 15 : swipeDirection === 'pass' ? -15 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    drag="x"
                    dragConstraints={{ left: -50, right: 50 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ rotate: 5, scale: 1.02 }}
                    className="absolute w-full cursor-grab active:cursor-grabbing"
                  >
                    <Card className="shadow-xl border-0 overflow-hidden bg-white">
                      {/* Photo */}
                      <div className="relative h-96 bg-gradient-to-br from-pink-100 to-purple-100">
                        <img 
                          src={currentProfile.photo_urls[0]}
                          alt={`${currentProfile.firstName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop";
                          }}
                        />
                        
                        {/* Compatibility Score Overlay */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-sm font-bold text-pink-600">
                            {currentProfile.compatibility_score}% Match
                          </span>
                        </div>
                      </div>

                      {/* Profile Info */}
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {currentProfile.firstName}, {currentProfile.age}
                          </h2>
                          <p className="text-gray-600 flex items-center mt-1">
                            <User className="h-4 w-4 mr-1" />
                            {currentProfile.location}
                          </p>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {currentProfile.bio}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="border-pink-200 text-pink-700">
                            Professional
                          </Badge>
                          <Badge variant="outline" className="border-purple-200 text-purple-700">
                            Career-focused
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Action Buttons */}
            {hasMoreProfiles && (
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-4">
                <Button
                  onClick={() => handleSwipe('pass')}
                  disabled={swipeLoading}
                  size="lg"
                  variant="outline"
                  className="w-14 h-14 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </Button>
                
                <Button
                  onClick={() => handleSwipe('like')}
                  disabled={swipeLoading}
                  size="lg"
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
