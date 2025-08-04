
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {dashboardItems.map((item) => (
        <Card 
          key={item.title} 
          className="bg-slate-800/40 backdrop-blur-xl border border-slate-600/30 hover:border-purple-500/50
            hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02]
            transition-all duration-300 cursor-pointer group relative overflow-hidden"
          onClick={() => handleCardClick(item.path)}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.iconGradient} flex items-center justify-center
                shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="h-8 w-8 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                  className={`bg-gradient-to-r ${item.gradient} hover:opacity-90 
                    text-white font-medium py-2 px-6 rounded-xl text-sm
                    shadow-md hover:shadow-lg transition-all duration-300`}
                >
                  {item.buttonText}
                </Button>
              </div>
              
              <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardGrid;
