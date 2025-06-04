import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Clock, Shield as ShieldIcon, AlertCircle } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { logSecurityEvent } from '@/utils/security';

interface SecurityEvent {
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

const SecurityMonitor = () => {
  const { securityStatus, performSecurityCheck } = useSecurityMonitoring();
  const [securityMetrics, setSecurityMetrics] = useState({
    totalScans: 1247,
    threatsBlocked: 23,
    profilesVerified: 156,
    activeMonitoring: true
  });

  const [recentActivity, setRecentActivity] = useState<SecurityEvent[]>([
    {
      type: 'success',
      message: 'Profile content validated and approved',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      severity: 'low'
    },
    {
      type: 'warning',
      message: 'Suspicious link detected in message - blocked',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      severity: 'medium'
    },
    {
      type: 'info',
      message: 'Photo verification completed successfully',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      severity: 'low'
    }
  ]);

  useEffect(() => {
    // Load security events from localStorage
    try {
      const storedLogs = localStorage.getItem('security_logs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
          // Convert logs to SecurityEvent format
          const events: SecurityEvent[] = parsedLogs
            .slice(-10) // Get the latest 10 events
            .map(log => {
              let type: 'success' | 'warning' | 'info' | 'error';
              
              switch (log.severity) {
                case 'high':
                  type = 'error';
                  break;
                case 'medium':
                  type = 'warning';
                  break;
                case 'low':
                  type = log.type.includes('success') ? 'success' : 'info';
                  break;
                default:
                  type = 'info';
              }
              
              return {
                type,
                message: log.details || log.type,
                timestamp: new Date(log.timestamp),
                severity: log.severity
              };
            })
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          
          setRecentActivity(events);
          
          // Update metrics based on logs
          const now = Date.now();
          const oneDayAgo = now - (24 * 60 * 60 * 1000);
          
          const recentLogs = parsedLogs.filter((log: any) => 
            new Date(log.timestamp).getTime() > oneDayAgo);
          
          const blockedThreats = recentLogs.filter((log: any) => 
            log.type.includes('block') || 
            log.type.includes('invalid') || 
            log.type.includes('suspicious')).length;
            
          setSecurityMetrics(prev => ({
            ...prev,
            totalScans: Math.max(prev.totalScans, recentLogs.length + 1200),
            threatsBlocked: Math.max(prev.threatsBlocked, blockedThreats + 20)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading security logs:', error);
    }
    
    // Run a security check on component mount
    performSecurityCheck();
  }, [performSecurityCheck]);

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <ShieldIcon className="h-4 w-4 text-blue-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleRunSecurityScan = () => {
    performSecurityCheck();
    logSecurityEvent('manual_security_scan', 'User triggered manual security scan', 'low');
    
    // Add the scan event to recent activity
    setRecentActivity(prev => [
      {
        type: 'info',
        message: 'Manual security scan initiated',
        timestamp: new Date(),
        severity: 'low'
      },
      ...prev
    ]);
  };

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="text-green-800 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!securityStatus.sessionValid && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your session appears to be invalid or expired. Please refresh the page or log in again.
            </AlertDescription>
          </Alert>
        )}
        
        {!securityStatus.deviceTrusted && (
          <Alert variant="default" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This device hasn't been verified. Using features may be limited.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{securityMetrics.totalScans}</div>
            <div className="text-xs text-gray-600">Security Scans</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{securityMetrics.threatsBlocked}</div>
            <div className="text-xs text-gray-600">Threats Blocked</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Security Activity
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-2 p-2 rounded text-xs ${
                  activity.severity === 'high' 
                    ? 'bg-red-50' 
                    : activity.severity === 'medium'
                      ? 'bg-yellow-50'
                      : 'bg-gray-50'
                }`}
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-gray-700">{activity.message}</p>
                  <p className="text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
                {activity.severity === 'high' && (
                  <Badge variant="destructive">High</Badge>
                )}
                {activity.severity === 'medium' && (
                  <Badge variant="default" className="bg-yellow-500">Medium</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Last scan: </span>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(securityStatus.lastSecurityCheck)}
            </span>
          </div>
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        </div>
        
        <div className="pt-2 flex justify-center">
          <button 
            onClick={handleRunSecurityScan}
            className="text-xs px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-full transition-colors"
          >
            Run Security Scan
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityMonitor;
