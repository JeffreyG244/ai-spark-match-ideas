
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Brain, Camera, Heart } from 'lucide-react';

interface ProfileSectionNavigationProps {
  activeSection: 'profile' | 'personality' | 'interests' | 'photos';
  setActiveSection: (section: 'profile' | 'personality' | 'interests' | 'photos') => void;
  personalityAnswerCount: number;
  interestCount: number;
  photoCount: number;
}

const ProfileSectionNavigation = ({
  activeSection,
  setActiveSection,
  personalityAnswerCount,
  interestCount,
  photoCount
}: ProfileSectionNavigationProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Button
        variant={activeSection === 'profile' ? 'default' : 'outline'}
        onClick={() => setActiveSection('profile')}
        className={`flex items-center gap-2 ${
          activeSection === 'profile' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-white/90 text-foreground border-2 hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <User className="h-4 w-4" />
        Basic Profile
      </Button>
      <Button
        variant={activeSection === 'personality' ? 'default' : 'outline'}
        onClick={() => setActiveSection('personality')}
        className={`flex items-center gap-2 ${
          activeSection === 'personality' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-white/90 text-foreground border-2 hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Brain className="h-4 w-4" />
        Personality ({personalityAnswerCount}/6)
      </Button>
      <Button
        variant={activeSection === 'interests' ? 'default' : 'outline'}
        onClick={() => setActiveSection('interests')}
        className={`flex items-center gap-2 ${
          activeSection === 'interests' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-white/90 text-foreground border-2 hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Heart className="h-4 w-4" />
        Interests ({interestCount})
      </Button>
      <Button
        variant={activeSection === 'photos' ? 'default' : 'outline'}
        onClick={() => setActiveSection('photos')}
        className={`flex items-center gap-2 ${
          activeSection === 'photos' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-white/90 text-foreground border-2 hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Camera className="h-4 w-4" />
        Photos ({photoCount}/6)
      </Button>
    </div>
  );
};

export default ProfileSectionNavigation;
