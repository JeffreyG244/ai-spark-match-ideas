
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Brain, Camera, ArrowRight } from 'lucide-react';

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
      bgColor: 'bg-purple-50',
      step: 1
    },
    {
      title: 'Compatibility Questions',
      description: 'Answer questions to find better matches',
      icon: Brain,
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      step: 2
    },
    {
      title: 'Profile Pics',
      description: 'Upload verified photos',
      icon: Camera,
      iconColor: 'text-green-500',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      step: 3
    }
  ];

  const handleStepClick = (step: number) => {
    // For now, all steps lead to the profile setup
    // In the future, you could navigate to specific sections
    onStartProfileSetup();
  };

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">Follow these steps to get the best matches</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
        {profileSetupItems.map((item) => (
          <Card 
            key={item.title} 
            className={`
              ${item.borderColor} ${item.bgColor} 
              hover:shadow-lg hover:scale-105 
              transition-all duration-200 cursor-pointer 
              group border-2 hover:border-purple-300
            `}
            onClick={() => handleStepClick(item.step)}
          >
            <CardHeader className="text-center relative">
              {/* Step number badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {item.step}
              </div>
              
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow`}>
                <item.icon className={`h-8 w-8 ${item.iconColor}`} />
              </div>
              
              <CardTitle className="text-xl group-hover:text-purple-700 transition-colors">
                {item.title}
              </CardTitle>
              
              <CardDescription className="text-gray-600">
                {item.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center pb-4">
              <div className="flex items-center justify-center text-purple-600 group-hover:text-purple-700 transition-colors">
                <span className="text-sm font-medium mr-2">Get Started</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={onStartProfileSetup}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          Start Profile Setup
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetupSection;
