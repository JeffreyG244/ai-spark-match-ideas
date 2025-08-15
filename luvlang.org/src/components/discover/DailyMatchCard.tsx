
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, Star } from 'lucide-react';
import CompatibilityScore from './CompatibilityScore';

interface DailyMatchCardProps {
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
  onView: (matchId: string) => void;
}

const DailyMatchCard = ({ match, onView }: DailyMatchCardProps) => {
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

  const handleCardClick = () => {
    onView(match.id);
  };

  return (
    <Card 
      className="border-purple-200 hover:border-purple-300 transition-all duration-300 cursor-pointer hover:shadow-lg"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden">
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
        
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
          {profile.bio || `Hi! I'm ${firstName}, nice to meet you. Looking forward to connecting with someone special.`}
        </p>
        
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center gap-1 text-purple-600">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Tap to view full profile</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyMatchCard;
