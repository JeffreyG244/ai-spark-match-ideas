import React from 'react';
import { Heart } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-love-primary/80 to-love-secondary/80 rounded-2xl flex items-center justify-center shadow-sm border border-love-primary/20`}>
        <Heart className={`${iconSizes[size]} text-white fill-white`} />
      </div>
      {showText && (
        <h2 className={`${textSizeClasses[size]} font-semibold bg-gradient-to-r from-love-primary to-love-secondary bg-clip-text text-transparent tracking-tight`}>
          Luvlang
        </h2>
      )}
    </div>
  );
};

export default Logo;