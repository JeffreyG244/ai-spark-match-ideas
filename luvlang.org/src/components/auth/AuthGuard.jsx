import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
const AuthGuard = ({ children, requireAuth = true }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            if (event === 'SIGNED_IN') {
                toast({
                    title: 'Successfully signed in',
                    description: 'Welcome to Luvlang!',
                });
                // Redirect to dashboard if on auth page
                if (location.pathname === '/auth') {
                    navigate('/dashboard');
                }
            }
            else if (event === 'SIGNED_OUT') {
                toast({
                    title: 'Signed out',
                    description: 'Come back soon!',
                });
                navigate('/auth');
            }
            setLoading(false);
        });
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, [navigate, location.pathname]);
    useEffect(() => {
        if (!loading) {
            if (requireAuth && !user) {
                navigate('/auth');
            }
            else if (!requireAuth && user && location.pathname === '/auth') {
                navigate('/dashboard');
            }
        }
    }, [user, loading, requireAuth, navigate, location.pathname]);
    if (loading) {
        return (<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>);
    }
    return <>{children}</>;
};
export default AuthGuard;
