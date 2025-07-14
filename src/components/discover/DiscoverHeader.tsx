
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DiscoverHeaderProps {
  onSignOut: () => void;
}

const DiscoverHeader = ({ onSignOut }: DiscoverHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <img 
            src="/lovable-uploads/c9f4488e-3013-4e94-8393-ad5ecf13d1a6.png" 
            alt="Luvlang Logo" 
            className="h-8 object-contain"
          />
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
      <Button onClick={onSignOut} variant="outline">
        Sign Out
      </Button>
    </div>
  );
};

export default DiscoverHeader;
