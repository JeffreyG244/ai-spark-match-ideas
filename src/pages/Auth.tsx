import { useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (mode === 'login') {
        // Login logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Login successful! Redirecting...');
      } else {
        // Signup logic
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Verification email sent! Check your inbox.');
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setMessage(''); // Clear messages when switching modes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Luvlang</h1>
          </div>
          <p className="text-gray-600">
            Secure AI-powered deep connections for serious professionals
          </p>
        </div>
        
        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
              minLength={6}
            />
          </div>
          
          {message && (
            <div className={`p-3 rounded-md ${
              message.includes('successful') || message.includes('Verification') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading 
                ? 'bg-gray-400' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            {mode === 'login' 
              ? 'Need an account? Sign up' 
              : 'Already have an account? Login'}
          </button>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          <p className="mt-2">Your data is protected with enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
