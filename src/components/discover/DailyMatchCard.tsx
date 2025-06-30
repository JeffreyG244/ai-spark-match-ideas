
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
      name: string;
      email: string;
      bio: string | null;
      values: string | null;
      interests: string[] | null;
      photos: string[] | null;
    };
  };
  onView: (matchId: string) => void;
}

const DailyMatchCard = ({ match, onView }: DailyMatchCardProps) => {
  const profile = match.user_profile;
  if (!profile) return null;

  const firstName = profile.name || profile.email.split('@')[0] || 'User';
  const photo = profile.photos && profile.photos.length > 0 
    ? profile.photos[0] 
    : 'https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60';

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
              src={photo}
              alt={firstName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60";
              }}
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
            {Math.floor(Math.random() * 20) + 20} years
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
          {profile.bio || 'No bio available'}
        </p>
        
        {profile.interests && profile.interests.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Interests</h4>
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 3).map((interest, i) => (
                <Badge key={i} variant="outline" className="text-xs border-purple-300 text-purple-700">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 3 && (
                <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                  +{profile.interests.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
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
