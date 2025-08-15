import React from 'react';
const BillingCycleToggle = ({ billingCycle, setBillingCycle }) => {
    return (<div className="flex justify-center mb-6">
      <div className="bg-gray-100 p-1 rounded-lg">
        <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-2 rounded-md transition-colors ${billingCycle === 'monthly'
            ? 'bg-white shadow-sm text-purple-600'
            : 'text-gray-600 hover:text-gray-900'}`}>
          Monthly
        </button>
        <button onClick={() => setBillingCycle('annual')} className={`px-4 py-2 rounded-md transition-colors ${billingCycle === 'annual'
            ? 'bg-white shadow-sm text-purple-600'
            : 'text-gray-600 hover:text-gray-900'}`}>
          Annual (20% off)
        </button>
      </div>
    </div>);
};
export default BillingCycleToggle;
