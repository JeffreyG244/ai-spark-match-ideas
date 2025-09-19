import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSwipeActions } from '@/hooks/useSwipeActions';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, X, Star, Flame, Shield, Calendar, MessageCircle, Zap, Award, Users,
  Building, Clock, Sparkles, Target, Verified, Crown, Bell, Settings, Search, Filter,
  Briefcase, Trophy, MapPin, ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAlert } from '@/components/providers/AlertProvider';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/logo';
import MembershipBadge from '@/components/profile/MembershipBadge';
import { useMembershipBadge } from '@/hooks/useMembershipBadge';

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
  title?: string;
  company?: string;
  industry?: string;
  education?: string;
  distance?: string;
  interests?: string[];
  verifications?: string[];
  badges?: string[];
  lastActive?: string;
}

const Discover = () => {
  const { user, signOut } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { recordSwipe, isLoading: swipeLoading } = useSwipeActions();
  const { membershipLevel } = useMembershipBadge();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | null>(null);
  const [loading, setLoading] = useState(true);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const generateFallbackImage = (gender: string, userId: string) => {
    // Create a deterministic index based on user ID
    const userIdSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const imageIndex = userIdSum % 10;
    
    const maleImages = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop&auto=format&q=80'
    ];
    
    const femaleImages = [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=600&fit=crop&auto=format&q=80',
      'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=400&h=600&fit=crop&auto=format&q=80'
    ];
    
    const genderLower = gender?.toLowerCase() || '';
    const isFemale = ['female', 'woman', 'women', 'f'].includes(genderLower);
    
    return isFemale ? femaleImages[imageIndex] : maleImages[imageIndex];
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      console.log('Fetching profiles for discovery...');
      
      if (!user?.id) {
        console.log('No user found, redirecting to auth');
        navigate('/auth');
        return;
      }

      // Get user's preferences and gender (mocked since table doesn't exist)
      let userPreferences = {
        gender_preference: 'Everyone',
        age_min: 18,
        age_max: 65
      };

      // Get all profiles from users table
      let { data: allProfiles, error: profilesError } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .gte('age', userPreferences.age_min)
        .lte('age', userPreferences.age_max)
        .neq('id', user.id);

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

      // Apply basic filtering and transform data with executive profile data
      const transformedProfiles = allProfiles
        .map((profile) => {
          const userIdSum = profile.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
          const jobTitles = ['Chief Technology Officer', 'Managing Director', 'VP of Marketing', 'Senior VP Sales', 'Chief Financial Officer', 'Head of Operations', 'Director of Strategy', 'VP of Product', 'Chief Marketing Officer', 'Executive Director'];
          const companies = ['Meta', 'Goldman Sachs', 'Netflix', 'Google', 'Apple', 'Microsoft', 'Amazon', 'Tesla', 'JPMorgan', 'McKinsey'];
          const industries = ['Technology', 'Investment Banking', 'Entertainment', 'Consulting', 'Finance', 'Healthcare', 'Real Estate', 'Media', 'Automotive', 'Energy'];
          const educations = ['Harvard Business School', 'Stanford MBA', 'MIT • Computer Science', 'Wharton School', 'Yale University', 'Columbia Business School', 'Berkeley MBA', 'Northwestern Kellogg', 'Chicago Booth', 'Dartmouth Tuck'];
          const interestsList = [
            ['AI Strategy', 'Wine Tasting', 'Chess', 'Sustainable Tech', 'Executive Coaching'],
            ['Global Markets', 'Modern Art', 'Fine Dining', 'Marathon Running', 'Philanthropy'],
            ['Content Strategy', 'Salsa Dancing', 'Documentary Films', 'Sustainable Fashion', 'Travel'],
            ['Strategic Planning', 'Golf', 'Investment', 'Leadership Development', 'Innovation'],
            ['Digital Transformation', 'Yoga', 'Classical Music', 'Venture Capital', 'Mentoring']
          ];
          
          return {
            id: profile.id,
            user_id: profile.id,
            email: profile.email || `${profile.id}@example.com`,
            bio: profile.bio || `Passionate about innovation and meaningful relationships. Building the future while maintaining work-life harmony. Looking for someone who shares my drive for excellence and values authentic connections.`,
            photo_urls: profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0 
              ? profile.photos 
              : [generateFallbackImage(profile.gender, profile.id)],
            firstName: profile.first_name || 'User',
            lastName: profile.last_name || '',
            age: profile.age || (25 + (userIdSum % 15)),
            location: `${profile.city || 'San Francisco'}, ${profile.state || 'CA'}`,
            compatibility_score: Math.floor(Math.random() * 25) + 75,
            gender: profile.gender || 'Unknown',
            title: jobTitles[userIdSum % jobTitles.length],
            company: companies[userIdSum % companies.length],
            industry: industries[userIdSum % industries.length],
            education: educations[userIdSum % educations.length],
            distance: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 9)} miles`,
            interests: interestsList[userIdSum % interestsList.length],
            verifications: ['LinkedIn', 'Company', 'Education'],
            badges: ['Executive Verified', 'Thought Leader', 'Innovation Driver'],
            lastActive: Math.random() > 0.5 ? 'Active now' : `${Math.floor(Math.random() * 24)} hours ago`
          };
        });

      // Sort by compatibility score
      transformedProfiles.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));
      
      setProfiles(transformedProfiles);
      
      if (transformedProfiles.length > 0) {
        showAlert({
          type: 'success',
          title: 'Profiles Loaded! 🎉',
          message: `Found ${transformedProfiles.length} compatible executive matches waiting for you.`,
          actionText: 'Start Browsing',
          autoHide: true,
          duration: 4000
        });
      } else {
        showAlert({
          type: 'warning',
          title: 'No Matches Yet',
          message: 'Expanding search criteria to find more compatible executives. Check back soon!',
          actionText: 'Adjust Preferences',
          onAction: () => navigate('/settings'),
          autoHide: true,
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
      showAlert({
        type: 'warning',
        title: 'Connection Issue',
        message: 'Unable to load profiles right now. Please check your connection and try again.',
        actionText: 'Retry',
        onAction: () => window.location.reload(),
        autoHide: true,
        duration: 5000
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
        // Removed toast notification - using professional alert system instead
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <span className="text-purple-300">Loading executive profiles...</span>
        </div>
      </div>
    );
  }

  // Executive Profile Card Component
  const ExecutiveProfileCard = ({ profile }: { profile: UserProfile }) => (
    <div className="absolute inset-0 rounded-3xl overflow-hidden transform transition-all duration-300">
      <div className="relative h-full bg-gradient-to-b from-transparent via-transparent to-black/80">
        <img 
          src={profile.photo_urls[0]} 
          alt={`${profile.firstName} ${profile.lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.src = generateFallbackImage(profile.gender || 'Unknown', profile.id);
          }}
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {profile.verifications?.includes('Company') && (
              <div className="bg-green-500/90 backdrop-blur-sm rounded-full p-2">
                <Verified className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">{profile.distance}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="bg-purple-500/90 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-bold">{profile.compatibility_score}%</span>
            </div>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-3xl font-bold">{profile.firstName} {profile.lastName}</h3>
              <span className="text-2xl font-light">{profile.age}</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-medium">{profile.title}</span>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Building className="w-5 h-5 text-blue-400" />
              <span className="text-lg">{profile.company} • {profile.industry}</span>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-lg">{profile.education}</span>
            </div>
          </div>

          <p className="text-gray-200 mb-4 leading-relaxed line-clamp-3">{profile.bio}</p>

          {/* Interests Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.interests?.slice(0, 4).map((interest, idx) => (
              <span key={idx} className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1 text-sm">
                {interest}
              </span>
            ))}
            {(profile.interests?.length || 0) > 4 && (
              <span className="bg-purple-500/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                +{(profile.interests?.length || 0) - 4} more
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {profile.badges?.map((badge, idx) => (
              <span key={idx} className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 backdrop-blur-sm border border-purple-400/50 rounded-full px-3 py-1 text-sm flex items-center space-x-1">
                <Trophy className="w-3 h-3" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <Logo size="lg" showText={false} />
              <div>
                <h1 className="text-3xl font-bold text-white">Discover</h1>
                <p className="text-purple-300 text-sm">Executive professionals near you</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
            <MembershipBadge 
              membershipLevel={membershipLevel} 
              size="md"
            />
              
              <button className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all">
                <Filter className="w-5 h-5 text-white" />
              </button>
              
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-3 hover:scale-105 transition-all">
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-purple-300">Loading executive profiles...</span>
          </div>
        ) : !hasMoreProfiles ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">You're All Caught Up!</h3>
            <p className="text-gray-400 mb-8">You've seen all executive professionals. Check back later for new profiles!</p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-all mr-4"
              >
                Back to Dashboard
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-700/50 transition-all"
              >
                Refresh Matches
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-md mx-auto h-full max-h-[700px]">
            <AnimatePresence mode="wait">
              {currentProfile && (
                <motion.div
                  key={currentIndex}
                  initial={{ scale: 0.9, opacity: 0, rotateY: 15, y: 20 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0, y: 0 }}
                  exit={{ 
                    scale: 0.7, 
                    opacity: 0,
                    x: swipeDirection === 'like' ? 500 : swipeDirection === 'pass' ? -500 : 0,
                    rotate: swipeDirection === 'like' ? 25 : swipeDirection === 'pass' ? -25 : 0,
                    transition: { duration: 0.5, ease: "easeInOut", type: "spring", stiffness: 200 }
                  }}
                  transition={{ duration: 0.6, ease: "easeOut", type: "spring", stiffness: 100, damping: 15 }}
                  drag="x"
                  dragConstraints={{ left: -150, right: 150 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  onDrag={(event, info) => {
                    setDragX(info.offset.x);
                    setIsDragging(Math.abs(info.offset.x) > 10);
                  }}
                  onDragStart={() => setIsDragging(true)}
                  whileDrag={{ 
                    rotate: 12, 
                    scale: 1.08,
                    cursor: 'grabbing',
                    zIndex: 20,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  className="absolute w-full cursor-grab active:cursor-grabbing"
                >
                  <ExecutiveProfileCard profile={currentProfile} />
                  
                  {/* Swipe Indicators */}
                  {isDragging && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {/* Like Indicator */}
                      <motion.div
                        className="absolute top-20 right-6 bg-emerald-500 text-white rounded-full p-4 shadow-2xl"
                        style={{ opacity: Math.max(0, Math.min(1, dragX / 100)) }}
                        animate={{ 
                          scale: dragX > 30 ? 1.2 : 1,
                          rotate: dragX > 50 ? 15 : 0
                        }}
                      >
                        <Heart className="h-8 w-8 fill-current" />
                      </motion.div>

                      {/* Pass Indicator */}
                      <motion.div
                        className="absolute top-20 left-6 bg-red-500 text-white rounded-full p-4 shadow-2xl"
                        style={{ opacity: Math.max(0, Math.min(1, -dragX / 100)) }}
                        animate={{ 
                          scale: dragX < -30 ? 1.2 : 1,
                          rotate: dragX < -50 ? -15 : 0
                        }}
                      >
                        <X className="h-8 w-8" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Swipe Actions */}
            <div className="flex items-center justify-center space-x-8 mt-8">
              <button 
                onClick={() => handleSwipe('pass')}
                disabled={swipeLoading}
                className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg disabled:opacity-50"
              >
                <X className="w-8 h-8 text-white" />
              </button>
              
              <button 
                disabled={swipeLoading}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg disabled:opacity-50"
              >
                <Star className="w-6 h-6 text-white" />
              </button>
              
              <button 
                onClick={() => handleSwipe('like')}
                disabled={swipeLoading}
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg disabled:opacity-50"
              >
                <Heart className="w-8 h-8 text-white fill-current" />
              </button>
              
              <button 
                disabled={swipeLoading}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg disabled:opacity-50"
              >
                <Flame className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Discover;