
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SecurityMetricsProps {
  totalScans: number;
  threatsBlocked: number;
}

const SecurityMetrics: React.FC<SecurityMetricsProps> = ({
  totalScans,
  threatsBlocked
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-3 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{totalScans}</div>
        <div className="text-xs text-gray-600">Security Scans</div>
      </div>
      <div className="text-center p-3 bg-red-50 rounded-lg">
        <div className="text-2xl font-bold text-red-600">{threatsBlocked}</div>
        <div className="text-xs text-gray-600">Threats Blocked</div>
      </div>
    </div>
  );
};

export default SecurityMetrics;
