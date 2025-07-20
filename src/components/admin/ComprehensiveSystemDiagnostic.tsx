import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Shield, Database, Globe, User } from 'lucide-react';

interface DiagnosticResult {
  category: string;
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
  data?: any;
}

const ComprehensiveSystemDiagnostic = () => {
  const { user, session } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('jeffreytgravescas@gmail.com');

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // 1. Authentication Tests
      diagnosticResults.push({
        category: 'Authentication',
        name: 'User Session',
        status: user ? 'success' : 'error',
        message: user ? `User authenticated: ${user.email}` : 'No user session found',
        data: { userId: user?.id, email: user?.email }
      });

      diagnosticResults.push({
        category: 'Authentication',
        name: 'Session Token',
        status: session ? 'success' : 'error',
        message: session ? 'Valid session token present' : 'No session token',
        data: { hasAccessToken: !!session?.access_token }
      });

      // 2. Database Connection Tests
      try {
        const { data: connectionTest, error: connectionError } = await supabase
          .from('dating_profiles')
          .select('count')
          .limit(1);

        diagnosticResults.push({
          category: 'Database',
          name: 'Connection Test',
          status: connectionError ? 'error' : 'success',
          message: connectionError ? 'Database connection failed' : 'Database connection successful',
          details: connectionError?.message
        });
      } catch (dbError: any) {
        diagnosticResults.push({
          category: 'Database',
          name: 'Connection Test',
          status: 'error',
          message: 'Database connection failed',
          details: dbError.message
        });
      }

      // 3. User Profile Tests
      if (user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('dating_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          diagnosticResults.push({
            category: 'User Data',
            name: 'Profile Exists',
            status: profileError ? 'warning' : 'success',
            message: profileError ? 'No profile found for user' : 'User profile found',
            details: profileError?.message,
            data: profile ? { hasProfile: true, profileComplete: !!profile.bio } : null
          });
        } catch (profileError: any) {
          diagnosticResults.push({
            category: 'User Data',
            name: 'Profile Exists',
            status: 'error',
            message: 'Error checking user profile',
            details: profileError.message
          });
        }
      }

      // 4. Authentication System Tests
      try {
        const { data: authUsers, error: authError } = await supabase
          .from('dating_profiles')
          .select('user_id')
          .limit(5);

        diagnosticResults.push({
          category: 'Authentication',
          name: 'Auth System Health',
          status: authError ? 'error' : 'success',
          message: authError ? 'Auth system issues detected' : 'Auth system operational',
          details: authError?.message,
          data: { userCount: authUsers?.length }
        });
      } catch (authError: any) {
        diagnosticResults.push({
          category: 'Authentication',
          name: 'Auth System Health',
          status: 'error',
          message: 'Auth system check failed',
          details: authError.message
        });
      }

      // 5. N8N Integration Test
      try {
        const webhookUrl = 'https://luvlang.app.n8n.cloud/webhook-test/1c19d72c-85ea-4e4c-901b-2b09013bc4d6';
        const testPayload = {
          test: true,
          timestamp: new Date().toISOString(),
          user_id: user?.id,
          diagnostic: true
        };

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testPayload)
        });

        // Try to log the webhook attempt
        if (user) {
          try {
            await supabase.from('n8n_webhook_logs').insert({
              user_id: user.id,
              webhook_url: webhookUrl,
              payload: testPayload,
              response_status: response.status,
              response_body: response.ok ? 'Diagnostic test successful' : 'Diagnostic test failed',
              success: response.ok
            });
          } catch (logError) {
            console.warn('Could not log webhook attempt:', logError);
          }
        }

        diagnosticResults.push({
          category: 'N8N Integration',
          name: 'Webhook Connectivity',
          status: response.ok ? 'success' : 'warning',
          message: response.ok ? 'N8N webhook accessible' : `N8N webhook returned ${response.status}`,
          data: { status: response.status, responseOk: response.ok }
        });
      } catch (webhookError: any) {
        diagnosticResults.push({
          category: 'N8N Integration',
          name: 'Webhook Connectivity',
          status: 'error',
          message: 'N8N webhook unreachable',
          details: webhookError.message
        });
      }

      // 6. User Lookup Test (if email provided)
      if (testEmail) {
        try {
          const { data: userData, error: lookupError } = await supabase
            .from('dating_profiles')
            .select('user_id, email, first_name, last_name')
            .eq('email', testEmail)
            .single();

          diagnosticResults.push({
            category: 'User Data',
            name: 'User Lookup Test',
            status: lookupError ? 'warning' : 'success',
            message: lookupError ? `No user found with email ${testEmail}` : `User found: ${testEmail}`,
            details: lookupError?.message,
            data: userData
          });
        } catch (lookupError: any) {
          diagnosticResults.push({
            category: 'User Data',
            name: 'User Lookup Test',
            status: 'error',
            message: 'User lookup failed',
            details: lookupError.message
          });
        }
      }

      // 7. Edge Function Test
      try {
        const { data: funcData, error: funcError } = await supabase.functions.invoke('send-password-reset', {
          body: { email: 'test@example.com', dry_run: true }
        });

        diagnosticResults.push({
          category: 'Edge Functions',
          name: 'Function Accessibility',
          status: funcError ? 'warning' : 'success',
          message: funcError ? 'Edge functions may have issues' : 'Edge functions accessible',
          details: funcError?.message
        });
      } catch (funcError: any) {
        diagnosticResults.push({
          category: 'Edge Functions',
          name: 'Function Accessibility',
          status: 'error',
          message: 'Edge functions unreachable',
          details: funcError.message
        });
      }

    } catch (error: any) {
      diagnosticResults.push({
        category: 'System',
        name: 'General Error',
        status: 'error',
        message: 'Unexpected system error',
        details: error.message
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);

    // Show summary toast
    const errors = diagnosticResults.filter(r => r.status === 'error').length;
    const warnings = diagnosticResults.filter(r => r.status === 'warning').length;
    const successes = diagnosticResults.filter(r => r.status === 'success').length;

    if (errors > 0) {
      toast({
        title: 'Diagnostic Complete - Issues Found',
        description: `${errors} errors, ${warnings} warnings, ${successes} passed`,
        variant: 'destructive'
      });
    } else if (warnings > 0) {
      toast({
        title: 'Diagnostic Complete - Minor Issues',
        description: `${warnings} warnings, ${successes} passed`,
      });
    } else {
      toast({
        title: 'Diagnostic Complete - All Systems Operational',
        description: `All ${successes} tests passed`,
      });
    }
  };

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return <Shield className="h-4 w-4" />;
      case 'Database':
        return <Database className="h-4 w-4" />;
      case 'N8N Integration':
        return <Globe className="h-4 w-4" />;
      case 'User Data':
        return <User className="h-4 w-4" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Comprehensive System Diagnostic
        </CardTitle>
        <CardDescription>
          Complete pre-launch system health check including authentication, database, N8N, and edge functions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Full Diagnostic
              </>
            )}
          </Button>
        </div>

        {Object.entries(groupedResults).map(([category, categoryResults]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {getCategoryIcon(category)}
              {category}
            </h3>
            <div className="grid gap-3">
              {categoryResults.map((result, index) => (
                <Alert key={index} className={`${getStatusColor(result.status)} border-l-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{result.name}</h4>
                        <AlertDescription className="mt-1">
                          {result.message}
                        </AlertDescription>
                        {result.details && (
                          <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                            <strong>Details:</strong> {result.details}
                          </div>
                        )}
                        {result.data && (
                          <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                            <strong>Data:</strong> <pre>{JSON.stringify(result.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        ))}

        {results.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">System Status Summary</h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-600 font-bold text-xl">
                  {results.filter(r => r.status === 'success').length}
                </div>
                <div className="text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-600 font-bold text-xl">
                  {results.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-gray-600">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-bold text-xl">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-gray-600">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 font-bold text-xl">
                  {results.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComprehensiveSystemDiagnostic;