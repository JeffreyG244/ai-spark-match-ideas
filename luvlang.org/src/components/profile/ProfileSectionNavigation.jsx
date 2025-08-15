import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Brain, Camera, Heart } from 'lucide-react';
const ProfileSectionNavigation = ({ activeSection, setActiveSection, personalityAnswerCount, interestCount, photoCount }) => {
    return (<div className="flex flex-wrap gap-4">
      <Button variant={activeSection === 'profile' ? 'default' : 'outline'} onClick={() => setActiveSection('profile')} className="flex items-center gap-2">
        <User className="h-4 w-4"/>
        Basic Profile
      </Button>
      <Button variant={activeSection === 'personality' ? 'default' : 'outline'} onClick={() => setActiveSection('personality')} className="flex items-center gap-2">
        <Brain className="h-4 w-4"/>
        Personality ({personalityAnswerCount}/6)
      </Button>
      <Button variant={activeSection === 'interests' ? 'default' : 'outline'} onClick={() => setActiveSection('interests')} className="flex items-center gap-2">
        <Heart className="h-4 w-4"/>
        Interests ({interestCount})
      </Button>
      <Button variant={activeSection === 'photos' ? 'default' : 'outline'} onClick={() => setActiveSection('photos')} className="flex items-center gap-2">
        <Camera className="h-4 w-4"/>
        Photos ({photoCount}/6)
      </Button>
    </div>);
};
export default ProfileSectionNavigation;
