import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
const SecurityFooter = ({ lastSecurityCheck, onRunSecurityScan }) => {
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
    return (<>
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Last scan: </span>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(lastSecurityCheck)}
          </span>
        </div>
        <Badge className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1"/>
          Enabled
        </Badge>
      </div>
      
      <div className="pt-2 flex justify-center">
        <button onClick={onRunSecurityScan} className="text-xs px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-full transition-colors">
          Run Security Scan
        </button>
      </div>
    </>);
};
export default SecurityFooter;
