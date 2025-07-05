
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, User, Camera, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
}

const SignUpFlow = () => {
  const { signUp, user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    age: 18,
    location: '',
    bio: '',
    interests: []
  });

  const popularInterests = [
    'Travel', 'Fitness', 'Music', 'Food', 'Art', 'Sports',
    'Movies', 'Reading', 'Photography', 'Dancing', 'Hiking',
    'Cooking', 'Gaming', 'Fashion', 'Tech', 'Yoga'
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.firstName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(
        formData.email,
        formData.password,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      setStep(2);
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: 'Sign Up Failed',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'Please sign in again to complete your profile.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        email: formData.email,
        bio: formData.bio || `${formData.firstName} from ${formData.location}. Age ${formData.age}.`,
        photo_urls: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select();

      if (error) {
        throw error;
      }

      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName
          }
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't block the signup process if email fails
      }

      toast({
        title: 'Welcome to the community!',
        description: 'Your profile has been created successfully. Check your email for a welcome message!',
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Profile Creation Failed',
        description: `Error: ${errorMessage}. Please try again or contact support.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Join Our Community
            </CardTitle>
            <p className="text-gray-600 text-sm">Find meaningful connections</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Choose a strong password"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                />
              </div>
            </div>

            <Button 
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-6 text-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <p className="text-gray-600 text-sm">Tell us about yourself</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="bio">About Me</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell potential matches about yourself..."
              rows={3}
            />
          </div>

          <div>
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {popularInterests.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.interests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    formData.interests.includes(interest)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'hover:border-pink-300'
                  }`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={saveProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-6 text-lg"
          >
            {loading ? 'Setting Up Profile...' : 'Complete Profile'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpFlow;
