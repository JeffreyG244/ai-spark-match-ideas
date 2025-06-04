
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Cookie Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-lg text-gray-600">
            How we use cookies and similar technologies to enhance your experience.
          </p>
        </div>

        <Card className="border-orange-200 mb-8">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="mb-6 text-gray-700">
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                analyzing how you use our service.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">Essential Cookies</h3>
                  <p className="text-green-700 mb-3">
                    These cookies are necessary for the website to function properly and cannot be disabled.
                  </p>
                  <ul className="list-disc list-inside text-green-700 space-y-1">
                    <li>Authentication and login status</li>
                    <li>Security and fraud prevention</li>
                    <li>Form submission and data storage</li>
                    <li>Load balancing and server selection</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">Functional Cookies</h3>
                  <p className="text-blue-700 mb-3">
                    These cookies enhance functionality and personalization but are not essential.
                  </p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Language and region preferences</li>
                    <li>Theme and display settings</li>
                    <li>Recently viewed profiles</li>
                    <li>Search filters and preferences</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="text-xl font-semibold text-purple-800 mb-3">Analytics Cookies</h3>
                  <p className="text-purple-700 mb-3">
                    These cookies help us understand how users interact with our website.
                  </p>
                  <ul className="list-disc list-inside text-purple-700 space-y-1">
                    <li>Page views and user journeys</li>
                    <li>Feature usage and engagement</li>
                    <li>Performance monitoring</li>
                    <li>Error tracking and debugging</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="text-xl font-semibold text-orange-800 mb-3">Marketing Cookies</h3>
                  <p className="text-orange-700 mb-3">
                    These cookies are used to deliver personalized advertisements and measure campaign effectiveness.
                  </p>
                  <ul className="list-disc list-inside text-orange-700 space-y-1">
                    <li>Social media integration</li>
                    <li>Advertising targeting and personalization</li>
                    <li>Campaign performance measurement</li>
                    <li>Cross-site tracking (with consent)</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Third-Party Cookies</h2>
              <p className="mb-4 text-gray-700">
                We may allow certain third-party services to place cookies on your device:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>Google Analytics:</strong> Website usage analytics and reporting</li>
                <li><strong>Facebook Pixel:</strong> Social media advertising and measurement</li>
                <li><strong>Payment Processors:</strong> Secure payment processing</li>
                <li><strong>Customer Support:</strong> Live chat and help desk functionality</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Cookie Control Options</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Browser Settings:</strong> Most browsers allow you to control cookies through their settings</li>
                  <li><strong>Opt-Out Tools:</strong> Use industry opt-out tools for advertising cookies</li>
                  <li><strong>Privacy Settings:</strong> Adjust your preferences in your account settings</li>
                  <li><strong>Do Not Track:</strong> We respect browser Do Not Track signals</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Session Cookies</h4>
                  <p className="text-yellow-700 text-sm">
                    Deleted when you close your browser
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Persistent Cookies</h4>
                  <p className="text-blue-700 text-sm">
                    Stored for up to 2 years or until manually deleted
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="mb-6 text-gray-700">
                We may update this Cookie Policy from time to time. We will notify you of any significant 
                changes by posting the new policy on this page and updating the "last updated" date.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about our use of cookies, please contact us at:
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

export default CookiePolicy;
