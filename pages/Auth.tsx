
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SignUpFlow from '@/components/auth/SignUpFlow';
import LoginForm from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (mode === 'signup') {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            onClick={() => setMode('login')}
            className="border-pink-200 text-pink-600 hover:bg-pink-50"
          >
            Already have an account? Sign In
          </Button>
        </div>
        <SignUpFlow />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          onClick={() => setMode('signup')}
          className="border-pink-200 text-pink-600 hover:bg-pink-50"
        >
          Need an account? Sign Up
        </Button>
      </div>
      <LoginForm />
    </div>
  );
};

export default Auth;
