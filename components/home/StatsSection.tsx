
import React from 'react';

const stats = [
  { number: "96%", label: "Compatibility Accuracy" },
  { number: "89%", label: "Long-term Success Rate" },
  { number: "30-45", label: "Target Age Range" },
  { number: "100%", label: "Verified Profiles" }
];

const StatsSection = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stat.number}</div>
          <div className="text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;
