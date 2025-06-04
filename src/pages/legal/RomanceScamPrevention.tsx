
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, AlertTriangle, DollarSign, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RomanceScamPrevention = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Romance Scam Prevention
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Romance Scam Prevention</h1>
          <p className="text-lg text-gray-600">
            Protecting our users from romance scams and fraudulent activities.
          </p>
        </div>

        {/* Warning Box */}
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-800 mb-2">⚠️ Critical Warning</h3>
              <p className="text-red-700 font-semibold">
                NEVER send money, gifts, or personal financial information to someone you've met online, 
                regardless of their story or emergency situation.
              </p>
            </div>
          </div>
        </div>

        {/* Common Scam Tactics */}
        <Card className="border-orange-200 bg-orange-50 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <CardTitle className="text-xl text-orange-800">Common Romance Scam Tactics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-orange-800 mb-3">Profile Red Flags</h4>
                <ul className="list-disc list-inside text-orange-700 space-y-1">
                  <li>Professional model-quality photos</li>
                  <li>Very limited photos or reluctant to share more</li>
                  <li>Claims to be military, doctor, or oil rig worker</li>
                  <li>Located overseas or traveling frequently</li>
                  <li>Recently widowed or divorced</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-3">Behavioral Red Flags</h4>
                <ul className="list-disc list-inside text-orange-700 space-y-1">
                  <li>Professes love very quickly</li>
                  <li>Asks personal questions early</li>
                  <li>Refuses video calls or phone calls</li>
                  <li>Stories don't add up or change</li>
                  <li>Poor grammar despite claiming to be native speaker</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Scam Warning */}
        <Card className="border-red-200 bg-red-50 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-red-600" />
              <CardTitle className="text-xl text-red-800">Financial Scam Techniques</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-red-800">
              <h4 className="font-semibold">Common Money Requests:</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Emergency medical expenses</li>
                <li>Travel money to visit you</li>
                <li>Temporary financial hardship</li>
                <li>Money to claim inheritance or prize</li>
                <li>Investment opportunities</li>
                <li>Custom fees or visa costs</li>
              </ul>
              
              <h4 className="font-semibold mt-6">Payment Methods to Avoid:</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Wire transfers (Western Union, MoneyGram)</li>
                <li>Gift cards (iTunes, Amazon, Google Play)</li>
                <li>Cryptocurrency (Bitcoin, etc.)</li>
                <li>Prepaid debit cards</li>
                <li>Money transfer apps to strangers</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Protection Measures */}
        <Card className="border-green-200 bg-green-50 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-600" />
              <CardTitle className="text-xl text-green-800">Our Protection Measures</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-3">Automated Detection</h4>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li>AI-powered message scanning</li>
                  <li>Reverse image search on photos</li>
                  <li>Pattern recognition for scammer behavior</li>
                  <li>Financial keyword monitoring</li>
                  <li>Geographic inconsistency detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-3">Human Oversight</h4>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li>24/7 moderation team</li>
                  <li>User report investigation</li>
                  <li>Profile verification requirements</li>
                  <li>Suspicious activity monitoring</li>
                  <li>Proactive scammer removal</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Guidelines */}
        <Card className="border-purple-200 bg-purple-50 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-xl text-purple-800">How to Protect Yourself</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-purple-800">
              <h4 className="font-semibold">Verification Steps:</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Insist on video calls before developing feelings</li>
                <li>Ask them to send a photo with a specific pose or sign</li>
                <li>Reverse search their photos on Google Images</li>
                <li>Ask specific questions about their claimed location</li>
                <li>Be skeptical of perfect grammar from non-native speakers</li>
              </ul>
              
              <h4 className="font-semibold mt-6">Warning Signs in Conversation:</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Immediate declarations of love</li>
                <li>Asking about your financial situation</li>
                <li>Requesting personal information (SSN, bank details)</li>
                <li>Pressuring you to move off the platform quickly</li>
                <li>Any mention of needing money</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Reporting */}
        <Card className="border-blue-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Suspected Scammers</h2>
              <p className="mb-4 text-gray-700">
                If you suspect someone is trying to scam you or other users, report them immediately:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">How to Report</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Use the "Report" button on their profile</li>
                <li>Block the user immediately</li>
                <li>Save screenshots of suspicious messages</li>
                <li>Email detailed report to: scams@luvlang.com</li>
                <li>Contact support for urgent situations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">What Happens Next</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Immediate investigation by security team</li>
                <li>Account suspension pending review</li>
                <li>IP and device tracking for prevention</li>
                <li>Coordination with law enforcement if needed</li>
                <li>Follow-up with reporting user</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Emergency Contacts</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-semibold mb-2">If you've been scammed:</p>
                <ul className="space-y-1 text-gray-700">
                  <li><strong>FBI IC3:</strong> ic3.gov (Internet Crime Complaint Center)</li>
                  <li><strong>FTC:</strong> reportfraud.ftc.gov</li>
                  <li><strong>Luvlang Emergency:</strong> emergency@luvlang.com</li>
                  <li><strong>Phone:</strong> 1-800-LUVLANG (1-800-588-5264)</li>
                </ul>
              </div>
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

export default RomanceScamPrevention;
