
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Eye, Clock } from 'lucide-react';

const SecurityMonitor = () => {
  const [securityMetrics, setSecurityMetrics] = useState({
    totalScans: 1247,
    threatsBlocked: 23,
    profilesVerified: 156,
    activeMonitoring: true
  });

  const [recentActivity, setRecentActivity] = useState([
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
      case 'info': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
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
              <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-xs">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-gray-700">{activity.message}</p>
                  <p className="text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-600">Active Protection</span>
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityMonitor;
