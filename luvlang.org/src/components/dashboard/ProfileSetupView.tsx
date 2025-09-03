
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import ExecutiveProfileForm from '@/components/profile/ExecutiveProfileForm';

interface ProfileSetupViewProps {
  onBack: () => void;
  onSignOut: () => void;
}

const ProfileSetupView = ({ onBack, onSignOut }: ProfileSetupViewProps) => {
  return (
    <div className="min-h-screen bg-love-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="mb-2">
              <Logo size="md" />
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={onBack}
                className="border-love-border bg-love-surface/50 text-love-text hover:bg-love-card hover:border-love-primary/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
          <Button 
            onClick={onSignOut} 
            variant="outline"
            className="border-love-border bg-love-surface/50 text-love-text hover:bg-love-card hover:border-love-primary/50"
          >
            Sign Out
          </Button>
        </div>

        <ExecutiveProfileForm />
      </div>
    </div>
  );
};

export default ProfileSetupView;
