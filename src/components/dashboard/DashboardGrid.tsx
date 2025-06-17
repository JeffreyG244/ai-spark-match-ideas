
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Users, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardGrid = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Messages',
      description: 'Chat with your matches',
      icon: MessageCircle,
      path: '/messages',
      buttonText: 'Open Messages',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-200',
      buttonBg: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Matches',
      description: 'View your compatibility',
      icon: Heart,
      path: '/matches',
      buttonText: 'View Matches',
      iconColor: 'text-red-500',
      borderColor: 'border-red-200',
      buttonBg: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'Discover',
      description: 'Find new connections',
      icon: Users,
      path: '/discover',
      buttonText: 'Start Discovering',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200',
      buttonBg: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Membership',
      description: 'Upgrade your plan',
      icon: Crown,
      path: '/membership',
      buttonText: 'View Plans',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-200',
      buttonBg: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {dashboardItems.map((item) => (
        <Card key={item.title} className={`hover:shadow-lg transition-shadow ${item.borderColor}`}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center`}>
              <item.icon className={`h-8 w-8 ${item.iconColor}`} />
            </div>
            <CardTitle className="text-xl">{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate(item.path)}
              className={`w-full text-white ${item.buttonBg}`}
            >
              {item.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardGrid;
