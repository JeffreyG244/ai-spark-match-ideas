
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Webhook, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const N8NWebhookTest = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const testWebhook = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to test the webhook',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('profile-webhook', {
        body: { 
          user_id: user.id, 
          event_type: 'manual_test' 
        }
      });

      if (error) {
        console.error('Webhook test error:', error);
        toast({
          title: 'Webhook Test Failed',
          description: error.message || 'Failed to trigger N8N webhook',
          variant: 'destructive'
        });
        return;
      }

      setLastResponse(data);
      
      toast({
        title: 'Webhook Test Successful!',
        description: 'N8N workflow has been triggered successfully.',
      });

    } catch (error: any) {
      console.error('Error testing webhook:', error);
      toast({
        title: 'Test Failed',
        description: error.message || 'Failed to test N8N webhook',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-purple-600" />
          N8N Webhook Integration Test
        </CardTitle>
        <p className="text-sm text-gray-600">Test the N8N workflow integration with your profile data</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-purple-300 text-purple-600">
            <Webhook className="h-3 w-3 mr-1" />
            Webhook URL: localhost:5678/webhook/010d0476-0e1c-4d10-bab7-955a933d1ca1
          </Badge>
        </div>

        {/* Test Button */}
        <Button 
          onClick={testWebhook}
          disabled={isLoading || !user}
          className="bg-purple-600 hover:bg-purple-700 text-white w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Testing Webhook...' : 'Test N8N Webhook'}
        </Button>

        {/* Response Display */}
        {lastResponse && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Last Test Response</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Instructions:</strong> Make sure your N8N workflow is running on localhost:5678 
            and listening for the webhook/010d0476-0e1c-4d10-bab7-955a933d1ca1 endpoint. The webhook will send your 
            profile data including preferences, compatibility answers, and matching criteria.
          </div>
        </div>

        {/* Webhook Data Structure */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Webhook Data Structure:</h4>
          <div className="bg-gray-50 rounded-lg p-3 text-xs">
            <pre>{`{
  "user_id": "uuid",
  "name": "First Last",
  "match_score": 0.95,
  "timestamp": "2025-01-06T...",
  "event_type": "profile_updated",
  "data": {
    "profile": {
      "age": 28,
      "gender": "male",
      "bio": "Looking for...",
      "interests": ["technology", "travel"],
      "location": "San Francisco, CA"
    },
    "compatibility": {
      "1": "Very important",
      "2": "A few times a week",
      ...
    },
    "preferences": {
      "age_range": [23, 33],
      "location": "San Francisco, CA",
      "interests": ["technology", "travel"]
    }
  }
}`}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8NWebhookTest;
