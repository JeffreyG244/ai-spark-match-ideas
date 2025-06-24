
import React, { useRef, useEffect, useState } from 'react';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

const HCaptchaComponent = ({ onVerify, onError }: HCaptchaComponentProps) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const HCAPTCHA_SITE_KEY = "0ecac0a4-29ec-40a8-b234-9baced509ff8";

  useEffect(() => {
    const renderCaptcha = () => {
      if (window.hcaptcha && captchaRef.current && !isRendered) {
        try {
          console.log('Rendering hCaptcha widget...');
          const id = window.hcaptcha.render(captchaRef.current, {
            sitekey: HCAPTCHA_SITE_KEY,
            callback: (token: string) => {
              console.log('hCaptcha verification successful, token:', token.substring(0, 20) + '...');
              setIsLoaded(true);
              onVerify(token);
            },
            'error-callback': () => {
              console.error('hCaptcha error occurred');
              setIsLoaded(false);
              if (onError) onError();
            },
          });
          setWidgetId(id);
          setIsRendered(true);
          console.log('hCaptcha widget rendered successfully with ID:', id);
        } catch (error) {
          console.error('Error rendering hCaptcha:', error);
          if (onError) onError();
        }
      }
    };

    // Check if hCaptcha is already loaded
    if (window.hcaptcha) {
      renderCaptcha();
    } else {
      // Wait for hCaptcha to load with a more robust approach
      const checkForHCaptcha = () => {
        if (window.hcaptcha) {
          renderCaptcha();
        } else {
          setTimeout(checkForHCaptcha, 100);
        }
      };
      checkForHCaptcha();
    }

    // Cleanup function
    return () => {
      if (widgetId && window.hcaptcha && isRendered) {
        try {
          window.hcaptcha.reset(widgetId);
        } catch (error) {
          console.error('Error resetting hCaptcha:', error);
        }
      }
    };
  }, [onVerify, onError, isRendered]);

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
