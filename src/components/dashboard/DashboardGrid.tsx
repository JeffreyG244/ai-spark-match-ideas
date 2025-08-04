
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Users, Crown, ArrowRight } from 'lucide-react';
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
      gradient: 'from-love-primary to-love-secondary',
      iconGradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10'
    },
    {
      title: 'Matches',
      description: 'View your compatibility',
      icon: Heart,
      path: '/matches',
      buttonText: 'View Matches',
      gradient: 'from-rose-500 to-pink-600',
      iconGradient: 'from-rose-400 to-pink-500',
      bgGradient: 'from-rose-500/10 to-pink-500/10'
    },
    {
      title: 'Discover',
      description: 'Find new connections',
      icon: Users,
      path: '/discover',
      buttonText: 'Start Discovering',
      gradient: 'from-love-secondary to-love-accent',
      iconGradient: 'from-blue-400 to-purple-500',
      bgGradient: 'from-blue-500/10 to-purple-500/10'
    },
    {
      title: 'Membership',
      description: 'Upgrade your plan',
      icon: Crown,
      path: '/membership',
      buttonText: 'View Plans',
      gradient: 'from-amber-500 to-orange-600',
      iconGradient: 'from-amber-400 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10'
    }
  ];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      {dashboardItems.map((item) => (
        <Card 
          key={item.title} 
          className={`bg-gradient-to-br ${item.bgGradient} border-love-border/50 hover:border-love-primary/50
            hover:shadow-2xl hover:shadow-love-primary/20 hover:scale-[1.03]
            transition-all duration-300 cursor-pointer group backdrop-blur-sm relative overflow-hidden`}
          onClick={() => handleCardClick(item.path)}
        >
          {/* Enhanced gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          <CardHeader className="text-center relative z-10 pt-8">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.iconGradient} p-[2px] group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <div className="w-full h-full bg-love-card rounded-2xl flex items-center justify-center">
                <item.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            
            <CardTitle className="text-xl font-bold text-love-text group-hover:text-love-primary transition-colors duration-300">
              {item.title}
            </CardTitle>
            
            <CardDescription className="text-love-text-muted mt-2">
              {item.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center pb-6 relative z-10">
            <div className="flex items-center justify-center text-love-text-muted group-hover:text-love-primary transition-colors duration-300 mb-4">
              <span className="text-sm font-medium mr-2">Get Started</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(item.path);
              }}
              className={`w-full bg-gradient-to-r ${item.gradient} hover:scale-105 
                text-white font-semibold py-2.5 rounded-xl
                shadow-lg hover:shadow-xl transition-all duration-300`}
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
