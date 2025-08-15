import React from 'react';
import { Button } from '@/components/ui/button';
const EmptyPlansState = ({ onRefresh }) => {
    return (<div className="flex justify-center items-center min-h-[400px]">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Plans Available</h3>
        <p className="text-gray-600 mb-4">Membership plans are not currently available.</p>
        <Button onClick={onRefresh} variant="outline">
          Refresh
        </Button>
      </div>
    </div>);
};
export default EmptyPlansState;
