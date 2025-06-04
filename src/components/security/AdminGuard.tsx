
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { isProductionEnvironment } from '@/utils/securityEnhancements';

interface AdminGuardProps {
  children: React.ReactNode;
  requireProduction?: boolean;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ 
  children, 
  requireProduction = true 
}) => {
  const { user } = useAuth();

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access this administrative feature.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if in production environment (for sensitive admin functions)
  if (requireProduction && isProductionEnvironment()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertTitle>Production Environment Detected</AlertTitle>
          <AlertDescription>
            This administrative feature is disabled in production environments for security reasons.
            Access this feature only in development or staging environments.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // For now, allow access if authenticated (would need proper role checking in production)
  return <>{children}</>;
};

export default AdminGuard;
