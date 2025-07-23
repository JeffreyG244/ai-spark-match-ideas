import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  details?: any;
}

export default function TestIntegration() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const updateResult = (name: string, status: 'success' | 'error', message?: string, details?: any) => {
    setResults(prev => prev.map(r => 
      r.name === name ? { ...r, status, message, details } : r
    ));
  };

  const initializeTests = () => {
    setResults([
      { name: 'User Authentication', status: 'pending' },
      { name: 'Profile Data Fetch', status: 'pending' },
      { name: 'N8N Webhook Connection', status: 'pending' },
      { name: 'Match Generation', status: 'pending' },
      { name: 'Database Integration', status: 'pending' }
    ]);
  };

  const runIntegrationTest = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to run integration tests',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);
    initializeTests();

    try {
      // Test 1: User Authentication
      updateResult('User Authentication', 'success', `Authenticated as ${user.email}`);

      // Test 2: Profile Data Fetch
      try {
        const { data: profile, error: profileError } = await supabase
          .from('dating_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile) {
          updateResult('Profile Data Fetch', 'error', 'No profile found - please complete your profile first');
        } else {
          updateResult('Profile Data Fetch', 'success', `Profile found: ${profile.first_name} ${profile.last_name}`);
        }
      } catch (error: any) {
        updateResult('Profile Data Fetch', 'error', error.message);
      }

      // Test 3: N8N Webhook Connection
      try {
        const { data, error } = await supabase.functions.invoke('profile-webhook', {
          body: { 
            user_id: user.id,
            event_type: 'integration_test' 
          }
        });

        if (error) {
          updateResult('N8N Webhook Connection', 'error', `Webhook failed: ${error.message}`);
        } else {
          updateResult('N8N Webhook Connection', 'success', 'N8N webhook responded successfully', data);
        }
      } catch (error: any) {
        updateResult('N8N Webhook Connection', 'error', `Connection failed: ${error.message}`);
      }

      // Test 4: Match Generation
      try {
        const { data: matches, error: matchError } = await supabase
          .from('daily_matches')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);

        if (matchError) {
          updateResult('Match Generation', 'error', matchError.message);
        } else if (matches && matches.length > 0) {
          updateResult('Match Generation', 'success', `Found ${matches.length} matches`);
        } else {
          updateResult('Match Generation', 'error', 'No matches found - system may need time to generate matches');
        }
      } catch (error: any) {
        updateResult('Match Generation', 'error', error.message);
      }

      // Test 5: Database Integration
      try {
        const { data: compatibility, error: compatError } = await supabase
          .from('compatibility_answers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (compatError) {
          updateResult('Database Integration', 'error', 'Compatibility answers not found');
        } else {
          updateResult('Database Integration', 'success', 'Database integration working');
        }
      } catch (error: any) {
        updateResult('Database Integration', 'error', error.message);
      }

    } catch (error: any) {
      toast({
        title: 'Test Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            N8N Integration Test Suite
            <Badge variant="outline">
              {user ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Test the complete N8N integration pipeline including authentication, profile data, webhook connectivity, and match generation.
            </p>
            <Button 
              onClick={runIntegrationTest}
              disabled={isRunning || !user}
              className="min-w-32"
            >
              {isRunning ? 'Running Tests...' : 'Run Integration Test'}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.name}</span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(result.status)}`} />
                      </div>
                      {result.message && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {result.message}
                        </p>
                      )}
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!user && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Please log in to run the integration tests.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}