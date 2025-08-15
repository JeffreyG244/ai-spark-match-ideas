import React from 'react';
const WelcomeSection = ({ user }) => {
    return (<div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
      </h1>
      <p className="text-xl text-gray-600">
        Ready to find your perfect match? Choose what you'd like to do next.
      </p>
    </div>);
};
export default WelcomeSection;
