
import React, { useRef, useEffect } from 'react';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

const HCaptchaComponent = ({ onVerify, onError }: HCaptchaComponentProps) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const HCAPTCHA_SITE_KEY = "0ecac0a4-29ec-40a8-b234-9baced509ff8";

  useEffect(() => {
    // Wait for hCaptcha to load
    const checkHCaptcha = () => {
      if (window.hcaptcha && captchaRef.current) {
        try {
          window.hcaptcha.render(captchaRef.current, {
            sitekey: HCAPTCHA_SITE_KEY,
            callback: onVerify,
            'error-callback': onError || (() => {
              console.error('hCaptcha error occurred');
            }),
          });
        } catch (error) {
          console.error('Error rendering hCaptcha:', error);
          if (onError) onError();
        }
      } else {
        // Retry after a short delay
        setTimeout(checkHCaptcha, 100);
      }
    };

    checkHCaptcha();
  }, [onVerify, onError]);

  return (
    <div className="my-4 flex justify-center">
      <div ref={captchaRef} className="h-captcha" data-sitekey={HCAPTCHA_SITE_KEY}></div>
    </div>
  );
};

export default HCaptchaComponent;
