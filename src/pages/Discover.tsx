
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
  gender?: string;
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
      
      if (!user?.id) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
        return;
      }

      // Get user's preferences and gender from compatibility answers
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
        console.log('User preferences - Gender:', userGender, 'Seeking:', userPreferences.gender_preference);
      }

      console.log('Final user preferences:', userPreferences);

      // Get all profiles and compatibility answers separately
      let { data: allProfiles, error: profilesError } = await supabase
        .from('dating_profiles')
        .select('*')
        .eq('visible', true)
        .gte('age', userPreferences.age_min)
        .lte('age', userPreferences.age_max)
        .neq('user_id', user.id);

      if (profilesError || !allProfiles) {
        console.error('Error loading profiles:', profilesError);
        toast({
          title: 'Error',
          description: 'Failed to load profiles. Please try again.',
          variant: 'destructive'
        });
        setProfiles([]);
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

      // Apply strict gender filtering based on user preferences
      const genderFilteredProfiles = profilesWithAnswers?.filter(profile => {
        const profileGender = profile.gender?.toLowerCase() || 'unknown';
        
        // Apply user's gender preference filter
        if (userPreferences.gender_preference === 'Everyone') {
          return true;
        } else if (userPreferences.gender_preference === 'Women') {
          const isWoman = ['female', 'woman', 'women', 'f'].includes(profileGender);
          console.log(`Profile ${profile.first_name} (${profileGender}): Is woman? ${isWoman}`);
          return isWoman;
        } else if (userPreferences.gender_preference === 'Men') {
          const isMan = ['male', 'man', 'men', 'm'].includes(profileGender);
          console.log(`Profile ${profile.first_name} (${profileGender}): Is man? ${isMan}`);
          return isMan;
        } else if (userPreferences.gender_preference === 'Non-binary') {
          const isNonBinary = ['non-binary', 'nonbinary', 'nb', 'enby'].includes(profileGender);
          console.log(`Profile ${profile.first_name} (${profileGender}): Is non-binary? ${isNonBinary}`);
          return isNonBinary;
        }
        
        return false;
      }) || [];

      console.log(`Found ${genderFilteredProfiles.length} gender-filtered profiles`);

      // Get already swiped user IDs to exclude
      const { data: swipeData } = await supabase
        .from('swipe_actions')
        .select('swiped_user_id')
        .eq('swiper_id', user.id);
      
      const swipedUserIds = swipeData?.map(s => s.swiped_user_id) || [];

      // Filter out already swiped profiles and transform data
      const transformedProfiles = genderFilteredProfiles
        .filter(profile => !swipedUserIds.includes(profile.user_id))
        .map((profile) => ({
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email || `${profile.user_id}@example.com`,
          bio: profile.bio || '',
          photo_urls: profile.photo_urls && Array.isArray(profile.photo_urls) ? profile.photo_urls : ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
          firstName: profile.first_name || 'User',
          lastName: profile.last_name || '',
          age: profile.age || 25,
          location: `${profile.city || 'Unknown'}, ${profile.state || 'Unknown'}`,
          compatibility_score: Math.floor(Math.random() * 30) + 60,
          gender: profile.gender || 'Unknown'
        }));

      // Sort by compatibility score
      transformedProfiles.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));
      
      setProfiles(transformedProfiles);
      
      if (transformedProfiles.length > 0) {
        toast({
          title: 'Profiles Loaded',
          description: `Found ${transformedProfiles.length} compatible matches!`
        });
      } else {
        toast({
          title: 'No Matches Found',
          description: 'Try adjusting your preferences or check back later for new profiles.'
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
      
      if (direction === 'like') {
        toast({
          title: '💖 Great choice!',
          description: `You liked ${currentProfile.firstName}. They'll be notified if it's a match!`,
        });
      }
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
        <NavigationTabs />
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-primary"></div>
            <span className="ml-3 text-love-text-light">Loading compatible profiles...</span>
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
            {hasMoreProfiles ? `${profiles.length - currentIndex} compatible matches waiting` : 'No more profiles to show'}
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
                      You've seen all compatible matches. Check back later for new profiles, or adjust your preferences to discover more connections.
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
