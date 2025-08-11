import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Star, Briefcase } from 'lucide-react';

interface MembershipBadgeProps {
  membershipLevel: 'basic' | 'premium' | 'executive' | 'c_suite';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const MembershipBadge: React.FC<MembershipBadgeProps> = ({ 
  membershipLevel, 
  className = '',
  size = 'md'
}) => {
  const getBadgeConfig = () => {
    switch (membershipLevel) {
      case 'basic':
        return {
          text: 'Basic Verified',
          icon: Shield,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
          iconColor: 'text-red-600'
        };
      case 'premium':
        return {
          text: 'Standard Verified',
          icon: Crown,
          className: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
          iconColor: 'text-purple-600'
        };
      case 'executive':
        return {
          text: 'Executive Verified',
          icon: Briefcase,
          className: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200',
          iconColor: 'text-slate-600'
        };
      case 'c_suite':
        return {
          text: 'C-Suite Premium Verified',
          icon: Star,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          text: 'Verified',
          icon: Shield,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <Badge 
      variant="outline" 
      className={`
        ${config.className} 
        ${sizeClasses[size]} 
        flex items-center gap-2 font-semibold shadow-sm
        ${className}
      `}
    >
      <IconComponent className={`${iconSizes[size]} ${config.iconColor}`} />
      {config.text}
    </Badge>
  );
};

export default MembershipBadge;