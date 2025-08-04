
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
      gradient: 'from-love-primary to-love-secondary',
      step: 1
    },
    {
      title: 'Compatibility Questions',
      description: 'Answer questions to find better matches',
      icon: Brain,
      gradient: 'from-love-secondary to-love-accent',
      step: 2
    },
    {
      title: 'Profile Pics',
      description: 'Upload verified photos',
      icon: Camera,
      gradient: 'from-love-accent to-love-primary',
      step: 3
    }
  ];

  const handleStepClick = (step: number) => {
    // For now, all steps lead to the profile setup
    // In the future, you could navigate to specific sections
    onStartProfileSetup();
  };

  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-love-text mb-4">Complete Your Profile</h2>
        <p className="text-love-text-light text-lg">Follow these steps to get the best matches</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {profileSetupItems.map((item) => (
          <Card 
            key={item.title} 
            className="bg-love-card border-love-border/50 hover:border-love-primary/50 
              hover:shadow-2xl hover:shadow-love-primary/20 hover:scale-[1.03]
              transition-all duration-300 cursor-pointer group
              backdrop-blur-sm relative overflow-hidden"
            onClick={() => handleStepClick(item.step)}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <CardHeader className="text-center relative z-10 pt-8">
              {/* Step number badge */}
              <div className={`absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br ${item.gradient} text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg`}>
                {item.step}
              </div>
              
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.gradient} p-[2px] group-hover:scale-110 transition-transform duration-300`}>
                <div className="w-full h-full bg-love-card rounded-2xl flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-love-primary group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              
              <CardTitle className="text-xl font-bold text-love-text group-hover:text-love-primary transition-colors duration-300">
                {item.title}
              </CardTitle>
              
              <CardDescription className="text-love-text-muted mt-2">
                {item.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center pb-6 relative z-10">
              <div className={`flex items-center justify-center text-love-text-muted group-hover:text-love-primary transition-colors duration-300`}>
                <span className="text-sm font-medium mr-2">Get Started</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={onStartProfileSetup}
          className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 
            text-white px-12 py-4 text-lg font-semibold rounded-2xl
            shadow-xl shadow-love-primary/30 hover:shadow-2xl hover:shadow-love-primary/40 
            hover:scale-105 transition-all duration-300 backdrop-blur-sm"
        >
          Start Profile Setup
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetupSection;
