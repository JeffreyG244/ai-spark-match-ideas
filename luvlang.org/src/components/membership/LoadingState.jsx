import React from 'react';
const LoadingState = () => {
    return (<div className="flex justify-center items-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading membership plans...</p>
      </div>
    </div>);
};
export default LoadingState;
