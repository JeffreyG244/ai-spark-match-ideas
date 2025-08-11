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
    lg: 'h-32'
  };

  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-6xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Heart-shaped background */}
        <div className={`${sizeClasses[size]} aspect-square relative`}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm"
               style={{
                 clipPath: 'polygon(50% 85%, 85% 50%, 85% 30%, 70% 15%, 50% 15%, 30% 15%, 15% 30%, 15% 50%)'
               }}>
          </div>
          <div className="absolute inset-2 bg-black/90 rounded-2xl flex items-center justify-center">
            <img 
              src={logoImage}
              alt="Luvlang Logo"
              className={`${sizeClasses[size]} object-contain`}
            />
          </div>
        </div>
      </div>
      {showText && (
        <h2 className={`${textSizeClasses[size]} font-semibold text-gray-900 dark:text-white tracking-tight`}>
          Luvlang
        </h2>
      )}
    </div>
  );
};

export default Logo;