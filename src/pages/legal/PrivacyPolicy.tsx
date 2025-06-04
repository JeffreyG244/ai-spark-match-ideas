
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Privacy Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="border-purple-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Email address and contact information</li>
                <li>Profile information (age, location, preferences)</li>
                <li>Photos and verification images</li>
                <li>Compatibility questionnaire responses</li>
                <li>Communication preferences and settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Usage Data</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Device information and IP address</li>
                <li>App usage patterns and interaction data</li>
                <li>Location data (with your permission)</li>
                <li>Messages and communication metadata</li>
                <li>Support requests and feedback</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Provide and improve our AI matching services</li>
                <li>Verify user identity and prevent fraud</li>
                <li>Facilitate secure communication between users</li>
                <li>Personalize your experience and recommendations</li>
                <li>Send important notifications and updates</li>
                <li>Comply with legal obligations and safety requirements</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Information Sharing</h2>
              <p className="mb-4 text-gray-700">
                We do not sell your personal information. We may share information in these limited circumstances:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements</li>
                <li>With service providers (under strict confidentiality)</li>
                <li>To protect safety and prevent harm</li>
                <li>In case of business transfers (with notice)</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Data Security</h2>
              <p className="mb-6 text-gray-700">
                We implement enterprise-grade security measures including encryption, secure servers, 
                and regular security audits. However, no system is 100% secure, and we encourage 
                users to protect their account credentials.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Your Rights</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Access and download your data</li>
                <li>Correct or update your information</li>
                <li>Delete your account and data</li>
                <li>Object to certain data processing</li>
                <li>Data portability rights</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. International Transfers</h2>
              <p className="mb-6 text-gray-700">
                Your data may be processed in countries other than your own. We ensure adequate 
                protection through appropriate safeguards and compliance with applicable laws.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Contact Us</h2>
              <p className="text-gray-700">
                For privacy questions or to exercise your rights, contact us at:
                <br />
                Email: <a href="mailto:privacy@luvlang.com" className="text-purple-600 hover:text-purple-800">privacy@luvlang.com</a>
                <br />
                Address: [Your Company Address]
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

export default PrivacyPolicy;
