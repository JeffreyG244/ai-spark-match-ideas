
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const CCPA = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6 max-w-4xl">
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → CCPA Compliance (California)
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CCPA Compliance (California)</h1>
          <p className="text-lg text-gray-600">
            California Consumer Privacy Act rights and protections for California residents.
          </p>
        </div>

        <Card className="border-blue-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Your California Privacy Rights</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>Right to Know:</strong> What personal information we collect and how it's used</li>
                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of the sale of personal information</li>
                <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
                <li><strong>Right to Correct:</strong> Request correction of inaccurate information</li>
                <li><strong>Right to Limit:</strong> Limit use of sensitive personal information</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Categories of Personal Information</h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Identifiers</h3>
                  <p className="text-purple-700">Name, email, phone number, IP address, device ID</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Demographics</h3>
                  <p className="text-blue-700">Age, gender, location, relationship preferences</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Commercial Information</h3>
                  <p className="text-green-700">Subscription history, purchase records, payment information</p>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Internet Activity</h3>
                  <p className="text-orange-700">App usage, search history, interaction patterns</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Provide dating and matching services</li>
                <li>Process payments and subscriptions</li>
                <li>Ensure platform safety and security</li>
                <li>Improve our algorithms and features</li>
                <li>Send service notifications and updates</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Do We Sell Personal Information?</h2>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-700 font-semibold">
                  We do not sell personal information to third parties for monetary consideration. 
                  However, we may share information for advertising purposes, which may be considered 
                  a "sale" under CCPA. You can opt out of this sharing.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sensitive Personal Information</h2>
              <p className="mb-4 text-gray-700">We may collect sensitive personal information including:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Precise geolocation (with your consent)</li>
                <li>Account login information</li>
                <li>Contents of communications</li>
                <li>Biometric identifiers (for verification)</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Exercising Your Rights</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">How to Submit Requests</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Email: support@luvlang.org</li>
                    <li>Phone: 1-800-LUVLANG</li>
                    <li>Online form in your account settings</li>
                    <li>Response time: Within 45 days</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Verification Process</h2>
              <p className="mb-4 text-gray-700">To protect your privacy, we verify your identity before processing requests:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Account email verification</li>
                <li>Security questions</li>
                <li>Phone number verification</li>
                <li>For deletion requests: Enhanced verification may be required</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Authorized Agents</h2>
              <p className="mb-6 text-gray-700">
                You may designate an authorized agent to submit requests on your behalf. 
                The agent must provide proof of authorization and you may be required to verify your identity.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700">
                For CCPA-related questions:
                <br />
                Email: support@luvlang.org
                <br />
                Phone: 1-800-LUVLANG (1-800-588-5264)
                <br />
                Address: [California Address]
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

export default CCPA;
