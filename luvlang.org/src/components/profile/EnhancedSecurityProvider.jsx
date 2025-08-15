import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
const SecurityContext = createContext(undefined);
export const EnhancedSecurityProvider = ({ children }) => {
    const { user } = useAuth();
    const [isSecure, setIsSecure] = useState(false);
    const [verificationLevel, setVerificationLevel] = useState('none');
    const [lastActivity, setLastActivity] = useState(null);
    const [sessionTimeout] = useState(30 * 60 * 1000); // 30 minutes
    useEffect(() => {
        if (user) {
            // Check verification level
            if (user.email_confirmed_at) {
                setVerificationLevel('email');
                setIsSecure(true);
            }
            // Update last activity
            setLastActivity(new Date());
            // Set up activity tracking
            const updateActivity = () => setLastActivity(new Date());
            // Track user activity
            window.addEventListener('click', updateActivity);
            window.addEventListener('keypress', updateActivity);
            window.addEventListener('scroll', updateActivity);
            return () => {
                window.removeEventListener('click', updateActivity);
                window.removeEventListener('keypress', updateActivity);
                window.removeEventListener('scroll', updateActivity);
            };
        }
    }, [user]);
    // Session timeout check
    useEffect(() => {
        if (lastActivity) {
            const timeoutId = setTimeout(() => {
                const now = new Date();
                const timeSinceActivity = now.getTime() - lastActivity.getTime();
                if (timeSinceActivity > sessionTimeout) {
                    toast({
                        title: 'Session Expired',
                        description: 'Please log in again for security.',
                        variant: 'destructive'
                    });
                    supabase.auth.signOut();
                }
            }, sessionTimeout);
            return () => clearTimeout(timeoutId);
        }
    }, [lastActivity, sessionTimeout]);
    const contextValue = {
        isSecure,
        verificationLevel,
        lastActivity,
        sessionTimeout
    };
    return (<SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>);
};
export const useEnhancedSecurity = () => {
    const context = useContext(SecurityContext);
    if (!context) {
        throw new Error('useEnhancedSecurity must be used within EnhancedSecurityProvider');
    }
    return context;
};
