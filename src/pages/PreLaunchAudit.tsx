
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import PreLaunchDashboard from '@/components/admin/PreLaunchDashboard';
import SystemIntegrationTest from '@/components/admin/SystemIntegrationTest';
import PreLaunchSecurityAuditComponent from '@/components/admin/PreLaunchSecurityAudit';
import ProductionChecklist from '@/components/admin/ProductionChecklist';
import ProfileManager from '@/components/admin/ProfileManager';
import N8NSystemCheck from '@/components/admin/N8NSystemCheck';
import ComprehensiveSystemDiagnostic from '@/components/admin/ComprehensiveSystemDiagnostic';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PreLaunchAudit = () => {
  const { user } = useAuth();

  // For now, require authentication to access audit
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="space-y-8">
          <ComprehensiveSystemDiagnostic />
          <N8NSystemCheck />
          <ProductionChecklist />
          <ProfileManager />
          <PreLaunchSecurityAuditComponent />
          <SystemIntegrationTest />
          <PreLaunchDashboard />
        </div>
      </div>
    </div>
  );
};

export default PreLaunchAudit;
