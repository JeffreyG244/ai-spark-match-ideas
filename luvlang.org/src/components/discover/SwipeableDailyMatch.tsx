import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSwipeActions } from '@/hooks/useSwipeActions';
import { toast } from '@/hooks/use-toast';
import CompatibilityScore from './CompatibilityScore';
import SwipeIndicators from './SwipeIndicators';

interface SwipeableDailyMatchProps {
  match: {
    id: string;
    compatibility_score: number;
    user_profile?: {
      user_id: string;
      email: string;
      bio: string | null;
      photo_urls: string[] | null;
      first_name?: string;
      age?: number;
      gender?: string;
    };
  };
  onSwipe: (direction: 'like' | 'pass') => void;
}

const SwipeableDailyMatch = ({ match, onSwipe }: SwipeableDailyMatchProps) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | null>(null);
  const { recordSwipe, isLoading } = useSwipeActions();

  const profile = match.user_profile;
  if (!profile) return null;

  const firstName = profile.first_name || profile.email.split('@')[0] || 'User';
  const age = profile.age || Math.floor(Math.random() * 20) + 25;
  
  // Ensure we have a valid photo URL
  const getPhotoUrl = () => {
    if (profile.photo_urls && Array.isArray(profile.photo_urls) && profile.photo_urls.length > 0) {
      return profile.photo_urls[0];
    }
    // Gender-appropriate fallback images
    const fallbackImages = {
      male: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      female: 'https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400&h=600&fit=crop',
      default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'
    };
    
    const gender = profile.gender?.toLowerCase();
    return fallbackImages[gender as keyof typeof fallbackImages] || fallbackImages.default;
  };

  const photoUrl = getPhotoUrl();

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (isLoading) return;
    
    setSwipeDirection(direction);
    
    // Record swipe action
    await recordSwipe(profile.user_id, direction);
    
    if (direction === 'like') {
      toast({
        title: '💖 Great choice!',
        description: `You liked ${firstName}. They'll be notified if it's a match!`,
      });
    }
    
    // Call parent onSwipe after a delay for animation
    setTimeout(() => {
      onSwipe(direction);
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
    
    setIsDragging(false);
    setDragX(0);
  };

  return (
    <motion.div
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
      className="relative cursor-grab active:cursor-grabbing"
    >
      <Card className="border-purple-200 hover:border-purple-300 transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="relative">
            <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
              <img 
                src={photoUrl}
                alt={firstName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop";
                }}
                loading="lazy"
              />
            </div>
            <div className="absolute top-2 right-2">
              <Badge className="bg-white/90 text-purple-800 backdrop-blur-sm">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Daily Pick
              </Badge>
            </div>
          </div>
          
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl">{firstName}</span>
            <Badge className="bg-purple-100 text-purple-800">
              {age} years
            </Badge>
          </CardTitle>
          
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{Math.floor(Math.random() * 10) + 1} miles away</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <CompatibilityScore score={match.compatibility_score} />
          
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {profile.bio || `Hi! I'm ${firstName}, nice to meet you. Looking forward to connecting with someone special.`}
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <Button
              onClick={() => handleSwipe('pass')}
              disabled={isLoading}
              size="lg"
              variant="outline"
              className="w-14 h-14 rounded-full border-3 border-red-400/60 hover:border-red-500 hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
            >
              <X className="h-6 w-6 text-red-500" />
            </Button>
            
            <Button
              onClick={() => handleSwipe('like')}
              disabled={isLoading}
              size="lg"
              className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <Heart className="h-6 w-6 fill-current" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Swipe Indicators */}
      <SwipeIndicators 
        dragX={dragX}
        isVisible={isDragging}
      />
    </motion.div>
  );
};

export default SwipeableDailyMatch;