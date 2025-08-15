
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AgeVerificationPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6 max-w-4xl">
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
          <nav className="text-sm text-gray-600 mb-4">
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Age Verification Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Age Verification Policy</h1>
          <p className="text-lg text-gray-600">
            Ensuring all users are 18 years or older for a safe dating environment.
          </p>
        </div>

        <Card className="border-green-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Age Requirements</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>All users must be at least 18 years old</li>
                <li>Users must provide accurate birth date information</li>
                <li>False age information results in immediate account termination</li>
                <li>No exceptions for users under 18</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Verification Methods</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Initial Verification</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Government-issued photo ID verification</li>
                <li>Birth certificate verification (when required)</li>
                <li>Passport verification for international users</li>
                <li>Driver's license verification</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Ongoing Monitoring</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>AI-powered photo analysis for age estimation</li>
                <li>Behavioral pattern analysis</li>
                <li>User report investigations</li>
                <li>Random re-verification requests</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Document Requirements</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Acceptable Documents</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Valid driver's license</li>
                <li>Government-issued ID card</li>
                <li>Passport</li>
                <li>Military ID</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Document Standards</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Must be current and unexpired</li>
                <li>Clear, readable photograph</li>
                <li>All information visible and legible</li>
                <li>No alterations or tampering</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Verification Process</h2>
              <ol className="list-decimal list-inside mb-6 text-gray-700 space-y-2">
                <li>Upload government-issued ID during registration</li>
                <li>Automated verification system checks document authenticity</li>
                <li>Human review for flagged or unclear documents</li>
                <li>Notification of verification status within 24-48 hours</li>
                <li>Account activation upon successful verification</li>
              </ol>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Failed Verification</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Account remains suspended until successful verification</li>
                <li>Up to 3 attempts allowed for document submission</li>
                <li>Clear instructions provided for resubmission</li>
                <li>Manual review available for disputed cases</li>
                <li>Permanent ban for fraudulent documents</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Data Protection</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>ID documents encrypted and securely stored</li>
                <li>Access limited to verification personnel only</li>
                <li>Documents deleted after verification (except as required by law)</li>
                <li>Compliance with data protection regulations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Contact</h2>
              <p className="text-gray-700">
                Verification support: verification@luvlang.com
                <br />
                Phone: 1-800-LUVLANG (1-800-588-5264)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link 
            to="/legal" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
          >
            ← Back to Legal Overview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationPolicy;
