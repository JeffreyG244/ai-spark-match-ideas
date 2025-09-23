import React from 'react';

// Debug component to verify environment variables (staging only)
const EnvDebug = () => {
  // Only show in staging environment
  if (import.meta.env.VITE_ENVIRONMENT !== 'staging') {
    return null;
  }

  const envVars = {
    'VITE_ENVIRONMENT': import.meta.env.VITE_ENVIRONMENT,
    'VITE_APP_NAME': import.meta.env.VITE_APP_NAME,
    'VITE_APP_VERSION': import.meta.env.VITE_APP_VERSION,
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    'VITE_ENABLE_ANALYTICS': import.meta.env.VITE_ENABLE_ANALYTICS,
    'VITE_ENABLE_PWA': import.meta.env.VITE_ENABLE_PWA,
    'VITE_ENABLE_SENTRY': import.meta.env.VITE_ENABLE_SENTRY,
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold text-purple-300 mb-2">🔧 Staging Environment Debug</div>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} className="flex justify-between mb-1">
          <span className="text-gray-300">{key}:</span>
          <span className={value === '❌ Missing' ? 'text-red-400' : 'text-green-400'}>
            {String(value)}
          </span>
        </div>
      ))}
      <div className="text-xs text-gray-400 mt-2">
        This debug panel only shows in staging
      </div>
    </div>
  );
};

export default EnvDebug;