
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Heart, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PhotoVerification = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Photo Verification Guidelines
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Photo Verification Guidelines</h1>
          <p className="text-lg text-gray-600">
            Standards and requirements for photo verification to ensure authentic profiles.
          </p>
        </div>

        <Card className="border-orange-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Photo Standards</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Acceptable Photos
                  </h3>
                  <ul className="list-disc list-inside text-green-700 space-y-1">
                    <li>Clear view of your face (no sunglasses or masks)</li>
                    <li>Well-lit photos with good visibility</li>
                    <li>Recent photos (taken within the last 2 years)</li>
                    <li>Solo photos where you can be clearly identified</li>
                    <li>Natural poses and expressions</li>
                    <li>Appropriate clothing and settings</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">❌ Prohibited Photos</h3>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    <li>Photos of other people or celebrities</li>
                    <li>Group photos where you cannot be identified</li>
                    <li>Heavily filtered or edited photos</li>
                    <li>Photos with faces obscured or covered</li>
                    <li>Inappropriate, nude, or sexually suggestive images</li>
                    <li>Screenshots from other platforms or stock images</li>
                    <li>Photos of children, even if they're your own</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Live Verification Process</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Real-Time Photo Capture
                  </h3>
                  <p className="text-blue-700 mb-3">
                    Our verification system requires live photo capture to prevent fake profiles:
                  </p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Photos must be taken in real-time through our app</li>
                    <li>No uploaded photos from your gallery accepted</li>
                    <li>Multiple angles and poses may be required</li>
                    <li>Facial recognition technology confirms authenticity</li>
                    <li>Comparison with your profile photos for consistency</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Verification Steps</h3>
                  <ol className="list-decimal list-inside text-purple-700 space-y-1">
                    <li>Take a clear, front-facing selfie</li>
                    <li>Capture a profile (side) view</li>
                    <li>Follow specific pose instructions (e.g., specific hand gesture)</li>
                    <li>Ensure good lighting and clear visibility</li>
                    <li>Wait for automated and manual review (24-72 hours)</li>
                    <li>Receive verification badge upon approval</li>
                  </ol>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Technical Requirements</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>Image Quality:</strong> Minimum 640x480 resolution</li>
                <li><strong>File Format:</strong> JPEG, PNG, or WebP</li>
                <li><strong>File Size:</strong> Between 100KB and 10MB</li>
                <li><strong>Lighting:</strong> Sufficient natural or artificial lighting</li>
                <li><strong>Background:</strong> Any background (not necessarily plain)</li>
                <li><strong>Face Coverage:</strong> At least 60% of image should be your face</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Review Process</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Automated Review</h3>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    <li>AI-powered facial recognition analysis</li>
                    <li>Comparison with existing profile photos</li>
                    <li>Detection of image manipulation or filters</li>
                    <li>Quality and technical standards check</li>
                    <li>Initial approval or flagging for human review</li>
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Human Review</h3>
                  <ul className="list-disc list-inside text-orange-700 space-y-1">
                    <li>Manual verification by trained staff</li>
                    <li>Review of flagged or unclear cases</li>
                    <li>Consideration of appeals and disputes</li>
                    <li>Final approval or rejection decision</li>
                    <li>Feedback provided for rejected submissions</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Verification Badges</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Photo Verified
                  </h4>
                  <p className="text-green-700 text-sm">
                    Profile photos have been verified through our live capture process
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Identity Verified</h4>
                  <p className="text-blue-700 text-sm">
                    Additional verification including government ID confirmation
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Failed Verification</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Clear explanation of rejection reasons provided</li>
                <li>Up to 3 retry attempts allowed</li>
                <li>Guidance on how to improve photo quality</li>
                <li>Appeal process available for disputed decisions</li>
                <li>Temporary account restrictions until successful verification</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Security</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Verification photos are encrypted and securely stored</li>
                <li>Access limited to authorized verification personnel</li>
                <li>Photos deleted after successful verification</li>
                <li>No sharing of verification images with other users</li>
                <li>Compliance with privacy laws and regulations</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Ongoing Requirements</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>New profile photos must match verified appearance</li>
                <li>Periodic re-verification may be required</li>
                <li>Significant appearance changes may trigger new verification</li>
                <li>User reports can prompt additional verification requests</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Support</h2>
              <p className="text-gray-700">
                For photo verification assistance:
                <br />
                Email: support@luvlang.org
                <br />
                Phone: 1-800-LUVLANG (1-800-588-5264)
                <br />
                Response time: Within 24 hours
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

export default PhotoVerification;
