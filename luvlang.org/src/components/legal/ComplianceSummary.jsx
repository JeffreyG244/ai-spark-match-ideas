import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, FileText } from 'lucide-react';
const ComplianceSummary = () => {
    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-white"/>
          </div>
          <h3 className="font-bold text-green-800 mb-2">User Safety</h3>
          <p className="text-green-700 text-sm">
            Comprehensive safety policies protect users from scams, harassment, and inappropriate content.
          </p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-white"/>
          </div>
          <h3 className="font-bold text-blue-800 mb-2">Data Protection</h3>
          <p className="text-blue-700 text-sm">
            GDPR, CCPA, and international privacy law compliance for global user base.
          </p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-white"/>
          </div>
          <h3 className="font-bold text-purple-800 mb-2">Legal Coverage</h3>
          <p className="text-purple-700 text-sm">
            Complete legal framework including liability protection and regulatory compliance.
          </p>
        </CardContent>
      </Card>
    </div>);
};
export default ComplianceSummary;
