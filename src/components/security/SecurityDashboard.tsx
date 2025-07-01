
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Lock,
  Eye,
  RefreshCw
} from 'lucide-react';
import { EnhancedSecurityService } from '@/services/security/EnhancedSecurityService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SecurityMetrics {
  totalScans: number;
  threatsBlocked: number;
  sessionHealth: number;
  lastSecurityCheck: Date;
  recentAlerts: SecurityAlert[];
}

interface SecurityAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalScans: 0,
    threatsBlocked: 0,
    sessionHealth: 85,
    lastSecurityCheck: new Date(),
    recentAlerts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecurityMetrics();
    }
  }, [user]);

  const loadSecurityMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Load recent security logs
      const { data: logs, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Calculate metrics
      const threats = logs?.filter(log => 
        log.severity === 'high' || log.severity === 'critical'
      ).length || 0;

      const alerts: SecurityAlert[] = logs?.map(log => ({
        id: log.id,
        type: getAlertType(log.severity),
        message: getAlertMessage(log.event_type, log.details),
        timestamp: new Date(log.created_at!),
        severity: log.severity as any
      })) || [];

      // Session health calculation
      const sessionCheck = await EnhancedSecurityService.validateSession();
      let sessionHealth = sessionCheck.isValid ? 100 : 0;
      
      if (sessionCheck.isValid && sessionCheck.user) {
        const sessionAge = Date.now() - new Date(sessionCheck.user.last_sign_in_at || 0).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        sessionHealth = Math.max(0, 100 - (sessionAge / maxAge) * 100);
      }

      setMetrics({
        totalScans: logs?.length || 0,
        threatsBlocked: threats,
        sessionHealth: Math.round(sessionHealth),
        lastSecurityCheck: new Date(),
        recentAlerts: alerts.slice(0, 5)
      });

    } catch (error) {
      console.error('Failed to load security metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertType = (severity: string): 'info' | 'warning' | 'error' | 'success' => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'success';
    }
  };

  const getAlertMessage = (eventType: string, details: any): string => {
    const messages: Record<string, string> = {
      'dangerous_content_detected': 'Blocked dangerous content in submission',
      'rate_limit_exceeded': 'Rate limit exceeded - access temporarily restricted',
      'session_validation_failed': 'Session validation failed',
      'suspicious_login': 'Suspicious login attempt detected',
      'profile_updated': 'Profile updated successfully',
      'password_changed': 'Password changed successfully'
    };

    return messages[eventType] || eventType.replace(/_/g, ' ');
  };

  const getHealthColor = (health: number): string => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    if (health >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthBadgeVariant = (health: number): 'default' | 'secondary' | 'destructive' => {
    if (health >= 80) return 'default';
    if (health >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading security metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security Dashboard
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadSecurityMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalScans}</div>
            <div className="text-sm text-gray-600">Security Scans</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{metrics.threatsBlocked}</div>
            <div className="text-sm text-gray-600">Threats Blocked</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className={`text-2xl font-bold ${getHealthColor(metrics.sessionHealth)}`}>
              {metrics.sessionHealth}%
            </div>
            <div className="text-sm text-gray-600">Session Health</div>
          </div>
        </div>

        {/* Session Health Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Session Security</span>
            <Badge variant={getHealthBadgeVariant(metrics.sessionHealth)}>
              {metrics.sessionHealth >= 80 ? 'Excellent' : 
               metrics.sessionHealth >= 60 ? 'Good' : 
               metrics.sessionHealth >= 40 ? 'Fair' : 'Poor'}
            </Badge>
          </div>
          <Progress 
            value={metrics.sessionHealth} 
            className="h-2"
          />
        </div>

        {/* Recent Security Alerts */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Recent Security Activity
          </h4>
          {metrics.recentAlerts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>No recent security alerts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {metrics.recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {alert.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {alert.type === 'info' && <Shield className="h-4 w-4 text-blue-500" />}
                  {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  
                  <Badge 
                    variant={alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last Security Check */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            Last check: {metrics.lastSecurityCheck.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Protected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityDashboard;
