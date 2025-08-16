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
          text: 'Basic',
          icon: Shield,
          className: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border-emerald-300 hover:from-emerald-100 hover:to-teal-100 shadow-lg shadow-emerald-500/20',
          iconColor: 'text-emerald-600'
        };
      case 'premium':
        return {
          text: 'Standard',
          icon: Crown,
          className: 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-800 border-purple-300 hover:from-purple-100 hover:to-indigo-100 shadow-lg shadow-purple-500/20',
          iconColor: 'text-purple-600'
        };
      case 'executive':
        return {
          text: 'Executive',
          icon: Briefcase,
          className: 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-800 border-slate-400 hover:from-slate-100 hover:to-gray-100 shadow-lg shadow-slate-500/20',
          iconColor: 'text-slate-600'
        };
      case 'c_suite':
        return {
          text: 'C-Suite',
          icon: Star,
          className: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-400 hover:from-amber-100 hover:to-yellow-100 shadow-lg shadow-amber-500/20',
          iconColor: 'text-amber-600'
        };
      default:
        return {
          text: 'Basic',
          icon: Shield,
          className: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-300 shadow-lg shadow-gray-500/20',
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
        flex items-center gap-2 font-semibold transition-all duration-300 hover:scale-105
        backdrop-blur-sm border-2
        ${className}
      `}
    >
      <IconComponent className={`${iconSizes[size]} ${config.iconColor}`} />
      {config.text}
    </Badge>
  );
};

export default MembershipBadge;