import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Shield as ShieldIcon, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
const SecurityActivity = ({ recentActivity }) => {
    const formatTimeAgo = (date) => {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24)
            return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };
    const getActivityIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500"/>;
            case 'info': return <ShieldIcon className="h-4 w-4 text-blue-500"/>;
            case 'error': return <AlertCircle className="h-4 w-4 text-red-500"/>;
            default: return <ShieldIcon className="h-4 w-4 text-gray-500"/>;
        }
    };
    const getSeverityBadge = (severity) => {
        if (severity === 'critical') {
            return <Badge variant="destructive">Critical</Badge>;
        }
        if (severity === 'high') {
            return <Badge variant="destructive">High</Badge>;
        }
        if (severity === 'medium') {
            return <Badge variant="default" className="bg-yellow-500">Medium</Badge>;
        }
        return null;
    };
    return (<div className="space-y-2">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Clock className="h-4 w-4"/>
        Recent Security Activity
      </h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {recentActivity.map((activity, index) => (<div key={index} className={`flex items-start gap-2 p-2 rounded text-xs ${activity.severity === 'critical' || activity.severity === 'high'
                ? 'bg-red-50'
                : activity.severity === 'medium'
                    ? 'bg-yellow-50'
                    : 'bg-gray-50'}`}>
            {getActivityIcon(activity.type)}
            <div className="flex-1">
              <p className="text-gray-700">{activity.message}</p>
              <p className="text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
            </div>
            {getSeverityBadge(activity.severity)}
          </div>))}
      </div>
    </div>);
};
export default SecurityActivity;
