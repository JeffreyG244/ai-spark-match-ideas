import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Zap, TestTube, CheckCircle, AlertCircle } from 'lucide-react';

const N8NWebhookTester: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [customWebhookUrl, setCustomWebhookUrl] = useState('https://luvlang.org/webhook-test/luvlang-match');
  
  // Auto-trigger test on component mount for direct testing
  React.useEffect(() => {
    if (user) {
      // Immediate test trigger
      triggerDirectWebhook();
    }
  }, [user]);

  const triggerDirectWebhook = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to test the webhook',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setTestResults(null);

    try {
      console.log('Testing N8N webhook connectivity...');
      
      // Step 1: Test the Supabase profile-webhook function
      console.log('Step 1: Testing Supabase profile-webhook function...');
      const profileWebhookResponse = await supabase.functions.invoke('profile-webhook', {
        body: { 
          user_id: user.id,
          event_type: 'integration_test'
        }
      });

      console.log('Profile webhook response:', profileWebhookResponse);

      // Step 2: Test direct webhook call to N8N
      console.log('Step 2: Testing direct N8N webhook...');
      
      const webhookPayload = {
        user_id: user.id,
        name: `${user.user_metadata?.first_name || 'Jeffrey'} ${user.user_metadata?.last_name || 'Graves'}`,
        match_score: 0.95,
        timestamp: new Date().toISOString(),
        event_type: 'integration_test',
        data: {
          profile: {
            user_id: user.id,
            first_name: user.user_metadata?.first_name || 'Jeffrey',
            last_name: user.user_metadata?.last_name || 'Graves',
            age: 35,
            primary_location: 'Test City, CA',
            age_range_min: 25,
            age_range_max: 45,
            cultural_interests: ['Technology', 'Business', 'Innovation'],
            weekend_activities: ['Networking', 'Professional Development'],
            sexual_orientation: ['Heterosexual'],
            deal_breakers: [],
            bio: 'Test bio for profile creation',
            industry: 'Technology',
            job_title: 'Professional'
          },
          compatibility: {},
          preferences: {
            age_range: [25, 45],
            location: 'Test City, CA',
            interests: ['Technology', 'Business', 'Innovation'],
            sexual_orientation: ['Heterosexual'],
            deal_breakers: []
          },
          user_metadata: {
            industry: 'Technology',
            job_title: 'Professional',
            bio: 'Test bio for profile creation'
          }
        }
      };

      console.log('Sending comprehensive webhook payload:', webhookPayload);
      
      // Try direct webhook call with better error handling
      let directWebhookResult = null;
      try {
        const response = await fetch(customWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });
        
        directWebhookResult = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          note: response.ok ? 'Direct webhook successful' : `Failed with status ${response.status}`
        };
      } catch (error) {
        directWebhookResult = {
          success: false,
          error: error.message,
          note: 'CORS or network error - webhook may still have been delivered'
        };
      }

      const results = {
        profileWebhook: {
          success: !profileWebhookResponse.error,
          data: profileWebhookResponse.data,
          error: profileWebhookResponse.error
        },
        directWebhook: directWebhookResult,
        summary: {
          supabase_function: !profileWebhookResponse.error ? 'SUCCESS' : 'FAILED',
          direct_webhook: directWebhookResult?.success ? 'SUCCESS' : 'FAILED_OR_CORS',
          timestamp: new Date().toISOString()
        }
      };

      setTestResults(results);

      if (!profileWebhookResponse.error) {
        toast({
          title: 'Webhook Tests Completed',
          description: 'Check results below and your N8N workflow for incoming data.',
        });
      } else {
        toast({
          title: 'Webhook Test Issues Detected',
          description: 'Some tests failed - check results for details.',
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      console.error('Webhook test error:', error);
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast({
        title: 'Test Error',
        description: 'Failed to complete webhook test. Check console for details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerAIAnalysis = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('profile-webhook', {
        body: { 
          user_id: user.id,
          event_type: 'analysis_requested'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'AI Analysis Triggered',
        description: 'Your AI analysis has been started. Results will appear in the dashboard.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to trigger AI analysis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            N8N Webhook Testing Dashboard
          </CardTitle>
          <CardDescription>
            Test your N8N workflow connectivity and webhook endpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Webhook URL Input */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">N8N Webhook URL</Label>
            <Input
              id="webhook-url"
              value={customWebhookUrl}
              onChange={(e) => setCustomWebhookUrl(e.target.value)}
              placeholder="https://luvlang.org/webhook-test/luvlang-match"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Enter your N8N webhook URL. Default is set to luvlang-match.
            </p>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={triggerDirectWebhook}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Test N8N Connectivity
            </Button>
            
            <Button
              onClick={triggerAIAnalysis}
              disabled={loading}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Trigger AI Analysis
            </Button>
          </div>

          {/* Test Results */}
          {testResults && (
            <Card className="border-gray-200 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {testResults.error ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-800">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700 space-y-2">
              <p><strong>1. Test N8N Connectivity:</strong> This will test your webhook endpoint and check recent logs.</p>
              <p><strong>2. Trigger AI Analysis:</strong> This will send your profile data to N8N for AI processing.</p>
              <p><strong>3. Check Your N8N Workflow:</strong> Look for incoming webhook requests in your N8N interface.</p>
              <p><strong>4. Expected Webhooks:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>profile-webhook</code> - Sends profile data to N8N</li>
                <li><code>n8n-response-handler</code> - Receives AI results from N8N</li>
                <li><code>professional-match-trigger</code> - Your custom webhook endpoint</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8NWebhookTester;