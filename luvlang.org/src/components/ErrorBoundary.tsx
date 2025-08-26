import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-love-background flex items-center justify-center p-4">
          <div className="bg-love-card border border-love-border rounded-lg p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-love-text mb-4">Something went wrong</h1>
            <p className="text-love-text-muted mb-4">
              We're sorry, but something went wrong. Please refresh the page and try again.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-love-primary text-white px-4 py-2 rounded-lg hover:bg-love-primary/80 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;