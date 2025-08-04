import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const UserCreationTest = () => {
  const { signUp, signIn } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('TestPassword123!');
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const testUserCreation = async () => {
    setIsCreating(true);
    setTestResults([]);
    
    try {
      addResult('🔄 Starting user creation test...');
      
      // Test 1: Create user account
      addResult('📝 Creating user account...');
      try {
        await signUp(testEmail, testPassword, '', '', '');
        addResult('✅ Sign up function called successfully');
        
        // Wait a moment and check if user exists
        setTimeout(async () => {
          const { data: { user }, error: getUserError } = await supabase.auth.getUser();
          if (getUserError) {
            addResult(`❌ Failed to get user: ${getUserError.message}`);
            return;
          }
          
          if (!user) {
            addResult('❌ No authenticated user found after signup');
            return;
          }
          
          addResult(`✅ User authenticated: ${user.id}`);
      
          
          // Test 2: Check if profile was created
          addResult('🔍 Checking if dating profile was created...');
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            addResult(`❌ Profile check failed: ${profileError.message}`);
          } else if (profile) {
            addResult(`✅ Dating profile found: ${profile.id}`);
          } else {
            addResult('⚠️ No dating profile found - this is expected for new users');
          }
          
          // Test 3: Test storage access
          addResult('📁 Testing storage access...');
          const testBlob = new Blob(['test'], { type: 'text/plain' });
          const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(`${user.id}/test.txt`, testFile);
          
          if (uploadError) {
            addResult(`❌ Storage upload failed: ${uploadError.message}`);
          } else {
            addResult(`✅ Storage upload successful: ${uploadData.path}`);
            
            // Clean up test file
            await supabase.storage
              .from('profile-photos')
              .remove([`${user.id}/test.txt`]);
            addResult('🧹 Test file cleaned up');
          }
          
          addResult('✅ User creation test completed successfully!');
        }, 2000);
        
      } catch (signUpError: any) {
        addResult(`❌ Sign up failed: ${signUpError.message || signUpError}`);
        return;
      }
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
      console.error('Test error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const checkStorageBuckets = async () => {
    setIsChecking(true);
    setTestResults([]);
    
    try {
      addResult('🔄 Checking storage buckets...');
      
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        addResult(`❌ Failed to list buckets: ${error.message}`);
        return;
      }
      
      addResult(`📁 Found ${buckets.length} buckets:`);
      buckets.forEach(bucket => {
        addResult(`  - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      });
      
      // Check specific buckets
      const requiredBuckets = ['profile-photos', 'user-photos'];
      const missingBuckets = requiredBuckets.filter(
        required => !buckets.find(bucket => bucket.name === required)
      );
      
      if (missingBuckets.length > 0) {
        addResult(`⚠️ Missing required buckets: ${missingBuckets.join(', ')}`);
      } else {
        addResult('✅ All required buckets are present');
      }
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
      console.error('Check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const testProfileFlow = async () => {
    setTestResults([]);
    addResult('🔄 Testing profile creation flow...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        addResult('❌ No authenticated user found. Please sign in first.');
        return;
      }
      
      addResult(`👤 Current user: ${user.id}`);
      
      // Test profile creation
      const testProfile = {
        user_id: user.id,
        bio: 'Test bio for profile creation',
        age: 30,
        gender: 'male',
        seeking_gender: 'female',
        location: 'Test City',
        interests: ['testing', 'development'],
        photo_urls: []
      };
      
      addResult('📝 Creating test profile...');
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .upsert(testProfile)
        .select()
        .single();
      
      if (profileError) {
        addResult(`❌ Profile creation failed: ${profileError.message}`);
        return;
      }
      
      addResult(`✅ Profile created: ${profile.id}`);
      
      // Test compatibility answers
      addResult('🧠 Creating test compatibility answers...');
      const testAnswers = {
        user_id: user.id,
        answers: {
          lifestyle: 'active',
          values: 'family',
          goals: 'career'
        }
      };
      
      const { error: answersError } = await supabase
        .from('compatibility_answers')
        .upsert(testAnswers);
      
      if (answersError) {
        addResult(`❌ Compatibility answers failed: ${answersError.message}`);
      } else {
        addResult('✅ Compatibility answers created');
      }
      
      addResult('✅ Profile flow test completed!');
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error}`);
      console.error('Profile flow error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Creation & Storage Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Test Email</Label>
              <Input
                id="email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Test Password</Label>
              <Input
                id="password"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Strong password"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={testUserCreation}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? 'Testing...' : 'Test User Creation'}
            </Button>
            
            <Button
              onClick={checkStorageBuckets}
              disabled={isChecking}
              variant="outline"
            >
              {isChecking ? 'Checking...' : 'Check Storage'}
            </Button>
            
            <Button
              onClick={testProfileFlow}
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Test Profile Flow
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <Alert key={index} className="py-2">
                  <AlertDescription className="font-mono text-sm">
                    {result}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserCreationTest;