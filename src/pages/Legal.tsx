
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { legalSections } from '@/data/legalSections';
import LegalHeader from '@/components/legal/LegalHeader';
import LegalSectionCard from '@/components/legal/LegalSectionCard';
import ComplianceSummary from '@/components/legal/ComplianceSummary';
import LegalFooter from '@/components/legal/LegalFooter';

const Legal = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/">
                <Logo size="md" />
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Home
                </Link>
                <Link to="/how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">
                  How It Works
                </Link>
                <Link to="/safety" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Safety
                </Link>
                <Link to="/success-stories" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Success Stories
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/membership">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <LegalHeader />

        {/* Legal Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {legalSections.map((section, index) => (
            <LegalSectionCard key={index} section={section} />
          ))}
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
    </div>
  );
};

export default Legal;
