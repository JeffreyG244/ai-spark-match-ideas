
import React, { useState } from 'react';
import { seedDiverseUsers, checkIfSeedingNeeded } from '@/utils/seedDiverseUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SeedUsers = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingComplete, setSeedingComplete] = useState(false);
  const [seedingNeeded, setSeedingNeeded] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkSeeding = async () => {
      try {
        const needed = await checkIfSeedingNeeded();
        setSeedingNeeded(needed);
      } catch (err) {
        console.error('Error checking if seeding is needed:', err);
        setError('Failed to check database status');
      }
    };
    
    // Only run the check if user is authenticated
    if (user) {
      checkSeeding();
    }
  }, [user]);

  const handleSeedUsers = async () => {
    if (!user) {
      setError('You must be logged in as an administrator to seed users');
      return;
    }

    setIsSeeding(true);
    setError(null);
    
    try {
      await seedDiverseUsers();
      setSeedingComplete(true);
      setSeedingNeeded(false);
    } catch (err: any) {
      console.error('Error seeding users:', err);
      setError(err.message || 'Failed to seed users');
    } finally {
      setIsSeeding(false);
    }
  };

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect via the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-purple-200 shadow-md">
          <CardHeader className="border-b border-gray-200 bg-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Seed Diverse Users</CardTitle>
                <CardDescription>
                  Populate your database with diverse AI user profiles for testing
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            {seedingNeeded === null ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                <span className="ml-3 text-gray-600">Checking database status...</span>
              </div>
            ) : seedingNeeded ? (
              <>
                <Alert variant="default" className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <AlertTitle className="text-amber-800">Database Seeding Recommended</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Your database appears to have fewer than 5 user profiles. Adding diverse test users is recommended for testing.
                  </AlertDescription>
                </Alert>
                
                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">This process will:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                    <li>Create 10 diverse user accounts with various backgrounds</li>
                    <li>Upload profile photos to your storage bucket</li>
                    <li>Populate profile data including bios and values</li>
                    <li>Create auth users with test credentials</li>
                  </ul>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    size="lg"
                    disabled={isSeeding}
                    onClick={handleSeedUsers}
                  >
                    {isSeeding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Seeding Users...
                      </>
                    ) : (
                      'Seed 10 Diverse Users'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Database Already Populated</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your database already contains enough user profiles. No additional seeding is needed.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {seedingComplete && (
              <Alert variant="default" className="bg-green-50 border-green-200 mt-6">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Seeding Complete!</AlertTitle>
                <AlertDescription className="text-green-700">
                  10 diverse user profiles have been successfully added to your database.
                </AlertDescription>
              </Alert>
            )}

            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="text-sm text-gray-500">
                <p><strong>Note:</strong> This utility should only be used in development or testing environments. The created users use the test password "Password123!" and should be removed in production.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedUsers;
