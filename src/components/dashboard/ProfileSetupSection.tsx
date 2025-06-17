
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Brain, Camera } from 'lucide-react';

interface ProfileSetupSectionProps {
  onStartProfileSetup: () => void;
}

const ProfileSetupSection = ({ onStartProfileSetup }: ProfileSetupSectionProps) => {
  const profileSetupItems = [
    {
      title: 'Create Profile',
      description: 'Complete your basic information',
      icon: User,
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Compatibility Questions',
      description: 'Answer questions to find better matches',
      icon: Brain,
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Profile Pics',
      description: 'Upload verified photos',
      icon: Camera,
      iconColor: 'text-green-500',
      borderColor: 'border-green-200',
    }
  ];

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Profile</h2>
        <p className="text-gray-600">Complete these steps to get the best matches</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
        {profileSetupItems.map((item) => (
          <Card key={item.title} className={`hover:shadow-lg transition-shadow ${item.borderColor}`}>
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center`}>
                <item.icon className={`h-8 w-8 ${item.iconColor}`} />
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={onStartProfileSetup}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Start Profile Setup
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetupSection;
