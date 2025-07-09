import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Database, Webhook, Github, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  details?: any;
}

const SystemIntegrationTest = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const updateResult = (name: string, status: 'success' | 'error', message?: string, details?: any) => {
    setResults(prev => prev.map(result => 
      result.name === name 
        ? { ...result, status, message, details }
        : result
    ));
  };

  const initializeTests = () => {
    const tests = [
      { name: 'Supabase Connection', status: 'pending' as const },
      { name: 'Database Profiles', status: 'pending' as const },
      { name: 'Daily Matches Schema', status: 'pending' as const },
      { name: 'Compatibility Answers', status: 'pending' as const },
      { name: 'N8N Webhook', status: 'pending' as const },
      { name: 'Profile-Webhook Function', status: 'pending' as const },
    ];
    setResults(tests);
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('dating_profiles').select('count', { count: 'exact', head: true });
      if (error) throw error;
      
      updateResult('Supabase Connection', 'success', `Connected successfully. Found ${data?.length || 0} profiles`, data);
    } catch (error: any) {
      updateResult('Supabase Connection', 'error', error.message, error);
    }
  };

  const testDatabaseProfiles = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('dating_profiles')
        .select('id, user_id, first_name, email, photo_urls, city, state')
        .limit(5);
      
      if (error) throw error;
      
      if (!profiles || profiles.length === 0) {
        updateResult('Database Profiles', 'error', 'No profiles found in database');
        return;
      }

      // Check for required fields
      const missingFields = [];
      const firstProfile = profiles[0];
      if (!firstProfile.email) missingFields.push('email');
      if (!firstProfile.photo_urls) missingFields.push('photo_urls');
      if (!firstProfile.city) missingFields.push('city');
      if (!firstProfile.state) missingFields.push('state');

      if (missingFields.length > 0) {
        updateResult('Database Profiles', 'error', `Missing fields: ${missingFields.join(', ')}`, profiles);
      } else {
        updateResult('Database Profiles', 'success', `Found ${profiles.length} valid profiles`, profiles);
      }
    } catch (error: any) {
      updateResult('Database Profiles', 'error', error.message, error);
    }
  };

  const testDailyMatchesSchema = async () => {
    try {
      const { data: dailyMatches, error } = await supabase
        .from('daily_matches')
        .select('id, user_id, suggested_user_id, compatibility_score, suggested_date, viewed, created_at')
        .limit(5);
      
      if (error) throw error;
      
      updateResult('Daily Matches Schema', 'success', `Schema is correct. Found ${dailyMatches?.length || 0} daily matches`, dailyMatches);
    } catch (error: any) {
      updateResult('Daily Matches Schema', 'error', error.message, error);
    }
  };

  const testCompatibilityAnswers = async () => {
    try {
      const { data: answers, error } = await supabase
        .from('compatibility_answers')
        .select('id, user_id, answers')
        .limit(5);
      
      if (error) throw error;
      
      updateResult('Compatibility Answers', 'success', `Found ${answers?.length || 0} compatibility answer sets`, answers);
    } catch (error: any) {
      updateResult('Compatibility Answers', 'error', error.message, error);
    }
  };

  const testN8NWebhook = async () => {
    try {
      const webhookUrl = 'http://localhost:5678/webhook/010d0476-0e1c-4d10-bab7-955a933d1ca1';
      const testData = {
        user_id: user?.id || 'test-user',
        event_type: 'integration_test',
        timestamp: new Date().toISOString(),
        test: true
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        updateResult('N8N Webhook', 'success', 'N8N webhook is reachable and responded successfully');
      } else {
        updateResult('N8N Webhook', 'error', `Webhook returned status: ${response.status}`);
      }
    } catch (error: any) {
      updateResult('N8N Webhook', 'error', `Webhook not reachable: ${error.message}`);
    }
  };

  const testProfileWebhookFunction = async () => {
    if (!user) {
      updateResult('Profile-Webhook Function', 'error', 'User not logged in');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('profile-webhook', {
        body: { 
          user_id: user.id, 
          event_type: 'integration_test' 
        }
      });

      if (error) throw error;
      
      updateResult('Profile-Webhook Function', 'success', 'Edge function responded successfully', data);
    } catch (error: any) {
      updateResult('Profile-Webhook Function', 'error', error.message, error);
    }
  };

  const runAllTests = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to run integration tests',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);
    initializeTests();

    try {
      await testSupabaseConnection();
      await testDatabaseProfiles();
      await testDailyMatchesSchema();
      await testCompatibilityAnswers();
      await testN8NWebhook();
      await testProfileWebhookFunction();
      
      toast({
        title: 'Integration Tests Complete',
        description: 'All system integration tests have been completed',
      });
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />;
      default:
        return <Loader2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTestIcon = (name: string) => {
    if (name.includes('Supabase') || name.includes('Database') || name.includes('Schema') || name.includes('Compatibility')) {
      return <Database className="h-4 w-4" />;
    }
    if (name.includes('N8N')) {
      return <Zap className="h-4 w-4" />;
    }
    if (name.includes('Webhook') || name.includes('Function')) {
      return <Webhook className="h-4 w-4" />;
    }
    return <Github className="h-4 w-4" />;
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          System Integration Tests
        </CardTitle>
        <p className="text-sm text-gray-600">
          Test all integrations: Supabase, N8N, webhooks, and database schema
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={runAllTests}
          disabled={isRunning || !user}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run All Integration Tests'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Test Results:</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTestIcon(result.name)}
                  <span className="text-sm font-medium">{result.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.message && (
                    <span className="text-xs text-gray-600 max-w-xs truncate">
                      {result.message}
                    </span>
                  )}
                  {getStatusIcon(result.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.some(r => r.status === 'error') && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Issues Found:</h4>
            <ul className="text-xs text-red-700 space-y-1">
              {results.filter(r => r.status === 'error').map((result, index) => (
                <li key={index}>• {result.name}: {result.message}</li>
              ))}
            </ul>
          </div>
        )}

        {results.length > 0 && results.every(r => r.status === 'success') && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ All systems are working correctly! Your Supabase, N8N, and webhook integrations are functioning properly.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemIntegrationTest;