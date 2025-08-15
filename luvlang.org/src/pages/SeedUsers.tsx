
import React, { useState } from 'react';
import { seedDiverseUsers, checkIfSeedingNeeded } from '@/utils/seedDiverseUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AdminGuard from '@/components/security/AdminGuard';

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
    <AdminGuard requireProduction={false}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="border-b border-gray-200 bg-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Seed Professional Users</CardTitle>
                  <CardDescription>
                    Populate your database with 50 professional profiles (25 male, 25 female) targeting ages 30-50
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
                      Your database appears to have fewer than 5 user profiles. Adding professional test users will improve the matching experience.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-white p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">This process will create:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                      <li>50 professional user accounts with sophisticated profiles</li>
                      <li>25 female professionals (Marketing Directors, Engineers, Lawyers, etc.)</li>
                      <li>25 male professionals (Tech Executives, Consultants, Directors, etc.)</li>
                      <li>High-quality profile photos and detailed bios</li>
                      <li>Professional values, goals, and interests</li>
                      <li>Ages targeting 30-50 demographic</li>
                    </ul>
                    <p className="text-sm text-gray-600">
                      <strong>Note:</strong> These profiles are designed to give new users an excellent first impression with classy, modern professionals.
                    </p>
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
                          Seeding Professional Users...
                        </>
                      ) : (
                        'Seed 50 Professional Users'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-800">Database Already Populated</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your database already contains enough user profiles. The matching experience should work well with existing users.
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
                    50 professional user profiles have been successfully added to your database. Users will now see quality matches in the Discover and Daily Matches sections.
                  </AlertDescription>
                </Alert>
              )}

              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="text-sm text-gray-500">
                  <p><strong>Security Note:</strong> These profiles use secure random passwords and should only be used in development/testing environments. Consider removing them before going fully live.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
};

export default SeedUsers;
