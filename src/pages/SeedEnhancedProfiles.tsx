import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Users, Heart } from 'lucide-react';
import { seedEnhancedProfiles } from '@/utils/enhancedSeedProfiles';

const SeedEnhancedProfiles = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleSeedProfiles = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    
    try {
      console.log('Starting enhanced profile seeding...');
      
      const result = await seedEnhancedProfiles();
      setSeedResult(result);
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error seeding enhanced profiles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSeedResult({
        success: false,
        message: `Failed to seed profiles: ${errorMessage}`
      });
      
      toast({
        title: 'Error',
        description: 'Failed to seed enhanced profiles. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-background via-white to-love-surface p-6">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-love-primary/20 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-love-primary to-love-secondary rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-love-primary to-love-secondary bg-clip-text text-transparent">
              Seed Enhanced Dating Profiles
            </CardTitle>
            <CardDescription className="text-lg text-love-text-light">
              Add 22 diverse, high-quality profiles (male and female, ages 25-45) with compatibility answers
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-love-primary/10">
                <CardHeader>
                  <CardTitle className="text-xl text-love-text flex items-center gap-2">
                    <Users className="h-5 w-5 text-love-primary" />
                    Profile Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-love-text-light">
                    <li>• 11 Female profiles (ages 25-45)</li>
                    <li>• 11 Male profiles (ages 25-45)</li>
                    <li>• Diverse backgrounds and professions</li>
                    <li>• High-quality profile photos</li>
                    <li>• Detailed bios and interests</li>
                    <li>• Complete compatibility answers</li>
                    <li>• Ready for swiping and matching</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-love-primary/10">
                <CardHeader>
                  <CardTitle className="text-xl text-love-text">Sample Profiles Include</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-love-text-light">
                    <li>• Marketing coordinators</li>
                    <li>• Software engineers</li>
                    <li>• Healthcare professionals</li>
                    <li>• Teachers and professors</li>
                    <li>• Financial advisors</li>
                    <li>• Creative professionals</li>
                    <li>• Entrepreneurs</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <Button
                onClick={handleSeedProfiles}
                disabled={isSeeding}
                size="lg"
                className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white px-8 py-3 text-lg"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Seeding Enhanced Profiles...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-5 w-5" />
                    Seed Enhanced Profiles
                  </>
                )}
              </Button>
              
              {seedResult && (
                <Card className={`border ${seedResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <CardContent className="py-4">
                    <p className={`text-center ${seedResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {seedResult.message}
                      {seedResult.count !== undefined && ` (${seedResult.count} profiles created)`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="border-love-primary/10 bg-love-surface/50">
              <CardContent className="py-4">
                <p className="text-sm text-love-text-light text-center">
                  <strong>Note:</strong> This will add enhanced profiles with ages 25-45, ensuring a good mix 
                  for discovery and swiping. All profiles include compatibility answers for proper matching.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedEnhancedProfiles;