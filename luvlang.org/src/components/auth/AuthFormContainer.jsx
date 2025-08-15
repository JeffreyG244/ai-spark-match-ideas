import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { useAuthentication } from '@/hooks/useAuthentication';
import { toast } from '@/hooks/use-toast';
import AuthFormHeader from './AuthFormHeader';
import AuthFormFields from './AuthFormFields';
import ForgotPasswordForm from './ForgotPasswordForm';
const AuthFormContainer = ({ onProfileStepChange }) => {
    const { validateInput, validatePassword } = useEnhancedSecurity();
    const { signUp, signIn, resendConfirmationEmail, loading, error } = useAuthentication();
    const [currentView, setCurrentView] = useState('auth');
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordValidation, setPasswordValidation] = useState({
        isValid: false,
        errors: [],
        score: 0,
        suggestions: []
    });
    const handlePasswordChange = (password) => {
        setFormData(prev => ({ ...prev, password }));
        const validation = validatePassword(password);
        setPasswordValidation({
            isValid: validation.isValid,
            errors: validation.errors || [],
            score: validation.score || validation.securityScore || 0,
            suggestions: validation.suggestions || []
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate email
            const emailValidation = validateInput(formData.email, {
                required: true,
                maxLength: 254
            });
            if (!emailValidation.isValid) {
                toast({
                    title: 'Invalid Email',
                    description: emailValidation.errors.join(', '),
                    variant: 'destructive'
                });
                return;
            }
            if (isLogin) {
                await signIn(formData.email, formData.password);
            }
            else {
                // For registration, validate password
                if (!passwordValidation.isValid) {
                    toast({
                        title: 'Weak Password',
                        description: 'Please choose a stronger password.',
                        variant: 'destructive'
                    });
                    return;
                }
                if (formData.password !== formData.confirmPassword) {
                    toast({
                        title: 'Password Mismatch',
                        description: 'Passwords do not match.',
                        variant: 'destructive'
                    });
                    return;
                }
                // Extract first and last name from email as fallback
                const emailParts = formData.email.split('@')[0];
                const firstName = emailParts.split('.')[0] || 'User';
                const lastName = emailParts.split('.')[1] || 'Name';
                // No captcha token needed since it's disabled
                await signUp(formData.email, formData.password, formData.confirmPassword, firstName, lastName);
                onProfileStepChange('profile');
            }
        }
        catch (error) {
            console.error('Auth error:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred.',
                variant: 'destructive'
            });
        }
    };
    const handleForgotPassword = () => {
        setCurrentView('forgot-password');
    };
    const handleBackToAuth = () => {
        setCurrentView('auth');
    };
    const handleResendConfirmation = async (email) => {
        await resendConfirmationEmail(email);
    };
    if (currentView === 'forgot-password') {
        return <ForgotPasswordForm onBackToAuth={handleBackToAuth}/>;
    }
    return (<Card className="w-full max-w-md mx-auto">
      <AuthFormHeader />
      <CardContent>
        <AuthFormFields isLogin={isLogin} formData={formData} passwordValidation={passwordValidation} loading={loading} onFormDataChange={setFormData} onPasswordChange={handlePasswordChange} onSubmit={handleSubmit} onToggleMode={() => setIsLogin(!isLogin)} onForgotPassword={handleForgotPassword} onResendConfirmation={handleResendConfirmation}/>
        {error && (<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>)}
      </CardContent>
    </Card>);
};
export default AuthFormContainer;
