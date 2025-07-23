import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const N8NConfiguration = () => {
  const { user } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const testWebhook = async () => {
    if (!user || !webhookUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a webhook URL first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Testing N8N webhook with URL:', webhookUrl);
      
      const { data, error } = await supabase.functions.invoke('profile-webhook', {
        body: { 
          user_id: user.id, 
          event_type: 'test_webhook',
          webhook_url: webhookUrl // Pass the URL for testing
        }
      });

      if (error) {
        console.error('Webhook test error:', error);
        toast({
          title: 'Webhook Test Failed',
          description: error.message || 'Unknown error occurred',
          variant: 'destructive'
        });
        setLastResponse({ error: error.message });
      } else {
        console.log('Webhook test successful:', data);
        toast({
          title: 'Webhook Test Successful!',
          description: 'N8N webhook is working correctly.',
        });
        setLastResponse(data);
      }
    } catch (error: any) {
      console.error('Webhook test failed:', error);
      toast({
        title: 'Test Failed',
        description: error.message || 'Failed to test webhook',
        variant: 'destructive'
      });
      setLastResponse({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>N8N Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">N8N Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-sm text-gray-600">
              Enter your publicly accessible N8N webhook URL. This should be something like:
              <br />
              <code className="bg-gray-100 px-1 rounded">https://your-n8n-instance.com/webhook/your-webhook-id</code>
            </p>
          </div>

          <Button
            onClick={testWebhook}
            disabled={isLoading || !webhookUrl}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test N8N Webhook'}
          </Button>

          {lastResponse && (
            <div className="mt-4">
              <Label>Last Response:</Label>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Make your N8N webhook publicly accessible:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>If using n8n.cloud, your webhook URL should look like: <code>https://app.n8n.cloud/webhook/your-webhook-id</code></li>
                <li>If self-hosting, ensure your N8N instance is accessible from the internet</li>
                <li>Make sure the webhook is configured to accept POST requests</li>
              </ul>
            </div>
            
            <div>
              <strong>2. Expected data structure sent to webhook:</strong>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
{`{
  "user_id": "string",
  "name": "string", 
  "match_score": 0.95,
  "timestamp": "ISO string",
  "event_type": "profile_completed",
  "data": {
    "profile": { /* user profile data */ },
    "compatibility": { /* compatibility answers */ },
    "preferences": { /* user preferences */ }
  }
}`}
              </pre>
            </div>

            <div>
              <strong>3. N8N should return:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>A list of compatible matches</li>
                <li>Each match should include user profile data and compatibility scores</li>
                <li>The data will be used to populate the user's discover page</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8NConfiguration;