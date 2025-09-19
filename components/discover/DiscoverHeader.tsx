
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/logo';

interface DiscoverHeaderProps {
  onSignOut: () => void;
}

const DiscoverHeader = ({ onSignOut }: DiscoverHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Logo size="sm" />
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
