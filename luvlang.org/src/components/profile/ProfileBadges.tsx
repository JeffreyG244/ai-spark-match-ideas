import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Crown, Star, Users, Zap, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileBadge {
  id: string;
  badge_type: string;
  earned_at: string;
  expires_at?: string;
}

interface ProfileBadgesProps {
  userId: string;
  className?: string;
}

const ProfileBadges: React.FC<ProfileBadgesProps> = ({ userId, className = '' }) => {
  const [badges, setBadges] = useState<ProfileBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeConfig = (badgeType: string) => {
    switch (badgeType) {
      case 'verified':
        return {
          icon: Shield,
          label: 'Verified',
          description: 'Identity verified member',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          iconColor: 'text-blue-600'
        };
      case 'premium':
        return {
          icon: Crown,
          label: 'Premium',
          description: 'Premium member with exclusive features',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          iconColor: 'text-purple-600'
        };
      case 'early_adopter':
        return {
          icon: Zap,
          label: 'Early Adopter',
          description: 'One of our first members',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'top_rated':
        return {
          icon: Star,
          label: 'Top Rated',
          description: 'Highly rated by the community',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          iconColor: 'text-orange-600'
        };
      case 'active_user':
        return {
          icon: Users,
          label: 'Active User',
          description: 'Active and engaged community member',
          color: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-600'
        };
      default:
        return {
          icon: CheckCircle,
          label: 'Member',
          description: 'Community member',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const activeBadges = badges.filter(badge => !isExpired(badge.expires_at));

  if (loading) {
    return (
      <div className={`flex gap-1 ${className}`}>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (activeBadges.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={`flex gap-1 flex-wrap ${className}`}>
        {activeBadges.map((badge) => {
          const config = getBadgeConfig(badge.badge_type);
          const IconComponent = config.icon;

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Badge 
                  variant="secondary" 
                  className={`${config.color} flex items-center gap-1 text-xs font-medium border`}
                >
                  <IconComponent className={`h-3 w-3 ${config.iconColor}`} />
                  <span className="hidden sm:inline">{config.label}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-semibold">{config.label}</p>
                  <p className="text-sm">{config.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                  {badge.expires_at && (
                    <p className="text-xs text-gray-500">
                      Expires {new Date(badge.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default ProfileBadges;