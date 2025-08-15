
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, Camera, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const IdentityVerificationPolicy = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Identity Verification Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Identity Verification Policy</h1>
          <p className="text-lg text-gray-600">
            Ensuring authentic profiles and protecting users from catfishing and fraud.
          </p>
        </div>

        <Card className="border-blue-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Verification Requirements</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>All users must verify their identity before full platform access</li>
                <li>Profile photos must match verification photos</li>
                <li>Real-time photo capture required (no uploads of existing photos)</li>
                <li>Multiple verification methods may be required</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Photo Verification</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Live Photo Capture</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Real-time selfie taken through the app</li>
                <li>Multiple angles and poses required</li>
                <li>Facial recognition technology confirms identity</li>
                <li>Comparison with profile photos for consistency</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Pose Requirements</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Front-facing clear view</li>
                <li>Profile (side) view</li>
                <li>Specific hand gesture as directed</li>
                <li>Good lighting and clear visibility</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Document Verification</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Required Information</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Government-issued photo ID</li>
                <li>Phone number verification via SMS</li>
                <li>Email address confirmation</li>
                <li>Social media account linking (optional but recommended)</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Verification Process</h2>
              <ol className="list-decimal list-inside mb-6 text-gray-700 space-y-2">
                <li>Complete profile setup with photos</li>
                <li>Submit government ID for age and identity verification</li>
                <li>Complete live photo verification session</li>
                <li>Verify phone number with SMS code</li>
                <li>Confirm email address</li>
                <li>Automated and manual review (24-72 hours)</li>
                <li>Verification badge added to profile upon approval</li>
              </ol>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Verification Levels</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Basic Verification</span>
                </div>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li>Photo verification</li>
                  <li>Phone number confirmation</li>
                  <li>Email verification</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Enhanced Verification</span>
                </div>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Government ID verification</li>
                  <li>Advanced facial recognition</li>
                  <li>Background check (optional)</li>
                  <li>Social media verification</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Failed Verification</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Limited platform access until successful verification</li>
                <li>Clear feedback on failure reasons</li>
                <li>Up to 3 retry attempts</li>
                <li>Manual review process for edge cases</li>
                <li>Appeal process available</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Ongoing Verification</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Periodic re-verification may be required</li>
                <li>New photo uploads checked against verified identity</li>
                <li>User reports trigger additional verification</li>
                <li>Suspicious activity prompts identity review</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Privacy & Security</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Verification data encrypted and secure</li>
                <li>Access limited to authorized personnel</li>
                <li>Automatic deletion of verification photos after confirmation</li>
                <li>Compliance with privacy regulations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Contact</h2>
              <p className="text-gray-700">
                Verification support: verify@luvlang.com
                <br />
                Technical issues: support@luvlang.com
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

export default IdentityVerificationPolicy;
