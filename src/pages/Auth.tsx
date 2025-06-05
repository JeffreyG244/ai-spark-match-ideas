
import { useState } from 'react';
import { Heart } from 'lucide-react';
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">LuvLang</h1>
          </div>
          <p className="text-gray-600">
            Secure AI-powered deep connections for serious professionals
          </p>
        </div>
        
        <AuthForm mode={mode} onToggleMode={toggleMode} />
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          <p className="mt-2">Your data is protected with enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
