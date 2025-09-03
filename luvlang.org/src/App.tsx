import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AuthGuard from '@/components/auth/AuthGuard';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import AnalysisResults from '@/pages/AnalysisResults';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AlertProvider } from '@/components/providers/AlertProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/auth" 
                element={
                  <AuthGuard requireAuth={false}>
                    <Auth />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <AuthGuard requireAuth={true}>
                    <Dashboard />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/analysis-results" 
                element={
                  <AuthGuard requireAuth={true}>
                    <AnalysisResults />
                  </AuthGuard>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </AlertProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;