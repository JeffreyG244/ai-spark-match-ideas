import React from 'react';
// This component is now disabled since captcha has been removed from Supabase
const HCaptchaComponent = ({ onVerify, onError }) => {
    // Automatically verify since captcha is disabled
    React.useEffect(() => {
        onVerify('captcha_disabled');
    }, [onVerify]);
    return null;
};
export default HCaptchaComponent;
