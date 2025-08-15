import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Shield, Database, Globe, Lock, Zap, Github, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PreLaunchSecurityAudit } from '@/services/security/PreLaunchSecurityAudit';

interface AuditResult {
  category: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  recommendation?: string;
}

interface PerformanceResult {
  metric: string;
  value: number;
  threshold: number;
  status: 'good' | 'needs_improvement' | 'poor';
  recommendation?: string;
}

interface IntegrationResult {
  name: string;
  status: 'connected' | 'warning' | 'failed';
  message: string;
  details?: any;
}

const PreLaunchSecurityAuditComponent = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [securityResults, setSecurityResults] = useState<AuditResult[]>([]);
  const [performanceResults, setPerformanceResults] = useState<PerformanceResult[]>([]);
  const [integrationResults, setIntegrationResults] = useState<IntegrationResult[]>([]);
  const [complianceResults, setComplianceResults] = useState<AuditResult[]>([]);

  const runCompleteAudit = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to run the security audit',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);
    
    try {
      // Run all audits in parallel
      const [security, performance, compliance, integrations] = await Promise.all([
        PreLaunchSecurityAudit.runCompleteSecurityAudit(),
        PreLaunchSecurityAudit.runPerformanceAudit(),
        PreLaunchSecurityAudit.runComplianceAudit(),
        runIntegrationTests()
      ]);

      setSecurityResults(security);
      setPerformanceResults(performance);
      setComplianceResults(compliance);
      setIntegrationResults(integrations);

      toast({
        title: 'Pre-Launch Audit Complete',
        description: 'All security, performance, and integration checks have been completed',
      });
    } catch (error) {
      console.error('Error running audit:', error);
      toast({
        title: 'Audit Failed',
        description: 'An error occurred while running the audit',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runIntegrationTests = async (): Promise<IntegrationResult[]> => {
    const results: IntegrationResult[] = [];

    // Test Supabase connection
    try {
      const { data, error } = await supabase.from('dating_profiles').select('count', { count: 'exact', head: true });
      results.push({
        name: 'Supabase Database',
        status: error ? 'failed' : 'connected',
        message: error ? `Connection failed: ${error.message}` : 'Database connection successful',
        details: data
      });
    } catch (error: any) {
      results.push({
        name: 'Supabase Database',
        status: 'failed',
        message: `Connection error: ${error.message}`,
      });
    }

    // Test authentication
    try {
      const { data: session } = await supabase.auth.getSession();
      results.push({
        name: 'Supabase Auth',
        status: session?.session ? 'connected' : 'warning',
        message: session?.session ? 'Authentication working' : 'No active session',
      });
    } catch (error: any) {
      results.push({
        name: 'Supabase Auth',
        status: 'failed',
        message: `Auth error: ${error.message}`,
      });
    }

    // Test N8N webhook (if accessible)
    try {
      const webhookUrl = 'http://localhost:5678/webhook/010d0476-0e1c-4d10-bab7-955a933d1ca1';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      });
      
      results.push({
        name: 'N8N Workflow',
        status: response.ok ? 'connected' : 'warning',
        message: response.ok ? 'N8N webhook responding' : `N8N returned status: ${response.status}`,
      });
    } catch (error: any) {
      results.push({
        name: 'N8N Workflow',
        status: 'failed',
        message: `N8N not accessible: ${error.message}`,
      });
    }

    // Test profile webhook edge function
    try {
      const { data, error } = await supabase.functions.invoke('profile-webhook', {
        body: { user_id: user?.id, event_type: 'audit_test' }
      });
      
      results.push({
        name: 'Profile Webhook Function',
        status: error ? 'failed' : 'connected',
        message: error ? `Function error: ${error.message}` : 'Edge function responding',
        details: data
      });
    } catch (error: any) {
      results.push({
        name: 'Profile Webhook Function',
        status: 'failed',
        message: `Function error: ${error.message}`,
      });
    }

    // Test core tables schema
    try {
      const { data: profilesData, error: profilesError } = await supabase.from('dating_profiles').select('*').limit(1);
      results.push({
        name: 'dating_profiles Table',
        status: profilesError ? 'failed' : 'connected',
        message: profilesError ? `Schema error: ${profilesError.message}` : 'Table schema valid',
      });
    } catch (error: any) {
      results.push({
        name: 'dating_profiles Table',
        status: 'failed',
        message: `Table error: ${error.message}`,
      });
    }

    try {
      const { data: matchesData, error: matchesError } = await supabase.from('daily_matches').select('*').limit(1);
      results.push({
        name: 'daily_matches Table',
        status: matchesError ? 'failed' : 'connected',
        message: matchesError ? `Schema error: ${matchesError.message}` : 'Table schema valid',
      });
    } catch (error: any) {
      results.push({
        name: 'daily_matches Table',
        status: 'failed',
        message: `Table error: ${error.message}`,
      });
    }

    try {
      const { data: compatData, error: compatError } = await supabase.from('compatibility_answers').select('*').limit(1);
      results.push({
        name: 'compatibility_answers Table',
        status: compatError ? 'failed' : 'connected',
        message: compatError ? `Schema error: ${compatError.message}` : 'Table schema valid',
      });
    } catch (error: any) {
      results.push({
        name: 'compatibility_answers Table',
        status: 'failed',
        message: `Table error: ${error.message}`,
      });
    }

    return results;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'connected':
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
      case 'needs_improvement':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'fail':
      case 'failed':
      case 'poor':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pass: 'bg-green-100 text-green-800',
      connected: 'bg-green-100 text-green-800',
      good: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      needs_improvement: 'bg-yellow-100 text-yellow-800',
      fail: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      poor: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getCriticalIssues = () => {
    const critical = [
      ...securityResults.filter(r => r.status === 'fail'),
      ...integrationResults.filter(r => r.status === 'failed'),
      ...complianceResults.filter(r => r.status === 'fail'),
      ...performanceResults.filter(r => r.status === 'poor')
    ];
    return critical;
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            Pre-Launch Security & Readiness Audit
          </CardTitle>
          <p className="text-sm text-gray-600">
            Comprehensive security, performance, and integration testing for production readiness
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runCompleteAudit}
            disabled={isRunning || !user}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full mb-6"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Complete Audit...
              </>
            ) : (
              'Run Complete Pre-Launch Audit'
            )}
          </Button>

          {/* Critical Issues Alert */}
          {getCriticalIssues().length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>⚠️ CRITICAL ISSUES FOUND:</strong> {getCriticalIssues().length} critical issues must be resolved before launch.
              </AlertDescription>
            </Alert>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Results */}
            {securityResults.length > 0 && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lock className="h-5 w-5 text-blue-600" />
                    Security Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {securityResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{result.category}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-xs text-gray-600">{result.message}</p>
                        {result.recommendation && (
                          <p className="text-xs text-blue-600 mt-1">💡 {result.recommendation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Integration Results */}
            {integrationResults.length > 0 && (
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5 text-green-600" />
                    System Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {integrationResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{result.name}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-xs text-gray-600">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Performance Results */}
            {performanceResults.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {performanceResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{result.metric}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-xs text-gray-600">
                          {result.value} / {result.threshold} threshold
                        </p>
                        {result.recommendation && (
                          <p className="text-xs text-orange-600 mt-1">⚡ {result.recommendation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Compliance Results */}
            {complianceResults.length > 0 && (
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5 text-purple-600" />
                    Compliance & Legal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {complianceResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{result.category}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-xs text-gray-600">{result.message}</p>
                        {result.recommendation && (
                          <p className="text-xs text-purple-600 mt-1">📋 {result.recommendation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Launch Readiness Summary */}
          {(securityResults.length > 0 || integrationResults.length > 0) && (
            <Card className="mt-6 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-gray-600" />
                  Launch Readiness Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {[...securityResults, ...integrationResults, ...complianceResults].filter(r => r.status === 'pass' || r.status === 'connected').length}
                    </div>
                    <div className="text-sm text-green-700">Passed</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {[...securityResults, ...integrationResults, ...complianceResults].filter(r => r.status === 'warning').length}
                    </div>
                    <div className="text-sm text-yellow-700">Warnings</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {getCriticalIssues().length}
                    </div>
                    <div className="text-sm text-red-700">Critical</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {performanceResults.filter(r => r.status === 'good').length}/{performanceResults.length}
                    </div>
                    <div className="text-sm text-blue-700">Performance</div>
                  </div>
                </div>
                
                {getCriticalIssues().length === 0 && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      🚀 <strong>READY FOR LAUNCH!</strong> All critical systems are operational and secure.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreLaunchSecurityAuditComponent;