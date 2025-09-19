
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthStateChange = useCallback((event: any, session: Session | null) => {
    console.log('Auth state changed:', event, session?.user?.email);
    setSession(session);
    setUser(session?.user ?? null);
    
    if (event === 'SIGNED_IN') {
      setTimeout(() => {
        toast({
          title: 'Successfully signed in',
          description: 'Welcome to Luvlang!',
        });
        
        // Redirect to dashboard if on auth page
        if (location.pathname === '/auth') {
          navigate('/dashboard');
        }
      }, 100);
    } else if (event === 'SIGNED_OUT') {
      setTimeout(() => {
        toast({
          title: 'Signed out',
          description: 'Come back soon!',
        });
        navigate('/auth');
      }, 100);
    }
    
    setLoading(false);
  }, [location.pathname, navigate, toast]);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        navigate('/auth');
      } else if (!requireAuth && user && location.pathname === '/auth') {
        navigate('/dashboard');
      } else if (!requireAuth && user && location.pathname === '/') {
        // Allow authenticated users to see the landing page - don't redirect
        return;
      }
    }
  }, [user, loading, requireAuth, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
