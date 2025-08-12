
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Heart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const DataRetention = () => {
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
            <Link to="/legal" className="hover:text-purple-600">Legal</Link> → Data Retention Policy
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Retention Policy</h1>
          <p className="text-lg text-gray-600">
            How long we keep your data and why we retain different types of information.
          </p>
        </div>

        <Card className="border-purple-200">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Retention Principles</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Data is retained only as long as necessary for stated purposes</li>
                <li>Different data types have different retention periods</li>
                <li>Legal obligations may require longer retention</li>
                <li>Users can request earlier deletion in most cases</li>
                <li>Secure deletion methods are used when data is removed</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Data Retention</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Active Accounts</h3>
                  </div>
                  <p className="text-green-700 mb-2">Data retained while account is active and functional</p>
                  <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                    <li>Profile information and photos</li>
                    <li>Match and conversation history</li>
                    <li>Preference settings</li>
                    <li>Subscription and payment data</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Inactive Accounts (2 Years)</h3>
                  </div>
                  <p className="text-yellow-700 mb-2">Accounts with no login activity for 24 months</p>
                  <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                    <li>Profile deactivated and hidden</li>
                    <li>Email notification before deletion</li>
                    <li>30-day grace period to reactivate</li>
                    <li>Complete deletion after grace period</li>
                  </ul>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">Deleted Accounts (30 Days)</h3>
                  </div>
                  <p className="text-red-700 mb-2">User-requested account deletion</p>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    <li>Most data deleted within 30 days</li>
                    <li>Some data retained for legal compliance</li>
                    <li>Matches/conversations removed from other users</li>
                    <li>Payment history retained per financial regulations</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Specific Data Retention Periods</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 mb-6">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Data Type</th>
                      <th className="border border-gray-300 p-3 text-left">Retention Period</th>
                      <th className="border border-gray-300 p-3 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr>
                      <td className="border border-gray-300 p-3">Profile Photos</td>
                      <td className="border border-gray-300 p-3">Until account deletion</td>
                      <td className="border border-gray-300 p-3">Service functionality</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Messages</td>
                      <td className="border border-gray-300 p-3">Until account deletion</td>
                      <td className="border border-gray-300 p-3">User experience</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Payment Records</td>
                      <td className="border border-gray-300 p-3">7 years</td>
                      <td className="border border-gray-300 p-3">Financial regulations</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Safety Violations</td>
                      <td className="border border-gray-300 p-3">7 years</td>
                      <td className="border border-gray-300 p-3">Safety/legal compliance</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Device/IP Logs</td>
                      <td className="border border-gray-300 p-3">90 days</td>
                      <td className="border border-gray-300 p-3">Security monitoring</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Analytics Data</td>
                      <td className="border border-gray-300 p-3">26 months</td>
                      <td className="border border-gray-300 p-3">Service improvement</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Verification Documents</td>
                      <td className="border border-gray-300 p-3">30 days post-verification</td>
                      <td className="border border-gray-300 p-3">Identity confirmation</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Retention Requirements</h2>
              <p className="mb-4 text-gray-700">Some data must be retained longer due to legal obligations:</p>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li><strong>Financial Records:</strong> 7 years (tax and audit requirements)</li>
                <li><strong>Safety Reports:</strong> 7 years (law enforcement cooperation)</li>
                <li><strong>Age Verification:</strong> 3 years (regulatory compliance)</li>
                <li><strong>DMCA Notices:</strong> 3 years (copyright law)</li>
                <li><strong>Subpoena Materials:</strong> As required by court order</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Deletion Process</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Secure Deletion Standards</h3>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Multi-pass overwriting for storage devices</li>
                    <li>Cryptographic erasure for encrypted data</li>
                    <li>Physical destruction of decommissioned hardware</li>
                    <li>Verification of deletion completion</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Deletion Timeline</h3>
                  <ul className="list-disc list-inside text-purple-700 space-y-1">
                    <li>Profile data: Within 30 days of account deletion</li>
                    <li>Backup systems: Within 90 days</li>
                    <li>Log files: Next scheduled purge cycle</li>
                    <li>Third-party data: Immediate notification to delete</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. User Control Over Data Retention</h2>
              <ul className="list-disc list-inside mb-6 text-gray-700 space-y-2">
                <li>Delete individual messages or photos anytime</li>
                <li>Request account deletion through settings</li>
                <li>Download your data before deletion</li>
                <li>Request specific data deletion (subject to legal requirements)</li>
                <li>Control marketing data retention preferences</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to Retention Policy</h2>
              <p className="mb-6 text-gray-700">
                We may update retention periods based on legal requirements, business needs, or user feedback. 
                Users will be notified of significant changes 30 days in advance.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
              <p className="text-gray-700">
                Questions about data retention:
                <br />
                Email: support@luvlang.org
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

export default DataRetention;
