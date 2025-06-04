
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { LegalSection } from '@/data/legalSections';

interface LegalSectionCardProps {
  section: LegalSection;
}

const LegalSectionCard: React.FC<LegalSectionCardProps> = ({ section }) => {
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
    <Card className={`${getColorClasses(section.color)} border-2 hover:shadow-lg transition-shadow`}>
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
  );
};

export default LegalSectionCard;
