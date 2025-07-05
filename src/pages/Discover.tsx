
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
import NavigationTabs from '@/components/navigation/NavigationTabs';
import SwipeIndicators from '@/components/discover/SwipeIndicators';
import ProfessionalProfileCard from '@/components/discover/ProfessionalProfileCard';

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
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      console.log('Fetching profiles for discovery...');
      
      // Get user's preferences first
      let userPreferences = {
        gender_preference: 'Any',
        age_min: 18,
        age_max: 65
      };

      if (user?.id) {
        const { data: userProfileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Get user's preferences from compatibility answers
        const { data: compatibilityData } = await supabase
          .from('compatibility_answers')
          .select('answers')
          .eq('user_id', user.id)
          .maybeSingle();

        if (compatibilityData?.answers) {
          const answers = compatibilityData.answers as any;
          userPreferences.gender_preference = answers.partner_gender || answers.interested_in || 'Any';
          userPreferences.age_min = parseInt(answers.partner_age_min || answers.age_preference_min) || 18;
          userPreferences.age_max = parseInt(answers.partner_age_max || answers.age_preference_max) || 65;
        }
      }

      console.log('User preferences:', userPreferences);
      
      // Build query with user preferences
      let query = supabase
        .from('dating_profiles')
        .select('*')
        .gte('age', userPreferences.age_min)
        .lte('age', userPreferences.age_max);

        // Filter by gender preference if not 'Any'
      if (userPreferences.gender_preference !== 'Any' && userPreferences.gender_preference !== 'everyone') {
        let genderFilter = userPreferences.gender_preference;
        
        // Convert preference format to match database
        if (genderFilter === 'men') genderFilter = 'Male';
        if (genderFilter === 'women') genderFilter = 'Female';
        if (genderFilter === 'non_binary') genderFilter = 'Non-binary';
        
        query = query.eq('gender', genderFilter);
      }

      const { data: datingProfilesData, error: datingError } = await query.limit(50);

      let profilesData: any[] = [];
      let error = datingError;

      console.log(`Found ${datingProfilesData?.length || 0} dating profiles matching preferences`);

      if (datingProfilesData && datingProfilesData.length > 0) {
        profilesData = datingProfilesData;
      } else {
        // If no dating profiles, fall back to user profiles
        let fallbackQuery = supabase.from('profiles').select('*');
        
        if (user?.id) {
          fallbackQuery = fallbackQuery.neq('user_id', user.id);
        }

        const result = await fallbackQuery.limit(50);
        profilesData = result.data || [];
        error = result.error;
        console.log(`Fallback to ${profilesData?.length || 0} user profiles`);
      }

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
        .filter(profile => {
          // For dating_profiles, filter by id; for user profiles, filter by user_id
          const profileId = profile.user_id || profile.id;
          return !swipedUserIds.includes(profileId);
        })
        .map((profile) => {
          // Check if this is from dating_profiles table (has first_name, last_name, age)
          if (profile.first_name && profile.last_name && profile.age) {
            return {
              id: profile.id,
              user_id: profile.user_id || profile.id,
              email: profile.email,
              bio: profile.bio,
              photo_urls: profile.photo_urls || ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
              firstName: profile.first_name,
              lastName: profile.last_name,
              age: profile.age,
              location: `${profile.city}, ${profile.state}`,
              compatibility_score: Math.floor(Math.random() * 30) + 60
            };
          } else {
            // Transform user profiles (fallback)
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
          }
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
    const velocity = Math.abs(info.velocity.x);
    
    if (info.offset.x > threshold || (velocity > 500 && info.offset.x > 50)) {
      handleSwipe('like');
    } else if (info.offset.x < -threshold || (velocity > 500 && info.offset.x < -50)) {
      handleSwipe('pass');
    }
  };

  const currentProfile = profiles[currentIndex];
  const hasMoreProfiles = currentIndex < profiles.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-love-background via-white to-love-surface">
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-primary"></div>
            <span className="ml-3 text-love-text-light">Loading profiles...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--love-gradient-bg)' }}>
      <NavigationTabs />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-love-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-love-primary to-love-secondary rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-love-primary to-love-secondary bg-clip-text text-transparent">
                Discover
              </span>
            </div>

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

      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h3 className="text-lg font-semibold text-love-text mb-2">
            Discover Your Perfect Match
          </h3>
          <p className="text-love-text-light">
            {hasMoreProfiles ? `${profiles.length - currentIndex} curated matches waiting` : 'No more profiles to show'}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-sm h-[600px]">
            {!hasMoreProfiles ? (
              <Card className="border-love-primary/20 text-center py-16 h-full flex items-center justify-center bg-gradient-to-br from-love-surface to-white">
                <CardContent className="space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-love-primary to-love-secondary rounded-full flex items-center justify-center mx-auto">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-love-text mb-3">You're All Caught Up!</h3>
                    <p className="text-love-text-light mb-6 max-w-sm mx-auto">
                      You've seen all available matches. Check back later for new profiles, or adjust your preferences to discover more connections.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white shadow-lg"
                      size="lg"
                    >
                      Back to Dashboard
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="border-love-primary/30 text-love-primary hover:bg-love-primary/5"
                    >
                      Refresh Matches
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                {currentProfile && (
                  <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.9, opacity: 0, rotateY: 10 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ 
                      scale: 0.8, 
                      opacity: 0,
                      x: swipeDirection === 'like' ? 400 : swipeDirection === 'pass' ? -400 : 0,
                      rotate: swipeDirection === 'like' ? 20 : swipeDirection === 'pass' ? -20 : 0,
                      transition: { duration: 0.4, ease: "easeInOut" }
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    drag="x"
                    dragConstraints={{ left: -100, right: 100 }}
                    dragElastic={0.3}
                    onDragEnd={handleDragEnd}
                    onDrag={(event, info) => {
                      setDragX(info.offset.x);
                      setIsDragging(Math.abs(info.offset.x) > 10);
                    }}
                    onDragStart={() => setIsDragging(true)}
                    whileDrag={{ 
                      rotate: dragX * 0.1, 
                      scale: 1.05,
                      cursor: 'grabbing',
                      zIndex: 10
                    }}
                    className="absolute w-full cursor-grab active:cursor-grabbing"
                  >
                    <ProfessionalProfileCard 
                      profile={currentProfile}
                      dragX={dragX}
                    />
                    <SwipeIndicators 
                      dragX={dragX}
                      isVisible={isDragging}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Enhanced Action Buttons */}
            {hasMoreProfiles && (
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
                <div className="text-center">
                  <Button
                    onClick={() => handleSwipe('pass')}
                    disabled={swipeLoading}
                    size="lg"
                    variant="outline"
                    className="w-16 h-16 rounded-full border-3 border-red-400/60 hover:border-red-500 hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                  >
                    <X className="h-7 w-7 text-red-500" />
                  </Button>
                  <p className="text-xs text-love-text-light mt-2 font-medium">Pass</p>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={() => handleSwipe('like')}
                    disabled={swipeLoading}
                    size="lg"
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  >
                    <Heart className="h-7 w-7 fill-current" />
                  </Button>
                  <p className="text-xs text-love-text-light mt-2 font-medium">Like</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
