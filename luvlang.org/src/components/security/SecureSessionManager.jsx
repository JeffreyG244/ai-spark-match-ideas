import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CriticalSecurityService } from '@/services/security/CriticalSecurityService';
import { SecureConfigService } from '@/services/security/SecureConfigService';
import { toast } from '@/hooks/use-toast';
export const SecureSessionManager = () => {
    const { user, signOut } = useAuth();
    const [sessionStatus, setSessionStatus] = useState({
        isValid: true,
        sessionAge: 0,
        requiresRefresh: false,
        deviceTrusted: true,
        lastCheck: new Date()
    });
    const performSecurityCheck = useCallback(async () => {
        if (!user) {
            setSessionStatus({
                isValid: false,
                sessionAge: 0,
                requiresRefresh: false,
                deviceTrusted: false,
                lastCheck: new Date()
            });
            return;
        }
        try {
            const sessionData = await CriticalSecurityService.validateSecureSession();
            const config = await SecureConfigService.getSessionConfig();
            setSessionStatus({
                isValid: sessionData.isValid,
                sessionAge: sessionData.sessionAge,
                requiresRefresh: sessionData.requiresRefresh,
                deviceTrusted: !!sessionData.deviceFingerprint,
                lastCheck: new Date()
            });
            // Handle session expiration
            if (!sessionData.isValid) {
                toast({
                    title: 'Session Expired',
                    description: 'Your session has expired. Please log in again for security.',
                    variant: 'destructive'
                });
                await signOut();
                return;
            }
            // Handle session refresh requirement
            if (sessionData.requiresRefresh) {
                toast({
                    title: 'Session Expiring Soon',
                    description: 'Your session will expire soon. Please save your work.',
                });
            }
            // Check for suspicious device changes
            if (sessionData.deviceFingerprint) {
                const storedFingerprint = localStorage.getItem(`trusted_device_${user.id}`);
                if (storedFingerprint && storedFingerprint !== sessionData.deviceFingerprint) {
                    toast({
                        title: 'New Device Detected',
                        description: 'Login from a new device detected. If this was not you, please contact support.',
                        variant: 'destructive'
                    });
                }
                else if (!storedFingerprint) {
                    localStorage.setItem(`trusted_device_${user.id}`, sessionData.deviceFingerprint);
                }
            }
        }
        catch (error) {
            console.error('Security check failed:', error);
            setSessionStatus(prev => ({
                ...prev,
                isValid: false,
                lastCheck: new Date()
            }));
        }
    }, [user, signOut]);
    // Activity tracking for session management
    const trackUserActivity = useCallback(() => {
        if (!user)
            return;
        localStorage.setItem(`last_activity_${user.id}`, Date.now().toString());
    }, [user]);
    // Set up session monitoring
    useEffect(() => {
        if (!user)
            return;
        // Initial security check
        performSecurityCheck();
        // Periodic security checks every 5 minutes
        const securityInterval = setInterval(performSecurityCheck, 5 * 60 * 1000);
        // Track user activity
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, trackUserActivity, { passive: true });
        });
        // Check for inactivity
        const inactivityInterval = setInterval(async () => {
            const lastActivity = localStorage.getItem(`last_activity_${user.id}`);
            if (lastActivity) {
                const timeSinceActivity = Date.now() - parseInt(lastActivity);
                const config = await SecureConfigService.getSessionConfig();
                const maxInactivity = config.MAX_AGE_HOURS * 60 * 60 * 1000;
                if (timeSinceActivity > maxInactivity) {
                    toast({
                        title: 'Inactive Session',
                        description: 'You have been logged out due to inactivity.',
                        variant: 'destructive'
                    });
                    await signOut();
                }
            }
        }, 60 * 1000); // Check every minute
        return () => {
            clearInterval(securityInterval);
            clearInterval(inactivityInterval);
            activityEvents.forEach(event => {
                document.removeEventListener(event, trackUserActivity);
            });
        };
    }, [user, performSecurityCheck, trackUserActivity, signOut]);
    // Handle page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                // Perform security check when user returns to tab
                performSecurityCheck();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user, performSecurityCheck]);
    // Handle beforeunload for cleanup
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (user) {
                // Clear sensitive data from memory
                localStorage.removeItem(`session_data_${user.id}`);
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [user]);
    return null; // This is a service component with no UI
};
export default SecureSessionManager;
