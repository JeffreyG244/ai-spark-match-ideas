
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityGuidelines = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Community Guidelines
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Guidelines</h1>
          <p className="text-lg text-gray-600">
            Creating a safe, respectful, and authentic community for meaningful connections.
          </p>
        </div>

        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Heart className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-800 mb-2">Our Mission</h3>
              <p className="text-blue-700">
                Luvlang is designed to help people find meaningful connections. These guidelines ensure 
                our community remains safe, respectful, and authentic for everyone.
              </p>
            </div>
          </div>
        </div>

        <Card className="border-green-200 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-600" />
              <CardTitle className="text-xl text-green-800">Be Authentic</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-green-800">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Use your real name, age, and recent photos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Provide honest information about yourself</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Don't impersonate others or create fake profiles</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Only post photos of yourself</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-blue-200 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl text-blue-800">Be Respectful</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Treat everyone with kindness and respect</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Accept rejection gracefully</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>No harassment, stalking, or persistent unwanted contact</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Respect personal boundaries and consent</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-red-200 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <CardTitle className="text-xl text-red-800">Prohibited Behavior</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Sexual Content & Harassment</h4>
                <ul className="space-y-2 text-red-700 text-sm">
                  <li>• No sexually explicit content or nudity</li>
                  <li>• No unsolicited sexual messages or advances</li>
                  <li>• No requesting or sharing intimate photos</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Hate Speech & Discrimination</h4>
                <ul className="space-y-2 text-red-700 text-sm">
                  <li>• No content targeting race, religion, gender, or sexual orientation</li>
                  <li>• No slurs, offensive language, or discriminatory comments</li>
                  <li>• No promoting hate groups or extremist ideologies</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-800 mb-2">Scams & Financial Requests</h4>
                <ul className="space-y-2 text-red-700 text-sm">
                  <li>• Never ask for money, gifts, or financial assistance</li>
                  <li>• No promoting investment schemes or financial services</li>
                  <li>• No selling products or services to other users</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-800 mb-2">Privacy & Safety</h4>
                <ul className="space-y-2 text-red-700 text-sm">
                  <li>• Don't share others' private information without consent</li>
                  <li>• No screenshots or recordings of private conversations</li>
                  <li>• Don't use the platform to stalk or monitor others</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-xl text-purple-800">Photo Guidelines</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-purple-800 mb-3">✅ Acceptable Photos</h4>
                <ul className="space-y-2 text-purple-700 text-sm">
                  <li>• Clear photos of your face</li>
                  <li>• Recent photos (within 2 years)</li>
                  <li>• Photos where you're fully clothed</li>
                  <li>• High-quality, well-lit images</li>
                  <li>• Photos showing your personality/interests</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-800 mb-3">❌ Prohibited Photos</h4>
                <ul className="space-y-2 text-red-700 text-sm">
                  <li>• Nudity or sexually suggestive content</li>
                  <li>• Photos of other people without consent</li>
                  <li>• Screenshots from other social media</li>
                  <li>• Heavily filtered or misleading photos</li>
                  <li>• Photos with contact information visible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <CardTitle className="text-xl text-orange-800">Reporting & Enforcement</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-orange-800">
              <div>
                <h4 className="font-semibold mb-2">How to Report</h4>
                <p className="text-sm text-orange-700 mb-3">
                  If you encounter behavior that violates these guidelines, please report it immediately:
                </p>
                <ul className="space-y-2 text-orange-700 text-sm">
                  <li>• Use the report button on profiles or messages</li>
                  <li>• Contact our safety team: safety@luvlang.com</li>
                  <li>• For emergencies, contact local authorities first</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Consequences</h4>
                <ul className="space-y-2 text-orange-700 text-sm">
                  <li>• Warning for minor violations</li>
                  <li>• Temporary suspension for repeated violations</li>
                  <li>• Permanent ban for serious violations</li>
                  <li>• Legal action for illegal activities</li>
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

export default CommunityGuidelines;
