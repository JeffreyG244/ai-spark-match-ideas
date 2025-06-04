
import React from 'react';
import { Heart, AlertTriangle } from 'lucide-react';
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

      {/* Critical Notice */}
      <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-red-800 mb-2">Launch Readiness Status</h3>
            <p className="text-red-700 mb-3">
              <strong>Critical:</strong> All policies marked as "Required" must be implemented before public launch 
              to ensure legal compliance and user safety.
            </p>
            <p className="text-sm text-red-600">
              Recommended: Consult with a technology lawyer specializing in dating platforms before launch.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LegalHeader;
