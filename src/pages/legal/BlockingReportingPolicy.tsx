
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlockingReportingPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-purple-600">
              Luvlang
            </Link>
          </div>
          <nav className="text-sm text-gray-600 mb-4">
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Blocking & Reporting Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blocking & Reporting Policy</h1>
          <p className="text-lg text-gray-600">
            Our commitment to user safety through effective blocking and reporting mechanisms.
          </p>
        </div>

        <Card className="border-blue-200 mb-8">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Blocking Other Users</h2>
              <p className="mb-4 text-gray-700">
                We believe in giving you control over your experience. You can block any user at any time for any reason.
                When you block someone:
              </p>
              
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>They can no longer view your profile</li>
                <li>They cannot send you messages</li>
                <li>Their previous messages will be hidden from your conversations</li>
                <li>They will not be notified that you blocked them</li>
                <li>You will no longer appear in their search results</li>
                <li>You can unblock users at any time through your account settings</li>
              </ul>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center">
                  <Shield className="inline-block mr-2 h-5 w-5 text-purple-700" />
                  How to Block Someone
                </h3>
                <p className="text-purple-900">
                  To block a user, navigate to their profile and click the three dots (⋮) in the top right corner, 
                  then select "Block User." Alternatively, you can block someone directly from a conversation by 
                  clicking the three dots at the top of the message thread and selecting "Block User."
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Reporting Inappropriate Content</h2>
              <p className="mb-4 text-gray-700">
                We take violations of our community guidelines seriously. If you encounter content or behavior that
                violates our policies, please report it immediately.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">What You Can Report</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Harassment or threats</li>
                <li>Hate speech or discriminatory content</li>
                <li>Inappropriate or sexually explicit photos</li>
                <li>Fake profiles or impersonation</li>
                <li>Spam or scam attempts</li>
                <li>Underage users</li>
                <li>Self-harm or suicide threats</li>
                <li>Any other violations of our community guidelines</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center">
                  <Flag className="inline-block mr-2 h-5 w-5 text-blue-700" />
                  How to Report
                </h3>
                <p className="text-blue-900">
                  To report a user, visit their profile, click the three dots (⋮) menu, and select "Report." 
                  To report a specific message, long-press on the message and select "Report." You'll be asked 
                  to select a reason for reporting and can provide additional details if needed.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Our Response to Reports</h2>

              <p className="mb-4 text-gray-700">
                We review all reports and take appropriate action based on the severity of the violation:
              </p>

              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>Review Process:</strong> Our safety team reviews all reports within 24-48 hours</li>
                <li><strong>Investigation:</strong> We may review conversation history and account activity</li>
                <li><strong>Actions Taken:</strong> Depending on severity, we may issue warnings, temporarily suspend accounts, permanently ban users, or report to law enforcement if necessary</li>
                <li><strong>Communication:</strong> We will notify you when action has been taken on your report</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Emergency Situations</h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-red-900 mb-2">Immediate Danger</h3>
                <p className="text-red-900">
                  If you or someone else is in immediate danger, please contact your local emergency services (such as 911 in the US) immediately.
                  For situations involving threats, harassment, or illegal activity that require urgent attention, please email <strong>support@luvlang.org</strong>
                  in addition to using the in-app reporting tools.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Appeal Process</h2>

              <p className="mb-4 text-gray-700">
                If you believe your account was wrongfully suspended or terminated, or if you believe a report against you was made in error,
                you can appeal the decision by contacting <strong>support@luvlang.org</strong> with the subject line "Account Appeal."
                Please include your username and any relevant details about your situation.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Contact</h2>
              <p className="text-gray-700">
                For questions about our Blocking & Reporting Policy:<br />
                Email: support@luvlang.org<br />
                Response time: Within 2 business days
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

export default BlockingReportingPolicy;
