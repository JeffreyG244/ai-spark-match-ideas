import React from 'react';
import { legalSections } from '@/data/legalSections';
import LegalHeader from '@/components/legal/LegalHeader';
import LegalSectionCard from '@/components/legal/LegalSectionCard';
import ComplianceSummary from '@/components/legal/ComplianceSummary';
import LegalFooter from '@/components/legal/LegalFooter';
const Legal = () => {
    return (<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        <LegalHeader />

        {/* Legal Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {legalSections.map((section, index) => (<LegalSectionCard key={index} section={section}/>))}
        </div>

        {/* Compliance Summary */}
        <div className="mt-12">
          <ComplianceSummary />
        </div>

        {/* Footer */}
        <div className="mt-12">
          <LegalFooter />
        </div>
      </div>
    </div>);
};
export default Legal;
