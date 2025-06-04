
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import SecurityStatus from './security/SecurityStatus';
import SecurityMetrics from './security/SecurityMetrics';
import SecurityActivity from './security/SecurityActivity';
import SecurityFooter from './security/SecurityFooter';
import { loadSecurityLogs, updateSecurityMetrics, addManualScanEvent, SecurityEvent } from '@/utils/securityUtils';

const SecurityMonitor = () => {
  const { securityStatus, performSecurityCheck } = useSecurityMonitoring();
  const [securityMetrics, setSecurityMetrics] = useState({
    totalScans: 1247,
    threatsBlocked: 23,
    profilesVerified: 156,
    activeMonitoring: true
  });

  const [recentActivity, setRecentActivity] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    // Load security events and update metrics
    const events = loadSecurityLogs();
    setRecentActivity(events);
    
    // Update metrics if we have stored logs
    try {
      const storedLogs = localStorage.getItem('security_logs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs)) {
          const metrics = updateSecurityMetrics(parsedLogs);
          setSecurityMetrics(prev => ({
            ...prev,
            totalScans: metrics.totalScans,
            threatsBlocked: metrics.threatsBlocked
          }));
        }
      }
    } catch (error) {
      console.error('Error processing security logs:', error);
    }
    
    // Run a security check on component mount
    performSecurityCheck();
  }, [performSecurityCheck]);

  const handleRunSecurityScan = () => {
    performSecurityCheck();
    const scanEvent = addManualScanEvent();
    setRecentActivity(prev => [scanEvent, ...prev]);
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
        <SecurityStatus 
          sessionValid={securityStatus.sessionValid}
          deviceTrusted={securityStatus.deviceTrusted}
        />

        <SecurityMetrics 
          totalScans={securityMetrics.totalScans}
          threatsBlocked={securityMetrics.threatsBlocked}
        />

        <SecurityActivity recentActivity={recentActivity} />

        <SecurityFooter 
          lastSecurityCheck={securityStatus.lastSecurityCheck}
          onRunSecurityScan={handleRunSecurityScan}
        />
      </CardContent>
    </Card>
  );
};

export default SecurityMonitor;
