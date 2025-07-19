import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SystemCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
}

const N8NSystemCheck = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const performSystemCheck = async () => {
    setIsRunning(true);
    const results: SystemCheck[] = [];

    try {
      // Check 1: Database Authentication
      const { data: authData, error: authError } = await supabase.auth.getUser();
      results.push({
        name: 'Authentication',
        status: authError ? 'error' : 'success',
        message: authError ? 'Authentication failed' : 'User authenticated successfully',
        details: authError?.message
      });

      if (authData.user) {
        // Check 2: User Profile Exists
        const { data: profile, error: profileError } = await supabase
          .from('dating_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        results.push({
          name: 'User Profile',
          status: profileError ? 'error' : 'success',
          message: profileError ? 'User profile missing' : 'User profile found',
          details: profileError?.message
        });

        // Check 3: N8N Webhook Logs Table
        const { data: logData, error: logError } = await supabase
          .from('n8n_webhook_logs')
          .select('count')
          .limit(1);

        results.push({
          name: 'N8N Logs Table',
          status: logError ? 'error' : 'success',
          message: logError ? 'N8N logs table not accessible' : 'N8N logs table accessible',
          details: logError?.message
        });

        // Check 4: Test N8N Webhook Connection
        try {
          const webhookUrl = 'https://luvlang.app.n8n.cloud/webhook-test/1c19d72c-85ea-4e4c-901b-2b09013bc4d6';
          const testPayload = {
            test: true,
            user_id: authData.user.id,
            timestamp: new Date().toISOString()
          };

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
          });

          // Log the webhook attempt
          await supabase.from('n8n_webhook_logs').insert({
            user_id: authData.user.id,
            webhook_url: webhookUrl,
            payload: testPayload,
            response_status: response.status,
            response_body: await response.text(),
            success: response.ok
          });

          results.push({
            name: 'N8N Webhook',
            status: response.ok ? 'success' : 'warning',
            message: response.ok ? 'N8N webhook responding' : `N8N webhook returned ${response.status}`,
            details: `Status: ${response.status}`
          });
        } catch (webhookError: any) {
          results.push({
            name: 'N8N Webhook',
            status: 'error',
            message: 'N8N webhook not reachable',
            details: webhookError.message
          });
        }

        // Check 5: Database Functions
        try {
          const { data: funcData, error: funcError } = await supabase.rpc('generate_daily_matches', {
            target_user_id: authData.user.id,
            match_count: 1
          });

          results.push({
            name: 'Database Functions',
            status: funcError ? 'error' : 'success',
            message: funcError ? 'Database functions not working' : 'Database functions operational',
            details: funcError?.message
          });
        } catch (funcError: any) {
          results.push({
            name: 'Database Functions',
            status: 'error',
            message: 'Database functions error',
            details: funcError.message
          });
        }
      }

    } catch (error: any) {
      results.push({
        name: 'System Check',
        status: 'error',
        message: 'System check failed',
        details: error.message
      });
    }

    setChecks(results);
    setIsRunning(false);

    const hasErrors = results.some(check => check.status === 'error');
    const hasWarnings = results.some(check => check.status === 'warning');

    if (hasErrors) {
      toast({
        title: 'System Check Failed',
        description: 'Critical issues found that need attention',
        variant: 'destructive'
      });
    } else if (hasWarnings) {
      toast({
        title: 'System Check Warning',
        description: 'Some issues found but system is functional',
        variant: 'default'
      });
    } else {
      toast({
        title: 'System Check Passed',
        description: 'All systems are operational',
        variant: 'default'
      });
    }
  };

  useEffect(() => {
    performSystemCheck();
  }, []);

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

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          System Health & N8N Connectivity Check
        </CardTitle>
        <CardDescription>
          Comprehensive system check including authentication, database, and N8N workflow connectivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={performSystemCheck} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running System Check...
            </>
          ) : (
            'Run System Check'
          )}
        </Button>

        <div className="space-y-3">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                  {check.details && (
                    <p className="text-xs text-red-600 mt-1">{check.details}</p>
                  )}
                </div>
              </div>
              <Badge className={getStatusBadge(check.status)}>
                {check.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>

        {checks.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">System Status Summary</h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-600 font-bold">
                  {checks.filter(c => c.status === 'success').length}
                </div>
                <div>Passed</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-600 font-bold">
                  {checks.filter(c => c.status === 'warning').length}
                </div>
                <div>Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-bold">
                  {checks.filter(c => c.status === 'error').length}
                </div>
                <div>Errors</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 font-bold">
                  {checks.filter(c => c.status === 'pending').length}
                </div>
                <div>Pending</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default N8NSystemCheck;