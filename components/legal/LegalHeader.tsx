
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/logo';

const LegalHeader = () => {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="mb-4 inline-block">
          <Logo size="md" />
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal & Regulatory Compliance</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Comprehensive legal documentation to protect both our platform and our users. 
          All policies are designed to ensure safety, privacy, and legal compliance.
        </p>
      </div>
    </>
  );
};

export default LegalHeader;
