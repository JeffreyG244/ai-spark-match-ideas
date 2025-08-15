import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
const DiscoverHeader = ({ onSignOut }) => {
    return (<div className="flex justify-between items-center mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Heart className="h-6 w-6 text-white"/>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Luvlang</h2>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2"/>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
      <Button onClick={onSignOut} variant="outline">
        Sign Out
      </Button>
    </div>);
};
export default DiscoverHeader;
