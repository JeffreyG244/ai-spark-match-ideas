import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, Users, Heart, Sparkles } from 'lucide-react';
import { seedModernProfiles } from '@/utils/modernSeedProfiles';
import { toast } from '@/hooks/use-toast';

const SeedModernProfiles = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleSeedProfiles = async () => {
    setIsSeeding(true);
    setProgress(0);
    setIsComplete(false);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await seedModernProfiles();
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(result);
      setIsComplete(true);
      
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
      console.error('Error seeding profiles:', error);
      setResults({
        success: false,
        message: 'Failed to seed profiles. Please try again.'
      });
      toast({
        title: 'Error',
        description: 'Failed to seed profiles. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-background via-white to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="border-love-primary/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-love-primary to-love-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-love-primary to-love-secondary bg-clip-text text-transparent">
              Seed Modern Dating Profiles
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Add attractive, professional dating profiles with modern photos to populate your dating app
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isSeeding && !isComplete && (
              <div className="text-center space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg">
                    <Users className="h-6 w-6 text-love-primary mx-auto mb-2" />
                    <p className="font-semibold">10 Profiles</p>
                    <p className="text-gray-600">5 women, 5 men</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                    <Heart className="h-6 w-6 text-love-secondary mx-auto mb-2" />
                    <p className="font-semibold">Professional Photos</p>
                    <p className="text-gray-600">Modern, attractive</p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSeedProfiles}
                  className="w-full bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Seed Modern Profiles
                </Button>
              </div>
            )}

            {isSeeding && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-love-primary mx-auto" />
                <div>
                  <p className="text-lg font-semibold mb-2">Creating modern profiles...</p>
                  <Progress value={progress} className="w-full h-3" />
                  <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
                </div>
              </div>
            )}

            {isComplete && results && (
              <div className="text-center space-y-4">
                {results.success ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                    <div>
                      <h3 className="text-xl font-bold text-green-800 mb-2">Success! 🎉</h3>
                      <p className="text-gray-700 mb-4">{results.message}</p>
                      {results.count && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-green-800 font-semibold">
                            {results.count} new profiles added to your dating app!
                          </p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => window.location.href = '/discover'}
                      className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white"
                    >
                      View Profiles in Discover
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-red-600 text-xl">❌</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-800 mb-2">Error</h3>
                      <p className="text-gray-700">{results.message}</p>
                    </div>
                    <Button
                      onClick={() => {
                        setIsComplete(false);
                        setResults(null);
                      }}
                      variant="outline"
                      className="border-love-primary text-love-primary hover:bg-love-primary hover:text-white"
                    >
                      Try Again
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedModernProfiles;