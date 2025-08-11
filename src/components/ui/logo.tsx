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
    sm: 'h-8',
    md: 'h-10', 
    lg: 'h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/lovable-uploads/f5d073a5-8ed2-4f0a-be2f-30f2bc9622da.png"
        alt="Luvlang Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <h2 className={`${textSizeClasses[size]} font-semibold text-gray-900 dark:text-white tracking-tight`}>
          Luvlang
        </h2>
      )}
    </div>
  );
};

export default Logo;