import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { seedDatingProfiles } from '@/utils/seedDatingProfiles';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';
const SeedDatingProfiles = () => {
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedSuccess, setSeedSuccess] = useState(false);
    const [profileCount, setProfileCount] = useState(0);
    const handleSeed = async () => {
        setIsSeeding(true);
        setSeedSuccess(false);
        try {
            const result = await seedDatingProfiles();
            if (result.success) {
                setSeedSuccess(true);
                setProfileCount(result.count || 50);
                toast({
                    title: 'Success!',
                    description: `Successfully uploaded ${result.count} dating profiles to the database.`,
                });
            }
        }
        catch (error) {
            console.error('Seeding failed:', error);
            toast({
                title: 'Seeding Failed',
                description: 'Failed to upload dating profiles. Please check console for details.',
                variant: 'destructive'
            });
        }
        finally {
            setIsSeeding(false);
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Seed Dating Profiles Database
            </CardTitle>
            <p className="text-gray-600">
              Upload 50 realistic dating profiles (25 male, 25 female) to your production database
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {!seedSuccess && (<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What this will create:</h3>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• 25 Male profiles with diverse backgrounds</li>
                  <li>• 25 Female profiles with varied interests</li>
                  <li>• Ages 21-45 across major U.S. cities</li>
                  <li>• Complete bios, interests, and relationship goals</li>
                  <li>• High-quality profile photos from Unsplash</li>
                  <li>• Realistic data suitable for production use</li>
                </ul>
              </div>)}

            {seedSuccess && (<div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3"/>
                <h3 className="font-semibold text-green-900 mb-2">
                  Successfully Uploaded!
                </h3>
                <p className="text-green-800">
                  {profileCount} dating profiles have been added to your database and are ready for matching.
                </p>
              </div>)}

            <div className="flex justify-center">
              <Button onClick={handleSeed} disabled={isSeeding || seedSuccess} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium" size="lg">
                {isSeeding ? (<>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading Profiles...
                  </>) : seedSuccess ? (<>
                    <CheckCircle className="h-4 w-4 mr-2"/>
                    Profiles Uploaded
                  </>) : (<>
                    <Upload className="h-4 w-4 mr-2"/>
                    Upload 50 Dating Profiles
                  </>)}
              </Button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2"/>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Production Notice</h3>
                  <p className="text-yellow-800 text-sm">
                    This will add real data to your production database. Ensure your app is ready for testing with these profiles.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Profile photos are sourced from Unsplash with proper attribution</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
};
export default SeedDatingProfiles;
