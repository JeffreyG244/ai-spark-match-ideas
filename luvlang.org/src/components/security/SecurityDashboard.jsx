import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock, Users, Settings } from 'lucide-react';
import { CriticalSecurityService } from '@/services/security/CriticalSecurityService';
import { SecureConfigService } from '@/services/security/SecureConfigService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
export const SecurityDashboard = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const loadSecurityMetrics = async () => {
        if (!user)
            return;
        try {
            // Get session security status
            const sessionData = await CriticalSecurityService.validateSecureSession();
            // Check configuration integrity
            const configValidation = await SecureConfigService.validateConfigIntegrity();
            // Get recent security events
            const { data: events } = await supabase
                .from('security_logs')
                .select('id, event_type, severity, created_at, details')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);
            // Get rate limit status (simplified check)
            const rateLimitConfig = await SecureConfigService.getRateLimitConfig();
            setMetrics({
                sessionSecurity: {
                    isValid: sessionData.isValid,
                    sessionAge: sessionData.sessionAge,
                    deviceTrusted: !!sessionData.deviceFingerprint
                },
                rateLimitStatus: {
                    nearLimit: false, // This would need actual rate limit checking
                    blocked: false,
                    currentLimits: rateLimitConfig
                },
                systemSecurity: {
                    configValid: configValidation.valid,
                    configIssues: configValidation.issues
                },
                recentEvents: events || []
            });
        }
        catch (error) {
            console.error('Failed to load security metrics:', error);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadSecurityMetrics();
    };
    useEffect(() => {
        loadSecurityMetrics();
        // Refresh every 30 seconds
        const interval = setInterval(loadSecurityMetrics, 30000);
        return () => clearInterval(interval);
    }, [user]);
    if (!user) {
        return (<Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Please log in to view security dashboard
          </div>
        </CardContent>
      </Card>);
    }
    if (loading) {
        return (<Card>
        <CardContent className="p-6">
          <div className="text-center">Loading security metrics...</div>
        </CardContent>
      </Card>);
    }
    if (!metrics) {
        return (<Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Failed to load security metrics
          </div>
        </CardContent>
      </Card>);
    }
    const getSecurityScore = () => {
        let score = 100;
        if (!metrics.sessionSecurity.isValid)
            score -= 40;
        if (!metrics.sessionSecurity.deviceTrusted)
            score -= 20;
        if (!metrics.systemSecurity.configValid)
            score -= 30;
        if (metrics.rateLimitStatus.blocked)
            score -= 25;
        if (metrics.recentEvents.some(e => e.severity === 'critical'))
            score -= 15;
        if (score >= 90)
            return { score, status: 'Excellent', color: 'text-green-600' };
        if (score >= 70)
            return { score, status: 'Good', color: 'text-yellow-600' };
        if (score >= 50)
            return { score, status: 'Fair', color: 'text-orange-600' };
        return { score, status: 'Poor', color: 'text-red-600' };
    };
    const securityScore = getSecurityScore();
    return (<div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5"/>
            Security Overview
          </CardTitle>
          <CardDescription>
            Real-time security status and metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${securityScore.color}`}>
                {securityScore.score}%
              </div>
              <div className="text-sm text-muted-foreground">Security Score</div>
              <Badge variant={securityScore.score >= 70 ? 'default' : 'destructive'}>
                {securityScore.status}
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                {metrics.sessionSecurity.isValid ?
            <CheckCircle className="h-8 w-8 text-green-600"/> :
            <XCircle className="h-8 w-8 text-red-600"/>}
              </div>
              <div className="text-sm text-muted-foreground">Session Status</div>
              <Badge variant={metrics.sessionSecurity.isValid ? 'default' : 'destructive'}>
                {metrics.sessionSecurity.isValid ? 'Valid' : 'Invalid'}
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                {metrics.sessionSecurity.deviceTrusted ?
            <Shield className="h-8 w-8 text-green-600"/> :
            <AlertTriangle className="h-8 w-8 text-yellow-600"/>}
              </div>
              <div className="text-sm text-muted-foreground">Device Trust</div>
              <Badge variant={metrics.sessionSecurity.deviceTrusted ? 'default' : 'secondary'}>
                {metrics.sessionSecurity.deviceTrusted ? 'Trusted' : 'New Device'}
              </Badge>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                {metrics.systemSecurity.configValid ?
            <Settings className="h-8 w-8 text-green-600"/> :
            <AlertTriangle className="h-8 w-8 text-red-600"/>}
              </div>
              <div className="text-sm text-muted-foreground">System Config</div>
              <Badge variant={metrics.systemSecurity.configValid ? 'default' : 'destructive'}>
                {metrics.systemSecurity.configValid ? 'Valid' : 'Issues'}
              </Badge>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Issues */}
      {!metrics.systemSecurity.configValid && (<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5"/>
              Configuration Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.systemSecurity.configIssues.map((issue, index) => (<div key={index} className="flex items-center gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0"/>
                  <span>{issue}</span>
                </div>))}
            </div>
          </CardContent>
        </Card>)}

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5"/>
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Latest security events for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.recentEvents.length === 0 ? (<div className="text-center text-muted-foreground py-4">
              No recent security events
            </div>) : (<div className="space-y-3">
              {metrics.recentEvents.map((event) => (<div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={event.severity === 'critical' ? 'destructive' :
                    event.severity === 'high' ? 'destructive' :
                        event.severity === 'medium' ? 'secondary' : 'default'}>
                      {event.severity}
                    </Badge>
                    <div>
                      <div className="font-medium">{event.event_type.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {event.severity === 'critical' && (<AlertTriangle className="h-5 w-5 text-destructive"/>)}
                </div>))}
            </div>)}
        </CardContent>
      </Card>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5"/>
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Session Age</div>
              <div className="font-medium">
                {Math.floor(metrics.sessionSecurity.sessionAge / (1000 * 60 * 60))} hours
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">User ID</div>
              <div className="font-medium font-mono text-xs">
                {user.id.substring(0, 8)}...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
};
export default SecurityDashboard;
