
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, AlertTriangle, FileText } from 'lucide-react';
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
            Creating a safe, respectful, and authentic environment for everyone.
          </p>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-bold text-blue-800 mb-2">Safety First</h3>
              <p className="text-blue-700 text-sm">
                We prioritize user safety and work to prevent harassment and abuse.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-green-800 mb-2">Authentic Connections</h3>
              <p className="text-green-700 text-sm">
                We encourage genuine profiles and meaningful interactions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-bold text-purple-800 mb-2">Respectful Behavior</h3>
              <p className="text-purple-700 text-sm">
                We expect all users to treat each other with dignity and respect.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines Sections */}
        <div className="space-y-8">
          {/* Profile Standards */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Profile Standards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-800">Required:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Use real, recent photos of yourself</li>
                  <li>Provide accurate age and basic information</li>
                  <li>Write authentic descriptions about yourself</li>
                  <li>Use your real first name or a genuine nickname</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-800 mt-6">Prohibited:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Fake profiles or impersonating others</li>
                  <li>Using photos of other people</li>
                  <li>Significantly outdated photos (older than 2 years)</li>
                  <li>Group photos where you can't be identified</li>
                  <li>Photos of children, even if they're your own</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Communication Standards */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-800">Communication Standards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-800">Encouraged:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Respectful and thoughtful messages</li>
                  <li>Honest communication about intentions</li>
                  <li>Respectful responses to rejection</li>
                  <li>Constructive and positive interactions</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-800 mt-6">Prohibited:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Harassment, threats, or abusive language</li>
                  <li>Sexually explicit messages or content</li>
                  <li>Spam or repetitive unwanted messages</li>
                  <li>Requests for money, gifts, or financial assistance</li>
                  <li>Sharing personal contact information in initial messages</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Content Guidelines */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-800">Content Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-800">Acceptable Content:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Tasteful photos that clearly show your face</li>
                  <li>Positive and genuine profile descriptions</li>
                  <li>Appropriate hobby and interest photos</li>
                  <li>Professional or casual photos in appropriate settings</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-gray-800 mt-6">Prohibited Content:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Nudity, sexually explicit, or suggestive content</li>
                  <li>Violence, weapons, or illegal activities</li>
                  <li>Hate speech, discrimination, or offensive language</li>
                  <li>Commercial advertising or promotional content</li>
                  <li>Copyrighted material without permission</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Safety Requirements */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-2xl text-red-800">Safety Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-red-800">
                <h3 className="text-xl font-semibold">Zero Tolerance for:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Any form of harassment or stalking</li>
                  <li>Threats of violence or actual violence</li>
                  <li>Sharing intimate images without consent</li>
                  <li>Attempting to obtain personal or financial information</li>
                  <li>Catfishing or romantic scams</li>
                  <li>Any illegal activities or solicitation</li>
                </ul>
                
                <div className="mt-6 p-4 bg-white rounded-lg border border-red-200">
                  <h4 className="font-semibold mb-2">If You Experience Violations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use the report button immediately</li>
                    <li>Block the user if necessary</li>
                    <li>Contact support at support@luvlang.org</li>
                    <li>Save evidence if safe to do so</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enforcement */}
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-2xl text-orange-800">Enforcement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-xl font-semibold text-gray-800">Violation Consequences:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Warning:</strong> First-time minor violations</li>
                  <li><strong>Content Removal:</strong> Inappropriate photos or text</li>
                  <li><strong>Temporary Suspension:</strong> Repeated violations</li>
                  <li><strong>Permanent Ban:</strong> Serious safety violations</li>
                  <li><strong>Legal Action:</strong> Criminal behavior or threats</li>
                </ul>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Appeals Process:</h4>
                  <p className="text-gray-700">
                    If you believe your account was suspended in error, you can appeal by contacting 
                    support@luvlang.org within 30 days of the action.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
