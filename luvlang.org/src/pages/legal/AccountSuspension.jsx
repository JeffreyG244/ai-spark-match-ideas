import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Heart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
const AccountSuspension = () => {
    return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-white"/>
            </div>
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
              Luvlang
            </Link>
          </div>
          <nav className="text-sm text-gray-600 mb-4">
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Account Suspension Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Account Suspension Policy</h1>
          <p className="text-lg text-gray-600">
            Understanding account suspensions, their reasons, and the resolution process.
          </p>
        </div>

        <Card className="border-orange-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Reasons for Suspension</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Immediate Suspension</h3>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    <li>Threats, harassment, or violent behavior</li>
                    <li>Sharing explicit or inappropriate content</li>
                    <li>Attempting to scam or defraud other users</li>
                    <li>Impersonation or fake profile creation</li>
                    <li>Underage use (under 18 years old)</li>
                    <li>Illegal activities or content</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Progressive Suspension</h3>
                  <ul className="list-disc list-inside text-orange-700 space-y-1">
                    <li>Repeated violations of community guidelines</li>
                    <li>Spam or excessive unwanted messaging</li>
                    <li>Multiple user reports for inappropriate behavior</li>
                    <li>Circumventing platform restrictions</li>
                    <li>Commercial solicitation or advertising</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Types of Suspensions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600"/>
                    <h3 className="font-semibold text-yellow-800">Temporary Suspension</h3>
                  </div>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    <li><strong>Duration:</strong> 24 hours to 30 days</li>
                    <li><strong>Access:</strong> Account login blocked</li>
                    <li><strong>Profile:</strong> Hidden from other users</li>
                    <li><strong>Messages:</strong> Cannot send or receive</li>
                    <li><strong>Matches:</strong> Suspended temporarily</li>
                    <li><strong>Resolution:</strong> Automatic restoration after period</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600"/>
                    <h3 className="font-semibold text-red-800">Permanent Suspension (Ban)</h3>
                  </div>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    <li><strong>Duration:</strong> Indefinite</li>
                    <li><strong>Access:</strong> Complete account termination</li>
                    <li><strong>Data:</strong> Profile and matches deleted</li>
                    <li><strong>Future Use:</strong> Prohibited from creating new accounts</li>
                    <li><strong>Appeals:</strong> Limited appeal process available</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Suspension Process</h2>
              
              <ol className="list-decimal list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>Violation Detection:</strong> Automated systems or user reports identify violation</li>
                <li><strong>Investigation:</strong> Safety team reviews evidence and context</li>
                <li><strong>Decision:</strong> Appropriate action determined based on severity</li>
                <li><strong>Notification:</strong> User informed via email with specific reasons</li>
                <li><strong>Implementation:</strong> Account restrictions take effect immediately</li>
                <li><strong>Documentation:</strong> Violation record maintained for future reference</li>
              </ol>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Notification Details</h2>
              <p className="mb-4 text-gray-700">When your account is suspended, you will receive an email containing:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Specific reason for suspension</li>
                <li>Duration of suspension (if temporary)</li>
                <li>Relevant policy violations cited</li>
                <li>Evidence or examples when appropriate</li>
                <li>Appeal instructions and deadlines</li>
                <li>Steps to prevent future violations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Appeal Process</h2>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">How to Appeal</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Submit appeal within 30 days of suspension</li>
                  <li>Email appeals@luvlang.com with case details</li>
                  <li>Provide additional context or evidence</li>
                  <li>Explain circumstances or misunderstandings</li>
                  <li>Wait for independent review (5-10 business days)</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-6">
                <h3 className="font-semibold text-purple-800 mb-2">Appeal Requirements</h3>
                <ul className="list-disc list-inside text-purple-700 space-y-1">
                  <li>Include your username and email address</li>
                  <li>Reference the specific suspension notification</li>
                  <li>Provide clear explanation of your position</li>
                  <li>Be respectful and professional in communication</li>
                  <li>Submit only relevant evidence or context</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Appeal Outcomes</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Appeal Approved</h3>
                  <ul className="list-disc list-inside text-green-700 space-y-1">
                    <li>Account immediately restored</li>
                    <li>Suspension record may be removed</li>
                    <li>Apology and explanation provided</li>
                    <li>Review of policies to prevent similar errors</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Appeal Denied</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Suspension remains in effect</li>
                    <li>Detailed explanation of decision</li>
                    <li>Final decision in most cases</li>
                    <li>Option for escalated review in extreme cases</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Repeat Offenses</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>First violation:</strong> Warning or short temporary suspension</li>
                <li><strong>Second violation:</strong> Longer temporary suspension</li>
                <li><strong>Third violation:</strong> Extended suspension or permanent ban</li>
                <li><strong>Serious violations:</strong> May result in immediate permanent ban</li>
                <li><strong>Pattern recognition:</strong> AI systems track violation history</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Account Recovery</h2>
              <p className="mb-4 text-gray-700">For temporary suspensions, account recovery is automatic:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Full access restored at end of suspension period</li>
                <li>All matches and conversations preserved</li>
                <li>Profile becomes visible to other users again</li>
                <li>No additional verification required</li>
                <li>Suspension noted in account history</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Prevention Tips</h2>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Avoid Suspensions By:</h3>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li>Reading and following our community guidelines</li>
                  <li>Being respectful to all users</li>
                  <li>Reporting inappropriate behavior instead of responding negatively</li>
                  <li>Using authentic photos and information</li>
                  <li>Never requesting money or personal information</li>
                  <li>Keeping conversations appropriate and consensual</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For suspension-related questions:
                <br />
                Appeals: appeals@luvlang.com
                <br />
                Support: support@luvlang.com
                <br />
                Safety team: safety@luvlang.com
                <br />
                Phone: 1-800-LUVLANG (1-800-588-5264)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/legal" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium">
            ← Back to Legal Overview
          </Link>
        </div>
      </div>
    </div>);
};
export default AccountSuspension;
