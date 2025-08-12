
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContentModerationPolicy = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Content Moderation Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Content Moderation Policy</h1>
          <p className="text-lg text-gray-600">
            Our comprehensive approach to maintaining a safe and respectful community environment.
          </p>
        </div>

        <Card className="border-blue-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Moderation Principles</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Protect user safety and well-being</li>
                <li>Maintain community standards</li>
                <li>Prevent harmful or illegal content</li>
                <li>Foster authentic connections</li>
                <li>Ensure age-appropriate content</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Prohibited Content</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Absolutely Prohibited</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Nudity or sexually explicit content</li>
                <li>Harassment, threats, or hate speech</li>
                <li>Illegal activities or content</li>
                <li>Spam, scams, or fraudulent schemes</li>
                <li>Minors (under 18) or content involving minors</li>
                <li>Violence or self-harm content</li>
                <li>Copyrighted material without permission</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Restricted Content</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Excessive profanity or vulgar language</li>
                <li>Political or controversial topics</li>
                <li>Commercial solicitation</li>
                <li>Personal contact information sharing</li>
                <li>Off-platform communication requests</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Moderation Methods</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Automated Systems</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>AI-powered content scanning</li>
                <li>Image recognition technology</li>
                <li>Text analysis for inappropriate content</li>
                <li>Pattern detection for spam/scams</li>
                <li>Real-time message filtering</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Human Review</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>24/7 human moderation team</li>
                <li>User report investigations</li>
                <li>Appeal reviews</li>
                <li>Complex case evaluation</li>
                <li>Policy interpretation</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Enforcement Actions</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>Warning:</strong> First-time minor violations</li>
                <li><strong>Content Removal:</strong> Inappropriate posts/messages</li>
                <li><strong>Feature Restrictions:</strong> Limited messaging/matching</li>
                <li><strong>Temporary Suspension:</strong> 24 hours to 30 days</li>
                <li><strong>Permanent Ban:</strong> Serious or repeated violations</li>
                <li><strong>Legal Action:</strong> Illegal content or activities</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Appeals Process</h2>
              <p className="mb-4 text-gray-700">
                Users may appeal moderation decisions within 30 days by contacting support@luvlang.org 
                with their case details. Appeals are reviewed by senior moderation staff within 72 hours.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Contact</h2>
              <p className="text-gray-700">
                All inquiries: support@luvlang.org
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

export default ContentModerationPolicy;
