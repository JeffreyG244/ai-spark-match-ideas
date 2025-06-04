
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Heart, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SafetyGuidelines = () => {
  const safetyTips = [
    {
      title: "Before Meeting",
      tips: [
        "Video chat before meeting in person",
        "Research their social media profiles",
        "Trust your instincts - if something feels off, it probably is",
        "Never send money, gifts, or personal financial information",
        "Keep personal information private until you build trust"
      ]
    },
    {
      title: "First Meetings",
      tips: [
        "Meet in a public place with other people around",
        "Drive yourself or arrange your own transportation",
        "Tell a friend where you're going and when you'll check in",
        "Stay sober and in control",
        "Keep your phone charged and easily accessible"
      ]
    },
    {
      title: "Red Flags to Watch For",
      tips: [
        "Asks for money, gifts, or financial assistance",
        "Professes love very quickly",
        "Refuses to video chat or meet in person",
        "Stories don't add up or change over time",
        "Pressures you for personal information or photos"
      ]
    }
  ];

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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Safety Guidelines
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Safety Guidelines & Tips</h1>
          <p className="text-lg text-gray-600">
            Your safety is our top priority. Follow these guidelines for secure online dating.
          </p>
        </div>

        {/* Emergency Notice */}
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-800 mb-2">Emergency Situations</h3>
              <p className="text-red-700 mb-3">
                If you feel unsafe or threatened, immediately contact local emergency services. 
                Report any suspicious or dangerous behavior to our safety team.
              </p>
              <div className="flex gap-4">
                <span className="font-semibold text-red-800">Emergency: 911</span>
                <span className="font-semibold text-red-800">Safety Team: safety@luvlang.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Tips Sections */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          {safetyTips.map((section, index) => (
            <Card key={index} className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-xl text-green-800">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-green-800">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Romance Scam Prevention */}
        <Card className="border-orange-200 bg-orange-50 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <CardTitle className="text-xl text-orange-800">Romance Scam Prevention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-orange-800">
              <p className="font-semibold">Common Romance Scam Tactics:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Claims to be traveling, military deployed, or working overseas</li>
                <li>Emergency situations requiring immediate financial help</li>
                <li>Requests for gift cards, wire transfers, or cryptocurrency</li>
                <li>Professional photos that seem too perfect</li>
                <li>Limited photos or refuses additional photo requests</li>
              </ul>
              <p className="font-semibold mt-4">Remember: Legitimate users will never ask for money!</p>
            </div>
          </CardContent>
        </Card>

        {/* Reporting */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-xl text-purple-800">Report Suspicious Behavior</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-purple-800">
              <p>If you encounter any of the following, please report immediately:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Requests for money or financial assistance</li>
                <li>Inappropriate or offensive messages</li>
                <li>Fake profiles or catfishing attempts</li>
                <li>Threats or harassment</li>
                <li>Underage users</li>
              </ul>
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                <p className="font-semibold mb-2">How to Report:</p>
                <p>Use the report button on any profile or message, or contact:</p>
                <p className="font-medium">safety@luvlang.com</p>
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

export default SafetyGuidelines;
