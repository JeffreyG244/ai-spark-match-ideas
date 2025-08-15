
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const IntellectualProperty = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Intellectual Property Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Intellectual Property Policy</h1>
          <p className="text-lg text-gray-600">
            Protecting intellectual property rights on our platform.
          </p>
        </div>

        <Card className="border-purple-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Luvlang's Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Platform Content</h3>
              <p className="mb-4 text-gray-700">
                All content on the Luvlang platform, including but not limited to:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Software code, algorithms, and AI technology</li>
                <li>Website design, layout, and user interface</li>
                <li>Luvlang logo, trademarks, and branding</li>
                <li>Documentation, help content, and marketing materials</li>
                <li>Database structure and matching algorithms</li>
              </ul>
              
              <p className="mb-6 text-gray-700">
                These are owned by Luvlang and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Content Rights</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Content Ownership</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>You retain ownership of all content you submit to Luvlang</li>
                <li>You are responsible for ensuring you have rights to all content you upload</li>
                <li>You must not upload content that infringes on others' intellectual property</li>
                <li>You grant Luvlang a license to use your content as described in our Terms of Service</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">License Grant to Luvlang</h3>
              <p className="mb-4 text-gray-700">
                By uploading content, you grant Luvlang a non-exclusive, worldwide, royalty-free license to:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Display your content on the platform</li>
                <li>Store and process your content for service functionality</li>
                <li>Resize, crop, or modify photos for display purposes</li>
                <li>Use content for safety, security, and moderation purposes</li>
                <li>Create derivative works necessary for platform operation</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Prohibited Uses</h2>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-red-800 mb-3">Users May Not:</h3>
                <ul className="list-disc list-inside text-red-700 space-y-2">
                  <li>Copy, reproduce, or distribute Luvlang's proprietary content</li>
                  <li>Reverse engineer, decompile, or disassemble our software</li>
                  <li>Create derivative works based on our platform</li>
                  <li>Use our trademarks or logos without permission</li>
                  <li>Scrape or extract data from our platform</li>
                  <li>Upload content that infringes third-party rights</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Copyright Infringement Claims</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">DMCA Compliance</h3>
              <p className="mb-4 text-gray-700">
                Luvlang respects intellectual property rights and responds to valid DMCA takedown notices. 
                If you believe your copyrighted work has been infringed, please provide:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Identification of the copyrighted work</li>
                <li>Location of the infringing material on our platform</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief that use is unauthorized</li>
                <li>A statement of accuracy under penalty of perjury</li>
                <li>Physical or electronic signature of the copyright owner</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Counter-Notification</h3>
              <p className="mb-6 text-gray-700">
                If you believe your content was removed in error, you may submit a counter-notification 
                with similar information demonstrating your right to use the material.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Trademark Policy</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Luvlang Trademarks</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>The Luvlang name and logo are registered trademarks</li>
                <li>Use of our trademarks requires prior written permission</li>
                <li>Unauthorized use may result in legal action</li>
                <li>Fair use for commentary or criticism is permitted</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Third-Party Trademarks</h3>
              <p className="mb-6 text-gray-700">
                Users must not use others' trademarks in profiles, messages, or content without permission. 
                This includes company logos, brand names, and other protected marks.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. AI and Data Rights</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Machine Learning</h3>
              <p className="mb-4 text-gray-700">
                Luvlang uses AI and machine learning to improve our matching algorithms. This may involve:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Analyzing user behavior patterns (anonymized)</li>
                <li>Processing photos for verification and safety</li>
                <li>Improving compatibility predictions</li>
                <li>Detecting and preventing fraud</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Reporting Violations</h2>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">How to Report</h3>
                <p className="text-blue-700 mb-3">
                  To report intellectual property violations:
                </p>
                <ul className="list-disc list-inside text-blue-700 space-y-2">
                  <li>Email: <a href="mailto:support@luvlang.org" className="text-purple-600 hover:text-purple-800">support@luvlang.org</a></li>
                  <li>Subject: "IP Violation Report"</li>
                  <li>Include all required DMCA information</li>
                  <li>Allow 5-7 business days for response</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Enforcement</h2>
              <p className="mb-6 text-gray-700">
                Violations of this policy may result in:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Content removal</li>
                <li>Account suspension or termination</li>
                <li>Legal action for serious violations</li>
                <li>Cooperation with law enforcement</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700">
                For intellectual property questions or reports:
                <br />
                Email: <a href="mailto:support@luvlang.org" className="text-purple-600 hover:text-purple-800">support@luvlang.org</a>
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

export default IntellectualProperty;
