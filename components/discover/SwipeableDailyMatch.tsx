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
      id: string;
      email: string;
      bio: string;
      photos: string[];
      first_name?: string;
      age?: number;
      gender?: string;
    };
  };
  onSwipe: (direction: 'like' | 'pass') => void;
}

const SwipeableDailyMatch: React.FC<SwipeableDailyMatchProps> = ({ match, onSwipe }) => {
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { recordSwipe, isLoading } = useSwipeActions();

  if (!match.user_profile) {
    return null;
  }

  const profile = match.user_profile;
  const firstName = profile.first_name || 'User';
  const age = profile.age || 25;
  const photo = profile.photos && profile.photos.length > 0 
    ? profile.photos[0]
    : 'https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60';

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (isLoading) return;
    
    setSwipeDirection(direction);
    
    try {
      await recordSwipe(profile.id, direction);
      
      if (direction === 'like') {
        toast({
          title: '💖 Great choice!',
          description: `You liked ${firstName}. They'll be notified if it's a match!`,
        });
      }
      
      setTimeout(() => {
        onSwipe(direction);
        setSwipeDirection(null);
      }, 300);
    } catch (error) {
      console.error('Error recording swipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to record swipe. Please try again.',
        variant: 'destructive'
      });
      setSwipeDirection(null);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    const velocity = Math.abs(info.velocity.x);
    
    if (info.offset.x > threshold || (velocity > 500 && info.offset.x > 50)) {
      handleSwipe('like');
    } else if (info.offset.x < -threshold || (velocity > 500 && info.offset.x < -50)) {
      handleSwipe('pass');
    }
    
    setDragX(0);
    setIsDragging(false);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ 
          scale: 0.8, 
          opacity: 0,
          x: swipeDirection === 'like' ? 400 : swipeDirection === 'pass' ? -400 : 0,
          rotate: swipeDirection === 'like' ? 20 : swipeDirection === 'pass' ? -20 : 0,
          transition: { duration: 0.4, ease: "easeInOut" }
        }}
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
        className="cursor-grab active:cursor-grabbing"
      >
        <Card className="border-purple-200 overflow-hidden shadow-xl bg-gradient-to-br from-white to-purple-50">
          <div className="relative">
            {/* Profile Image */}
            <div className="aspect-[3/4] overflow-hidden">
              <img 
                src={photo}
                alt={firstName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60";
                }}
              />
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Profile Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-2xl font-bold">{firstName}, {age}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 opacity-80" />
                    <span className="text-sm opacity-90">San Francisco, CA</span>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  New
                </Badge>
              </div>
              
              {/* Compatibility Score */}
              <div className="mb-4">
                <CompatibilityScore score={match.compatibility_score} />
              </div>
              
              {/* Bio Preview */}
              {profile.bio && (
                <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </Card>
        
        {/* Swipe Indicators */}
        <SwipeIndicators 
          dragX={dragX}
          isVisible={isDragging}
        />
      </motion.div>
      
      {/* Action Buttons */}
      <div className="flex justify-center gap-6 mt-6">
        <Button
          onClick={() => handleSwipe('pass')}
          disabled={isLoading}
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full border-2 border-red-400/60 hover:border-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        
        <Button
          onClick={() => handleSwipe('like')}
          disabled={isLoading}
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg"
        >
          <Heart className="h-6 w-6 fill-current" />
        </Button>
      </div>
    </div>
  );
};

export default SwipeableDailyMatch;