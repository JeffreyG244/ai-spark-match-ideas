
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Brain, ArrowLeft, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibilityAnswers } from '@/hooks/useCompatibilityAnswers';
import { useProfileData } from '@/hooks/useProfileData';

const Matches = () => {
  const { user, signOut } = useAuth();
  const { questionAnswers, loadCompatibilityAnswers } = useCompatibilityAnswers();
  const { profileData, loadProfile } = useProfileData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCompatibilityAnswers();
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    // Remove any seed user generation
    setIsLoading(false);
  }, [questionAnswers, profileData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Luvlang</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Compatibility Matches</h1>
          <p className="text-gray-600">AI-powered matches based on your profile and compatibility answers</p>
        </div>

        {/* Compatibility Summary */}
        <Card className="border-purple-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Your Compatibility Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(questionAnswers).length}
                </div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  0
                </div>
                <div className="text-sm text-gray-600">Potential Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  0%
                </div>
                <div className="text-sm text-gray-600">Avg Compatibility</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No Matches State */}
        <Card className="border-purple-200 text-center py-12">
          <CardContent>
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete Your Profile for Better Matches</h3>
            <p className="text-gray-600 mb-6">
              Answer compatibility questions and fill out your profile to see AI-powered matches
            </p>
            <Link to="/dashboard">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Matches;
