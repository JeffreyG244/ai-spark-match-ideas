
import React, { useRef, useEffect } from 'react';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

const HCaptchaComponent = ({ onVerify, onError }: HCaptchaComponentProps) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const HCAPTCHA_SITE_KEY = "0ecac0a4-29ec-40a8-b234-9baced509ff8";

  useEffect(() => {
    if (window.hcaptcha && captchaRef.current) {
      window.hcaptcha.render(captchaRef.current, {
        sitekey: HCAPTCHA_SITE_KEY,
        callback: onVerify,
        'error-callback': onError || (() => {}),
      });
    }
  }, [onVerify, onError]);

  return (
    <div className="my-4">
      <div ref={captchaRef} className="h-captcha" data-sitekey={HCAPTCHA_SITE_KEY}></div>
    </div>
  );
};

export default HCaptchaComponent;
