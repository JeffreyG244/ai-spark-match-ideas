
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import MessagingInterface from '@/components/messaging/MessagingInterface';

const Messages: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
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
          <MessagingInterface />
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
