
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { 
  getSecurityLogs, 
  resolveSecurityLog, 
  checkUserRole,
  SecurityLogEntry 
} from '@/utils/enhancedSecurity';
import { formatDistanceToNow } from 'date-fns';

const SecurityDashboard: React.FC = () => {
  const [securityLogs, setSecurityLogs] = useState<SecurityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterResolved, setFilterResolved] = useState<string>('all');

  useEffect(() => {
    checkAdminStatus();
    loadSecurityLogs();
  }, []);

  const checkAdminStatus = async () => {
    const adminStatus = await checkUserRole('admin');
    setIsAdmin(adminStatus);
  };

  const loadSecurityLogs = async () => {
    try {
      setLoading(true);
      const logs = await getSecurityLogs(100);
      setSecurityLogs(logs);
    } catch (error) {
      console.error('Failed to load security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveLog = async (logId: string) => {
    try {
      await resolveSecurityLog(logId);
      await loadSecurityLogs(); // Refresh the logs
    } catch (error) {
      console.error('Failed to resolve security log:', error);
    }
  };

  const filteredLogs = securityLogs.filter(log => {
    if (filterSeverity !== 'all' && log.severity !== filterSeverity) return false;
    if (filterResolved === 'resolved' && !log.resolved) return false;
    if (filterResolved === 'unresolved' && log.resolved) return false;
    return true;
  });

  const severityStats = {
    critical: securityLogs.filter(log => log.severity === 'critical' && !log.resolved).length,
    high: securityLogs.filter(log => log.severity === 'high' && !log.resolved).length,
    medium: securityLogs.filter(log => log.severity === 'medium' && !log.resolved).length,
    low: securityLogs.filter(log => log.severity === 'low' && !log.resolved).length,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the security dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2">Loading security dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-green-600" />
          Security Dashboard
        </h1>
        <Button onClick={loadSecurityLogs} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severityStats.critical}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severityStats.high}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Medium Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severityStats.medium}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Low Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severityStats.low}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Severity</label>
            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select 
              value={filterResolved} 
              onChange={(e) => setFilterResolved(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="all">All</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Security Events ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className={`p-4 border rounded-lg ${log.resolved ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{log.event_type}</span>
                      {log.resolved ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {typeof log.details === 'object' ? 
                        log.details.message || JSON.stringify(log.details, null, 2) : 
                        log.details
                      }
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(log.created_at!), { addSuffix: true })}
                      </span>
                      {log.user_id && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          User: {log.user_id.slice(-8)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!log.resolved && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleResolveLog(log.id!)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No security events found matching the current filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
