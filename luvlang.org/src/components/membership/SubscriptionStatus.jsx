import React from 'react';
const SubscriptionStatus = ({ userSubscription }) => {
    if (!userSubscription)
        return null;
    return (<div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="font-semibold text-purple-900">Current Subscription</h3>
      <p className="text-purple-700">
        Status: <span className="capitalize">{userSubscription.status}</span>
      </p>
      {userSubscription.current_period_end && (<p className="text-purple-700">
          Next billing: {new Date(userSubscription.current_period_end).toLocaleDateString()}
        </p>)}
    </div>);
};
export default SubscriptionStatus;
