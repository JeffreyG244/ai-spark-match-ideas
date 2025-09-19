import React, { useEffect } from 'react';
import ExecutiveProfileForm from '@/components/profile/ExecutiveProfileForm';

const ExecutiveProfile = () => {
  useEffect(() => {
    document.title = 'Executive Dating Profile | Luvlang';
    const desc = 'Create your comprehensive executive dating profile for AI-powered matching.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
  }, []);
  return <ExecutiveProfileForm />;
};

export default ExecutiveProfile;