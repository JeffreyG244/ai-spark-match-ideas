
import React, { useRef, useEffect, useState } from 'react';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

const HCaptchaComponent = ({ onVerify, onError }: HCaptchaComponentProps) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const HCAPTCHA_SITE_KEY = "0ecac0a4-29ec-40a8-b234-9baced509ff8";

  useEffect(() => {
    const checkAndRenderCaptcha = () => {
      if (window.hcaptcha && captchaRef.current && !widgetId) {
        try {
          console.log('Rendering hCaptcha widget...');
          const id = window.hcaptcha.render(captchaRef.current, {
            sitekey: HCAPTCHA_SITE_KEY,
            callback: (token: string) => {
              console.log('hCaptcha verification successful');
              onVerify(token);
            },
            'error-callback': () => {
              console.error('hCaptcha error occurred');
              if (onError) onError();
            },
          });
          setWidgetId(id);
          setIsLoaded(true);
          console.log('hCaptcha widget rendered successfully with ID:', id);
        } catch (error) {
          console.error('Error rendering hCaptcha:', error);
          if (onError) onError();
        }
      }
    };

    // Check if hCaptcha is already loaded
    if (window.hcaptcha) {
      checkAndRenderCaptcha();
    } else {
      // Wait for hCaptcha to load
      const checkInterval = setInterval(() => {
        if (window.hcaptcha) {
          clearInterval(checkInterval);
          checkAndRenderCaptcha();
        }
      }, 100);

      // Cleanup interval after 10 seconds to prevent infinite checking
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        console.error('hCaptcha failed to load within 10 seconds');
        if (onError) onError();
      }, 10000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, [onVerify, onError, widgetId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetId && window.hcaptcha) {
        try {
          window.hcaptcha.reset(widgetId);
        } catch (error) {
          console.error('Error resetting hCaptcha:', error);
        }
      }
    };
  }, [widgetId]);

  return (
    <div className="my-4 flex justify-center">
      <div ref={captchaRef} className="h-captcha" data-sitekey={HCAPTCHA_SITE_KEY}>
        {!isLoaded && (
          <div className="flex items-center justify-center h-20 bg-gray-100 rounded border-2 border-dashed border-gray-300">
            <span className="text-gray-500 text-sm">Loading captcha...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HCaptchaComponent;
