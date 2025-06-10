
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface LegalSectionCardProps {
  section: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      path: string;
      icon: string;
    }>;
  };
}

const LegalSectionCard = ({ section }: LegalSectionCardProps) => {
  return (
    <Card className="border-purple-200 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl text-purple-800">{section.title}</CardTitle>
        <p className="text-gray-600">{section.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {section.items.map((item, index) => {
            const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
            
            return (
              <Link
                key={index}
                to={item.path}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  {IconComponent && <IconComponent className="h-4 w-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LegalSectionCard;
