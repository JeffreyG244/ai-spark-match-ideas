
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = () => {
  return (
    <Card className="border-purple-200 p-8 text-center">
      <CardContent>
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No More Profiles</h3>
        <p className="text-gray-600 mb-6">
          You've seen all available profiles. Check back later for new connections!
        </p>
        <Link to="/matches">
          <Button className="bg-purple-600 hover:bg-purple-700">
            View Your Matches
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
