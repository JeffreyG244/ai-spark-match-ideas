import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, Star, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface EnhancedProfileCardProps {
  profile: UserProfile;
  onLike: () => void;
  onPass: () => void;
  swipeDirection: 'like' | 'pass' | null;
}

const EnhancedProfileCard = ({ profile, onLike, onPass, swipeDirection }: EnhancedProfileCardProps) => {
  return (
    <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm">
      {/* Photo Section */}
      <div className="relative h-96 bg-gradient-to-br from-love-primary/5 to-love-secondary/5">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        <img 
          src={profile.photo_urls[0]}
          alt={`${profile.firstName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop";
          }}
        />
        
        {/* Compatibility Score */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-love-primary fill-current" />
            <span className="text-sm font-bold text-love-primary">
              {profile.compatibility_score}%
            </span>
          </div>
        </div>

        {/* Online Status */}
        <div className="absolute top-4 left-4 bg-green-500 rounded-full w-3 h-3 shadow-lg"></div>
        <div className="absolute top-4 left-8 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
          Online now
        </div>

        {/* Swipe Indicators */}
        {swipeDirection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute inset-0 flex items-center justify-center ${
              swipeDirection === 'like' 
                ? 'bg-green-500/20' 
                : 'bg-red-500/20'
            }`}
          >
            <div className={`text-6xl font-bold ${
              swipeDirection === 'like' 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {swipeDirection === 'like' ? '💚' : '💔'}
            </div>
          </motion.div>
        )}
      </div>

      {/* Profile Info */}
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-love-text">
              {profile.firstName}, {profile.age}
            </h2>
            <p className="text-love-text-light flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {profile.location}
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-love-text-light text-sm">
              <Clock className="h-3 w-3 mr-1" />
              Active 2h ago
            </div>
          </div>
        </div>

        <p className="text-love-text-light text-sm leading-relaxed line-clamp-3">
          {profile.bio}
        </p>

        {/* Professional Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-love-primary/30 text-love-primary bg-love-primary/5">
            ✨ Professional
          </Badge>
          <Badge variant="outline" className="border-love-secondary/30 text-love-secondary bg-love-secondary/5">
            🎯 Career-focused
          </Badge>
          <Badge variant="outline" className="border-love-accent/30 text-love-accent bg-love-accent/5">
            🏆 Verified Profile
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-love-primary">95%</div>
            <div className="text-xs text-love-text-light">Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-love-secondary">2.4k</div>
            <div className="text-xs text-love-text-light">Profile Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-love-accent">4.8</div>
            <div className="text-xs text-love-text-light">Rating</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProfileCard;