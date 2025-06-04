
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Users, Lock, AlertTriangle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Legal = () => {
  const legalSections = [
    {
      title: "Core Legal Documents",
      icon: FileText,
      color: "blue",
      policies: [
        { name: "Privacy Policy", path: "/legal/privacy", required: true },
        { name: "Terms of Service", path: "/legal/terms", required: true },
        { name: "Community Guidelines", path: "/legal/community", required: true },
        { name: "Cookie Policy", path: "/legal/cookies", required: true },
        { name: "Content Moderation Policy", path: "/legal/moderation", required: true }
      ]
    },
    {
      title: "Safety & Security",
      icon: Shield,
      color: "green",
      policies: [
        { name: "Safety Tips & Guidelines", path: "/legal/safety", required: true },
        { name: "Age Verification Policy", path: "/legal/age-verification", required: true },
        { name: "Identity Verification Policy", path: "/legal/identity-verification", required: true },
        { name: "Romance Scam Prevention", path: "/legal/scam-prevention", required: true },
        { name: "Blocking & Reporting Policy", path: "/legal/reporting", required: true }
      ]
    },
    {
      title: "Data Protection & Privacy",
      icon: Lock,
      color: "purple",
      policies: [
        { name: "GDPR Compliance (EU)", path: "/legal/gdpr", required: true },
        { name: "CCPA Compliance (California)", path: "/legal/ccpa", required: true },
        { name: "Data Retention Policy", path: "/legal/data-retention", required: true },
        { name: "Data Breach Notification", path: "/legal/breach-notification", required: true },
        { name: "Account Deletion Policy", path: "/legal/account-deletion", required: true }
      ]
    },
    {
      title: "Platform Operations",
      icon: Users,
      color: "orange",
      policies: [
        { name: "Photo Verification Guidelines", path: "/legal/photo-verification", required: true },
        { name: "Message Monitoring Policy", path: "/legal/message-monitoring", required: true },
        { name: "Account Suspension Policy", path: "/legal/suspension", required: true },
        { name: "Appeals Process", path: "/legal/appeals", required: true },
        { name: "Inactive Account Policy", path: "/legal/inactive-accounts", required: false }
      ]
    },
    {
      title: "Legal Protection",
      icon: AlertTriangle,
      color: "red",
      policies: [
        { name: "Liability Disclaimer", path: "/legal/liability", required: true },
        { name: "Background Check Disclaimer", path: "/legal/background-check", required: true },
        { name: "Health & Safety Disclaimer", path: "/legal/health-safety", required: true },
        { name: "DMCA Policy", path: "/legal/dmca", required: true },
        { name: "Intellectual Property Policy", path: "/legal/ip", required: false }
      ]
    },
    {
      title: "Financial & Subscriptions",
      icon: Heart,
      color: "pink",
      policies: [
        { name: "Subscription Policy", path: "/legal/subscription", required: false },
        { name: "Refund Policy", path: "/legal/refunds", required: false },
        { name: "Billing Terms", path: "/legal/billing", required: false }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "border-blue-200 bg-blue-50",
      green: "border-green-200 bg-green-50",
      purple: "border-purple-200 bg-purple-50",
      orange: "border-orange-200 bg-orange-50",
      red: "border-red-200 bg-red-50",
      pink: "border-pink-200 bg-pink-50"
    };
    return colorMap[color as keyof typeof colorMap] || "border-gray-200 bg-gray-50";
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600",
      red: "text-red-600",
      pink: "text-pink-600"
    };
    return colorMap[color as keyof typeof colorMap] || "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal & Regulatory Compliance</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Comprehensive legal documentation to protect both our platform and our users. 
            All policies are designed to ensure safety, privacy, and legal compliance.
          </p>
        </div>

        {/* Critical Notice */}
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-800 mb-2">Launch Readiness Status</h3>
              <p className="text-red-700 mb-3">
                <strong>Critical:</strong> All policies marked as "Required" must be implemented before public launch 
                to ensure legal compliance and user safety.
              </p>
              <p className="text-sm text-red-600">
                Recommended: Consult with a technology lawyer specializing in dating platforms before launch.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {legalSections.map((section, index) => (
            <Card key={index} className={`${getColorClasses(section.color)} border-2 hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <section.icon className={`h-8 w-8 ${getIconColor(section.color)}`} />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.policies.map((policy, policyIndex) => (
                    <div key={policyIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Link 
                          to={policy.path}
                          className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {policy.name}
                        </Link>
                        {policy.required && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <Link 
                        to={policy.path}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compliance Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-white" />
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
                <Lock className="h-6 w-6 text-white" />
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
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-purple-800 mb-2">Legal Coverage</h3>
              <p className="text-purple-700 text-sm">
                Complete legal framework including liability protection and regulatory compliance.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-2">Legal Questions?</h3>
            <p className="text-gray-600 mb-4">
              For questions about our legal policies or to report concerns, contact our legal team.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="mailto:legal@luvlang.com" 
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                legal@luvlang.com
              </a>
              <span className="text-gray-400">|</span>
              <Link 
                to="/contact" 
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
