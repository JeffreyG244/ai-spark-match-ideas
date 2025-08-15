import React, { useState } from 'react';
import AuthFormContainer from './AuthFormContainer';
import AuthStepController from './AuthStepController';
const SecureAuthForm = () => {
    const [currentStep, setCurrentStep] = useState('auth');
    if (currentStep === 'profile') {
        return (<AuthStepController onBackToAuth={() => setCurrentStep('auth')}/>);
    }
    return (<AuthFormContainer onProfileStepChange={setCurrentStep}/>);
};
export default SecureAuthForm;
