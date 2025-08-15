import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { checkUserRole } from '@/utils/enhancedSecurity';
import { isProductionEnvironment } from '@/utils/security';
const AdminGuard = ({ children, requireProduction = true, requiredRole = 'admin' }) => {
    const { user } = useAuth();
    const [hasRequiredRole, setHasRequiredRole] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        checkUserPermissions();
    }, [user, requiredRole]);
    const checkUserPermissions = async () => {
        if (!user) {
            setHasRequiredRole(false);
            setLoading(false);
            return;
        }
        try {
            const roleCheck = await checkUserRole(requiredRole);
            setHasRequiredRole(roleCheck);
        }
        catch (error) {
            console.error('Error checking user role:', error);
            setHasRequiredRole(false);
        }
        finally {
            setLoading(false);
        }
    };
    // Check if user is authenticated
    if (!user) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4"/>
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access this administrative feature.
          </AlertDescription>
        </Alert>
      </div>);
    }
    // Show loading state
    if (loading) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span>Checking permissions...</span>
        </div>
      </div>);
    }
    // Check if user has required role
    if (!hasRequiredRole) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4"/>
          <AlertTitle>Insufficient Permissions</AlertTitle>
          <AlertDescription>
            You need {requiredRole} privileges to access this feature. 
            Please contact an administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>);
    }
    // Check if in production environment (for sensitive admin functions)
    if (requireProduction && isProductionEnvironment()) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4"/>
          <AlertTitle>Production Environment Detected</AlertTitle>
          <AlertDescription>
            This administrative feature is disabled in production environments for security reasons.
            Access this feature only in development or staging environments.
          </AlertDescription>
        </Alert>
      </div>);
    }
    // All checks passed, render children
    return <>{children}</>;
};
export default AdminGuard;
