import React, { useState, useEffect } from 'react';
import { X, Heart, Mail, Crown, Shield, Calendar, AlertCircle, CheckCircle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AlertBannerProps {
  type: 'welcome' | 'message' | 'match' | 'meeting' | 'success' | 'warning' | 'premium' | 'verification';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
  showBadge?: boolean;
  badgeText?: string;
}

const AlertBanner = ({
  type,
  title,
  message,
  actionText,
  onAction,
  onDismiss,
  autoHide = false,
  duration = 5000,
  showBadge = false,
  badgeText
}: AlertBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'welcome':
        return {
          icon: <Shield className="w-5 h-5" />,
          bgGradient: 'from-emerald-500/20 to-teal-500/20',
          borderColor: 'border-emerald-500/30',
          iconColor: 'text-emerald-400',
          textColor: 'text-emerald-100'
        };
      case 'message':
        return {
          icon: <Mail className="w-5 h-5" />,
          bgGradient: 'from-blue-500/20 to-cyan-500/20',
          borderColor: 'border-blue-500/30',
          iconColor: 'text-blue-400',
          textColor: 'text-blue-100'
        };
      case 'match':
        return {
          icon: <Heart className="w-5 h-5" />,
          bgGradient: 'from-pink-500/20 to-rose-500/20',
          borderColor: 'border-pink-500/30',
          iconColor: 'text-pink-400',
          textColor: 'text-pink-100'
        };
      case 'meeting':
        return {
          icon: <Calendar className="w-5 h-5" />,
          bgGradient: 'from-indigo-500/20 to-purple-500/20',
          borderColor: 'border-indigo-500/30',
          iconColor: 'text-indigo-400',
          textColor: 'text-indigo-100'
        };
      case 'premium':
        return {
          icon: <Crown className="w-5 h-5" />,
          bgGradient: 'from-yellow-500/20 to-orange-500/20',
          borderColor: 'border-yellow-500/30',
          iconColor: 'text-yellow-400',
          textColor: 'text-yellow-100'
        };
      case 'verification':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgGradient: 'from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-500/30',
          iconColor: 'text-green-400',
          textColor: 'text-green-100'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgGradient: 'from-green-500/20 to-emerald-500/20',
          borderColor: 'border-green-500/30',
          iconColor: 'text-green-400',
          textColor: 'text-green-100'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgGradient: 'from-amber-500/20 to-yellow-500/20',
          borderColor: 'border-amber-500/30',
          iconColor: 'text-amber-400',
          textColor: 'text-amber-100'
        };
      default:
        return {
          icon: <Gift className="w-5 h-5" />,
          bgGradient: 'from-purple-500/20 to-violet-500/20',
          borderColor: 'border-purple-500/30',
          iconColor: 'text-purple-400',
          textColor: 'text-purple-100'
        };
    }
  };

  const config = getTypeConfig();

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-auto
      transition-all duration-300 ease-out
      ${isAnimating ? 'animate-fade-in translate-y-0 opacity-100' : 'animate-fade-out -translate-y-2 opacity-0'}
    `}>
      <div className={`
        bg-gradient-to-r ${config.bgGradient} backdrop-blur-xl 
        border ${config.borderColor} rounded-2xl shadow-2xl
        transform transition-all duration-300 hover:scale-[1.02]
      `}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-xl 
              bg-gradient-to-br from-slate-800/50 to-slate-900/50 
              border border-slate-700/50 flex items-center justify-center
              ${config.iconColor}
            `}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-semibold text-white text-sm`}>
                  {title}
                </h4>
                {showBadge && badgeText && (
                  <Badge 
                    variant="secondary" 
                    className={`${config.iconColor} border-current/30 bg-current/10 text-xs`}
                  >
                    {badgeText}
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${config.textColor} leading-relaxed`}>
                {message}
              </p>

              {/* Action Buttons */}
              {(actionText || onDismiss) && (
                <div className="flex items-center gap-2 mt-3">
                  {actionText && onAction && (
                    <Button
                      size="sm"
                      onClick={onAction}
                      className={`
                        ${config.iconColor} border-current/30 bg-current/10 hover:bg-current/20
                        text-xs px-3 py-1 h-auto font-medium
                      `}
                      variant="outline"
                    >
                      {actionText}
                    </Button>
                  )}
                  {onDismiss && (
                    <Button
                      size="sm"
                      onClick={handleDismiss}
                      variant="ghost"
                      className="text-gray-400 hover:text-white p-1 h-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Animated Progress Bar for Auto-hide */}
        {autoHide && (
          <div className="h-1 bg-slate-800/30 rounded-b-2xl overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${config.bgGradient.replace('/20', '/50')} rounded-b-2xl`}
              style={{
                animation: `progressBar ${duration}ms linear forwards`,
                transformOrigin: 'left',
                width: '100%'
              }}
            />
          </div>
        )}
      </div>

      {/* CSS Animation for Progress Bar */}
      <style>{`
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default AlertBanner;