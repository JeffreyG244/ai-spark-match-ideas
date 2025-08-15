import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
const GDPR = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → GDPR Compliance (EU)
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GDPR Compliance (EU)</h1>
          <p className="text-lg text-gray-600">
            Our commitment to protecting the privacy rights of European Union users.
          </p>
        </div>

        <Card className="border-purple-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Your GDPR Rights</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>Right to be informed:</strong> Transparent information about data processing</li>
                <li><strong>Right of access:</strong> Request copies of your personal data</li>
                <li><strong>Right to rectification:</strong> Correct inaccurate personal data</li>
                <li><strong>Right to erasure:</strong> Request deletion of your data</li>
                <li><strong>Right to restrict processing:</strong> Limit how we use your data</li>
                <li><strong>Right to data portability:</strong> Transfer your data to another service</li>
                <li><strong>Right to object:</strong> Object to certain types of processing</li>
                <li><strong>Rights related to automated decision making:</strong> Protection from automated profiling</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Legal Basis for Processing</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Consent</h3>
                  <p className="text-blue-700">Marketing communications, optional features, cookies</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Contract Performance</h3>
                  <p className="text-green-700">Account creation, matching services, payment processing</p>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Legitimate Interest</h3>
                  <p className="text-orange-700">Fraud prevention, security monitoring, service improvement</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Legal Obligation</h3>
                  <p className="text-red-700">Age verification, safety reporting, regulatory compliance</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Data Transfers</h2>
              <p className="mb-4 text-gray-700">
                When transferring data outside the EU, we ensure adequate protection through:
              </p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Adequacy decisions by the European Commission</li>
                <li>Binding Corporate Rules where applicable</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Retention</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>Active accounts:</strong> Data retained while account is active</li>
                <li><strong>Inactive accounts:</strong> Deleted after 2 years of inactivity</li>
                <li><strong>Deleted accounts:</strong> Most data deleted within 30 days</li>
                <li><strong>Legal compliance:</strong> Some data retained for legal obligations</li>
                <li><strong>Safety records:</strong> Violation records kept for 7 years</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Exercising Your Rights</h2>
              <p className="mb-4 text-gray-700">To exercise your GDPR rights:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Email: gdpr@luvlang.com</li>
                <li>Use in-app privacy controls</li>
                <li>Submit requests through your account settings</li>
                <li>Response time: Within 30 days</li>
                <li>Free of charge (unless requests are excessive)</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Protection Officer</h2>
              <p className="text-gray-700">
                Contact our Data Protection Officer:
                <br />
                Email: dpo@luvlang.com
                <br />
                Address: [DPO Address]
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Supervisory Authority</h2>
              <p className="text-gray-700">
                You have the right to lodge a complaint with your local supervisory authority.
                <br />
                Find your authority: <a href="https://edpb.europa.eu/about-edpb/board/members_en" className="text-purple-600 hover:text-purple-800">EDPB Member List</a>
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
export default GDPR;
