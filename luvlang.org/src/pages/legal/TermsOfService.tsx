
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Heart, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Terms of Service
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="border-blue-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              
              <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-800 mb-2">Important Notice</h3>
                    <p className="text-red-700">
                      By using Luvlang, you agree to these Terms of Service. If you disagree with any part of these terms, you may not use our service.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-6 text-gray-700">
                By accessing or using Luvlang, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
                These terms apply to all users of the service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>You must be at least 18 years old to use this service</li>
                <li>You must provide accurate and truthful information</li>
                <li>You must not be prohibited from using the service under applicable laws</li>
                <li>You must not have been previously banned from the platform</li>
                <li>You must be legally able to enter into binding contracts</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration and Security</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must immediately notify us of any unauthorized access</li>
                <li>You may only create one account per person</li>
                <li>You must provide accurate, current, and complete information</li>
                <li>We reserve the right to suspend accounts that violate these terms</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Conduct</h2>
              <p className="mb-4 text-gray-700">Users are prohibited from:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Harassment, abuse, or threatening other users</li>
                <li>Creating fake profiles or impersonating others</li>
                <li>Soliciting money, goods, or services from other users</li>
                <li>Sharing explicit, offensive, or inappropriate content</li>
                <li>Spamming or sending unsolicited commercial communications</li>
                <li>Using the platform for illegal activities</li>
                <li>Attempting to hack, damage, or disrupt the service</li>
                <li>Violating intellectual property rights</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content and User Submissions</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>You retain ownership of content you submit</li>
                <li>You grant us a license to use, display, and distribute your content</li>
                <li>You are responsible for ensuring your content doesn't violate laws or rights</li>
                <li>We reserve the right to remove content that violates our policies</li>
                <li>We are not responsible for user-generated content</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
              <p className="mb-6 text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, 
                to understand our practices regarding your personal information.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Subscription and Payment Terms</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Subscription fees are billed in advance and are non-refundable</li>
                <li>We may change pricing with 30 days notice</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>You are responsible for all charges incurred on your account</li>
                <li>We reserve the right to suspend service for non-payment</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="mb-6 text-gray-700">
                LUVLANG SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
                RESULTING FROM YOUR USE OF THE SERVICE.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>We do not guarantee successful matches or relationships</li>
                <li>We do not conduct background checks on users</li>
                <li>Users meet at their own risk and responsibility</li>
                <li>The service is provided "as is" without warranties</li>
                <li>We cannot guarantee continuous, error-free service</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="mb-6 text-gray-700">
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms of Service.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="mb-6 text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="mb-6 text-gray-700">
                We reserve the right to modify these terms at any time. We will notify users of significant changes 
                via email or platform notification. Continued use of the service constitutes acceptance of modified terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700">
                Questions about the Terms of Service should be sent to:
                <br />
                Email: <a href="mailto:legal@luvlang.com" className="text-purple-600 hover:text-purple-800">legal@luvlang.com</a>
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

export default TermsOfService;
