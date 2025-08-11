import React from 'react';
import logoImage from '@/assets/luvlang-spaced-logo.png';

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
    sm: 'h-12',
    md: 'h-16', 
    lg: 'h-20'
  };

  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoImage}
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