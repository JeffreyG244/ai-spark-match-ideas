
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Heart, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const MessageMonitoring = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Message Monitoring Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Message Monitoring Policy</h1>
          <p className="text-lg text-gray-600">
            How we monitor communications to ensure user safety and platform compliance.
          </p>
        </div>

        <Card className="border-orange-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Monitoring Purpose</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Protect users from harassment, threats, and inappropriate content</li>
                <li>Detect and prevent scams, fraud, and illegal activities</li>
                <li>Ensure compliance with community guidelines</li>
                <li>Maintain a safe and respectful environment</li>
                <li>Comply with legal obligations and law enforcement requests</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Monitoring</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Automated Monitoring
                  </h3>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>AI-powered content scanning for inappropriate material</li>
                    <li>Keyword detection for scams and dangerous content</li>
                    <li>Pattern recognition for spam and harassment</li>
                    <li>Real-time filtering of prohibited content</li>
                    <li>Suspicious behavior pattern detection</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Human Review
                  </h3>
                  <ul className="list-disc list-inside text-purple-700 space-y-1">
                    <li>Manual review of flagged conversations</li>
                    <li>Investigation of user reports</li>
                    <li>Context analysis for complex situations</li>
                    <li>Appeal review and dispute resolution</li>
                    <li>Quality assurance of automated systems</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. What We Monitor</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Monitored Content</h4>
                  <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                    <li>Text messages between users</li>
                    <li>Shared photos and media files</li>
                    <li>Profile information and photos</li>
                    <li>Voice messages and video calls (metadata only)</li>
                    <li>User behavior patterns</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Not Monitored</h4>
                  <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                    <li>End-to-end encrypted messages (when enabled)</li>
                    <li>Video call content (only connection metadata)</li>
                    <li>Voice call conversations</li>
                    <li>Off-platform communications</li>
                    <li>Deleted messages (after deletion)</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Triggering Events</h2>
              <p className="mb-4 text-gray-700">Messages may be flagged and reviewed when they contain:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Threats, harassment, or abusive language</li>
                <li>Requests for money, personal information, or off-platform contact</li>
                <li>Sexually explicit content or inappropriate images</li>
                <li>Suspected scam patterns or fraudulent schemes</li>
                <li>Hate speech, discrimination, or illegal activities</li>
                <li>Spam or repetitive unsolicited messages</li>
                <li>Links to external websites or suspicious content</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Response Actions</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Immediate Actions</h3>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    <li>Automatic blocking of prohibited content</li>
                    <li>Message delivery prevention</li>
                    <li>User notification of policy violation</li>
                    <li>Temporary communication restrictions</li>
                    <li>Emergency account suspension for serious threats</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Follow-up Actions</h3>
                  <ul className="list-disc list-inside text-orange-700 space-y-1">
                    <li>Account warnings and educational messages</li>
                    <li>Feature restrictions (messaging, matching)</li>
                    <li>Account suspension or permanent bans</li>
                    <li>Law enforcement reporting (when required)</li>
                    <li>Evidence preservation for investigations</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Privacy Protections</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Access limited to authorized safety personnel only</li>
                <li>All monitoring activities are logged and audited</li>
                <li>Personal information is redacted when possible</li>
                <li>Monitoring data is encrypted and securely stored</li>
                <li>Retention periods limited to necessary timeframes</li>
                <li>Regular training for staff on privacy protocols</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Rights and Controls</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Report inappropriate messages you receive</li>
                <li>Block users to prevent further communication</li>
                <li>Request review of moderation decisions</li>
                <li>Access information about why content was flagged</li>
                <li>Enable enhanced privacy settings when available</li>
                <li>Request deletion of your conversation history</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Legal Compliance</h2>
              <p className="mb-4 text-gray-700">We may be required to monitor and report certain activities:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Child safety and protection (NCMEC reporting)</li>
                <li>Terrorism and extremist content (government agencies)</li>
                <li>Financial crimes and fraud (law enforcement)</li>
                <li>Court orders and subpoenas</li>
                <li>Regulatory compliance requirements</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Considerations</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Monitoring practices may vary by jurisdiction</li>
                <li>Local laws and regulations are respected</li>
                <li>Data processing agreements for international transfers</li>
                <li>Cultural sensitivity in content moderation</li>
                <li>Language-specific monitoring capabilities</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Transparency and Appeals</h2>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Appeals Process</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Contest moderation decisions through support@luvlang.org</li>
                  <li>Provide context and explanation for your appeal</li>
                  <li>Independent review by senior moderation staff</li>
                  <li>Response within 72 hours for urgent cases</li>
                  <li>Standard response time: 5-7 business days</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700">
                For questions about message monitoring:
                <br />
                Email: support@luvlang.org
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

export default MessageMonitoring;
