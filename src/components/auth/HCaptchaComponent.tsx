
import React from 'react';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

// This component is now disabled since captcha has been removed from Supabase
const HCaptchaComponent = ({ onVerify, onError }: HCaptchaComponentProps) => {
  // Automatically verify since captcha is disabled
  React.useEffect(() => {
    onVerify('captcha_disabled');
  }, [onVerify]);

  return null;
};

export default HCaptchaComponent;
