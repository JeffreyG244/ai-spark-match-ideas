
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import EnhancedExecutiveMessaging from '@/components/messaging/EnhancedExecutiveMessaging';

const Messages: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Back to Dashboard button */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Messages
            </CardTitle>
            <p className="text-sm text-gray-600">
              Connect with other verified members through secure messaging
            </p>
          </CardHeader>
          <CardContent>
            <EnhancedExecutiveMessaging />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
