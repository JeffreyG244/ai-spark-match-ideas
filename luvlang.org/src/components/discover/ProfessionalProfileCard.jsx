import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Shield, Verified, Clock } from 'lucide-react';
const ProfessionalProfileCard = ({ profile, dragX = 0 }) => {
    const [imageError, setImageError] = useState(false);
    const cardStyle = {
        background: 'var(--love-gradient-card)',
        boxShadow: '0 20px 60px -12px rgba(139, 69, 193, 0.25)',
    };
    const overlayStyle = dragX !== 0 ? {
        background: dragX > 0
            ? `linear-gradient(45deg, rgba(34, 197, 94, ${Math.abs(dragX) / 200}), transparent)`
            : `linear-gradient(45deg, rgba(239, 68, 68, ${Math.abs(dragX) / 200}), transparent)`
    } : {};
    return (<Card className="shadow-2xl border-0 overflow-hidden" style={cardStyle}>
      {/* Swipe Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={overlayStyle}/>
      
      {/* Photo Section with Professional Background Pattern */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, hsl(280 100% 70%) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, hsl(320 100% 75%) 0%, transparent 50%),
              linear-gradient(135deg, transparent 40%, hsl(280 50% 90%) 60%)
            `
        }}/>
        
        <img src={imageError ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop" : profile.photo_urls[0]} alt={`${profile.firstName}`} className="w-full h-full object-cover" onError={() => setImageError(true)}/>
        
        {/* Professional Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
        
        {/* Compatibility Score Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-love-primary fill-current"/>
            <span className="text-sm font-bold text-love-primary">
              {profile.compatibility_score}%
            </span>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="absolute top-4 left-4 bg-emerald-500 rounded-full p-2 shadow-lg">
          <Shield className="h-4 w-4 text-white"/>
        </div>

        {/* Online Status */}
        <div className="absolute top-16 left-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg animate-pulse"/>
          <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
            Online now
          </span>
        </div>
      </div>

      {/* Profile Information */}
      <CardContent className="p-6 space-y-4 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-love-text">
              {profile.firstName}, {profile.age}
            </h2>
            <p className="text-love-text-light flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1"/>
              {profile.location}
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-love-text-light text-sm">
              <Clock className="h-3 w-3 mr-1"/>
              Active recently
            </div>
          </div>
        </div>

        <p className="text-love-text-light text-sm leading-relaxed line-clamp-3">
          {profile.bio || "Professional looking for meaningful connections in the modern dating world."}
        </p>

        {/* Professional Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-love-primary/30 text-love-primary bg-love-primary/5 hover:bg-love-primary/10 transition-colors">
            <Verified className="h-3 w-3 mr-1"/>
            Verified Professional
          </Badge>
          <Badge variant="outline" className="border-love-secondary/30 text-love-secondary bg-love-secondary/5 hover:bg-love-secondary/10 transition-colors">
            ✨ Premium Member
          </Badge>
          <Badge variant="outline" className="border-love-accent/30 text-love-accent bg-love-accent/5 hover:bg-love-accent/10 transition-colors">
            🎯 Career-Focused
          </Badge>
        </div>

        {/* Professional Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-love-primary/10">
          <div className="text-center">
            <div className="text-lg font-bold text-love-primary">98%</div>
            <div className="text-xs text-love-text-light">Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-love-secondary">1.2k</div>
            <div className="text-xs text-love-text-light">Profile Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-love-accent">4.9</div>
            <div className="text-xs text-love-text-light">Member Rating</div>
          </div>
        </div>
      </CardContent>
    </Card>);
};
export default ProfessionalProfileCard;
