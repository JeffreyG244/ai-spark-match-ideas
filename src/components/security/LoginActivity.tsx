import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Activity, MapPin, Monitor, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginSession {
  id: string;
  timestamp: string;
  location?: string;
  device: string;
  ip_address: string;
  status: 'success' | 'failed' | 'suspicious';
  user_agent: string;
}

export const LoginActivity = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLoginActivity();
  }, []);

  const loadLoginActivity = async () => {
    setIsLoading(true);
    try {
      // Since Supabase doesn't provide login history by default, we'll simulate it
      // In a real implementation, you'd store login events in a custom table
      const mockSessions: LoginSession[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          location: 'New York, NY',
          device: 'Desktop',
          ip_address: '192.168.1.1',
          status: 'success',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          location: 'Los Angeles, CA',
          device: 'Mobile',
          ip_address: '10.0.0.1',
          status: 'success',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          location: 'Chicago, IL',
          device: 'Desktop',
          ip_address: '192.168.1.100',
          status: 'failed',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      ];

      // Check for any real auth events from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Add current session
        const currentSession: LoginSession = {
          id: 'current',
          timestamp: new Date().toISOString(),
          location: 'Current Location',
          device: getDeviceType(),
          ip_address: 'Current IP',
          status: 'success',
          user_agent: navigator.userAgent
        };
        setSessions([currentSession, ...mockSessions]);
      } else {
        setSessions(mockSessions);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load login activity.",
        variant: "destructive"
      });
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'Tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'Mobile';
    }
    return 'Desktop';
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'suspicious':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Login Activity
        </CardTitle>
        <CardDescription className="text-slate-300">
          Review your recent login sessions and security events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-white">Loading activity...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <div className="text-slate-300">No login activity found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device)}
                      {getStatusIcon(session.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">{session.device} Login</h4>
                        {session.id === 'current' && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="text-slate-300 text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {session.location || 'Unknown Location'}
                        </div>
                        <div>IP: {session.ip_address}</div>
                        <div className="text-slate-400 text-xs">
                          {session.user_agent.substring(0, 80)}...
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {formatTimestamp(session.timestamp)}
                  </div>
                </div>
                
                {session.status === 'failed' && (
                  <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                    Failed login attempt - verify this was you
                  </div>
                )}
                
                {session.status === 'suspicious' && (
                  <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-sm">
                    Suspicious activity detected - please review
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-4">
              <Button
                onClick={loadLoginActivity}
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              >
                Refresh Activity
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginActivity;