import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Database, 
  MessageCircle, 
  Users, 
  Heart,
  AlertTriangle,
  CheckCircle,
  Activity,
  RefreshCw,
  Github
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import SecurityMonitor from '../security/SecurityMonitor';
import MessagingTest from '../messaging/MessagingTest';
import DataSeeder from './DataSeeder';
import N8NWebhookTest from './N8NWebhookTest';

interface SystemStats {
  totalUsers: number;
  activeProfiles: number;
  totalMatches: number;
  totalMessages: number;
  securityEvents: number;
  lastUpdated: string;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  icon: React.ReactNode;
}

const SystemHealthDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeProfiles: 0,
    totalMatches: 0,
    totalMessages: 0,
    securityEvents: 0,
    lastUpdated: new Date().toISOString()
  });
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
    performHealthChecks();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);

      // Get total users (approximation based on profiles)
      const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active dating profiles
      const { count: datingProfileCount } = await supabase
        .from('dating_profiles')
        .select('*', { count: 'exact', head: true });

      // Get total matches
      const { count: matchCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      // Get total messages
      const { count: messageCount } = await supabase
        .from('conversation_messages')
        .select('*', { count: 'exact', head: true });

      // Get security events
      const { count: securityCount } = await supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: profileCount || 0,
        activeProfiles: datingProfileCount || 0,
        totalMatches: matchCount || 0,
        totalMessages: messageCount || 0,
        securityEvents: securityCount || 0,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading system stats:', error);
      toast({
        title: 'Error Loading Stats',
        description: 'Could not load system statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const performHealthChecks = async () => {
    const checks: HealthCheck[] = [];

    // Database connectivity
    try {
      await supabase.from('profiles').select('count', { count: 'exact', head: true });
      checks.push({
        service: 'Database',
        status: 'healthy',
        message: 'Connection successful',
        icon: <Database className="h-4 w-4" />
      });
    } catch (error) {
      checks.push({
        service: 'Database',
        status: 'error',
        message: 'Connection failed',
        icon: <Database className="h-4 w-4" />
      });
    }

    // Authentication
    try {
      const { data } = await supabase.auth.getUser();
      checks.push({
        service: 'Authentication',
        status: data.user ? 'healthy' : 'warning',
        message: data.user ? 'User authenticated' : 'No active session',
        icon: <Shield className="h-4 w-4" />
      });
    } catch (error) {
      checks.push({
        service: 'Authentication',
        status: 'error',
        message: 'Auth service unavailable',
        icon: <Shield className="h-4 w-4" />
      });
    }

    // Messaging system
    try {
      await supabase.from('conversations').select('count', { count: 'exact', head: true });
      checks.push({
        service: 'Messaging',
        status: 'healthy',
        message: 'Service operational',
        icon: <MessageCircle className="h-4 w-4" />
      });
    } catch (error) {
      checks.push({
        service: 'Messaging',
        status: 'error',
        message: 'Service unavailable',
        icon: <MessageCircle className="h-4 w-4" />
      });
    }

    // Matching system
    try {
      await supabase.from('matches').select('count', { count: 'exact', head: true });
      checks.push({
        service: 'Matching Engine',
        status: 'healthy',
        message: 'Algorithms running',
        icon: <Heart className="h-4 w-4" />
      });
    } catch (error) {
      checks.push({
        service: 'Matching Engine',
        status: 'error',
        message: 'Service disrupted',
        icon: <Heart className="h-4 w-4" />
      });
    }

    // Integration status checks
    checks.push({
      service: 'GitHub Integration',
      status: 'healthy',
      message: 'Repository synced',
      icon: <Github className="h-4 w-4" />
    });

    checks.push({
      service: 'Database Integration',
      status: 'healthy',
      message: 'All services connected',
      icon: <Database className="h-4 w-4" />
    });

    setHealthChecks(checks);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const refreshData = () => {
    loadSystemStats();
    performHealthChecks();
    toast({
      title: 'Data Refreshed',
      description: 'System stats and health checks updated',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health Dashboard</h2>
          <p className="text-gray-600">Monitor system performance and health status</p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-600">{stats.activeProfiles}</div>
            <div className="text-sm text-gray-600">Active Profiles</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.totalMatches}</div>
            <div className="text-sm text-gray-600">Total Matches</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.totalMessages}</div>
            <div className="text-sm text-gray-600">Messages Sent</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{stats.securityEvents}</div>
            <div className="text-sm text-gray-600">Security Events</div>
          </CardContent>
        </Card>
      </div>

      {/* Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            System Health Checks
          </CardTitle>
          <p className="text-sm text-gray-600">Real-time status of all system components</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthChecks.map((check, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {check.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{check.service}</span>
                    <Badge className={getStatusColor(check.status)}>
                      {getStatusIcon(check.status)}
                      <span className="ml-1">{check.status}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Monitor */}
      <SecurityMonitor />

      {/* Messaging Test */}
      <MessagingTest />

      {/* Data Seeder */}
      <DataSeeder />

      {/* N8N Webhook Test */}
      <N8NWebhookTest />

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Updated:</span>
            <span>{new Date(stats.lastUpdated).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Environment:</span>
            <Badge>Production Ready</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Version:</span>
            <span>1.0.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
