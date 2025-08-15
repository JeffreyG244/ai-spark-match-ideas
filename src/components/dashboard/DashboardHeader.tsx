
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/logo';

interface DashboardHeaderProps {
  onSignOut: () => void;
}

const DashboardHeader = ({ onSignOut }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <Logo size="md" className="mb-2" />
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
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

export default DashboardHeader;
