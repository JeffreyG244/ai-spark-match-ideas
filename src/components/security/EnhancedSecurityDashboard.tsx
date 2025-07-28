import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Clock, Fingerprint } from 'lucide-react';
import { EnhancedSecurityService } from '@/utils/enhancedSecurityService';
import { SECURITY_CONFIG } from '@/utils/securityConfig';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetrics {
  sessionAge: number;
  deviceTrusted: boolean;
  securityScore: number;
  recentAlerts: number;
  suspiciousActivity: boolean;
}

export const EnhancedSecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    sessionAge: 0,
    deviceTrusted: false,
    securityScore: 0,
    recentAlerts: 0,
    suspiciousActivity: false
  });
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecurityMetrics();
      loadSecurityLogs();
    }
  }, [user]);

  const loadSecurityMetrics = async () => {
    try {
      // Generate device fingerprint
      const fingerprint = EnhancedSecurityService.generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);

      // Check for suspicious activity
      const suspiciousCheck = EnhancedSecurityService.detectSuspiciousActivity();

      // Calculate session age
      const lastActivity = localStorage.getItem('last_activity');
      const sessionAge = lastActivity ? Date.now() - parseInt(lastActivity) : 0;

      // Calculate security score based on various factors
      let score = 100;
      
      if (sessionAge > SECURITY_CONFIG.SESSION_TIMEOUT) score -= 20;
      if (suspiciousCheck.isSuspicious) score -= 30;
      if (!fingerprint) score -= 15;
      
      // Check password strength if available
      const passwordScore = localStorage.getItem('password_strength_score');
      if (passwordScore && parseInt(passwordScore) < SECURITY_CONFIG.PASSWORD_MIN_SCORE) {
        score -= 25;
      }

      setMetrics({
        sessionAge,
        deviceTrusted: fingerprint.length > 0,
        securityScore: Math.max(0, score),
        recentAlerts: suspiciousCheck.reasons.length,
        suspiciousActivity: suspiciousCheck.isSuspicious
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading security metrics:', error);
      setLoading(false);
    }
  };

  const loadSecurityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading security logs:', error);
        return;
      }

      setSecurityLogs(data || []);
    } catch (error) {
      console.error('Error loading security logs:', error);
    }
  };

  const handleSecurityScan = async () => {
    setLoading(true);
    
    // Perform comprehensive security scan
    await EnhancedSecurityService.monitorSessionSecurity();
    
    // Reload metrics
    await loadSecurityMetrics();
    await loadSecurityLogs();
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getSecurityScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
          <CardDescription>
            Monitor your account security and recent activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Security Score */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Security Score</span>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={metrics.securityScore} 
                  className="h-2"
                  style={{
                    '--progress-foreground': getSecurityScoreColor(metrics.securityScore)
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{getSecurityScoreText(metrics.securityScore)}</span>
                  <span>{metrics.securityScore}%</span>
                </div>
              </div>
            </div>

            {/* Session Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Session Age</span>
              </div>
              <div className="text-lg font-semibold">
                {formatDuration(metrics.sessionAge)}
              </div>
            </div>

            {/* Device Trust */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4" />
                <span className="text-sm font-medium">Device Status</span>
              </div>
              <div className="flex items-center gap-2">
                {metrics.deviceTrusted ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm">
                  {metrics.deviceTrusted ? 'Trusted' : 'Unverified'}
                </span>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Recent Alerts</span>
              </div>
              <div className="text-lg font-semibold">
                {metrics.recentAlerts}
              </div>
            </div>
          </div>

          {/* Security Alerts */}
          {metrics.suspiciousActivity && (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Suspicious activity detected on your account. Please review recent activity and consider changing your password.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSecurityScan} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Activity</CardTitle>
          <CardDescription>
            Your recent security events and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent security activity
            </div>
          ) : (
            <div className="space-y-3">
              {securityLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.event_type.replace('_', ' ')}</span>
                      {getSeverityBadge(log.severity)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
          <CardDescription>
            Current device fingerprint and security status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium">Device Fingerprint:</span>
              <div className="font-mono text-xs mt-1 p-2 bg-muted rounded">
                {deviceFingerprint}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">User Agent:</span>
              <div className="text-xs mt-1 p-2 bg-muted rounded break-all">
                {navigator.userAgent}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};