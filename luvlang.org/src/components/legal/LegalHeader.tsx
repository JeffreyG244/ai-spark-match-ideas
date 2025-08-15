
import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalHeader = () => {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
            Luvlang
          </Link>
        </div>
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
