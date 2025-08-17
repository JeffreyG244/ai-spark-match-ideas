import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Users, MessageCircle, User, Crown, Calendar } from 'lucide-react';

const NavigationTabs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { value: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: User },
    { value: 'discover', label: 'Discover', path: '/discover', icon: Users },
    { value: 'daily-matches', label: 'Daily Matches', path: '/daily-matches', icon: Calendar },
    { value: 'matches', label: 'Matches', path: '/matches', icon: Heart },
    { value: 'messages', label: 'Messages', path: '/messages', icon: MessageCircle },
    { value: 'membership', label: 'Membership', path: '/membership', icon: Crown },
  ];

  return (
    <div className="w-full bg-love-surface/95 backdrop-blur-md border-b border-love-border/50 mb-6 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <Tabs value={currentPath} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent h-20 p-3 gap-3">
            {tabs.map(({ value, label, path, icon: Icon }) => (
              <Link key={value} to={path} className="flex-shrink-0">
                <TabsTrigger
                  value={path}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl 
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-love-primary data-[state=active]:to-love-secondary 
                  data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-love-primary/30
                  data-[state=active]:scale-105 data-[state=active]:border-love-primary/50
                  hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-400 hover:text-white hover:scale-[1.02] hover:border-purple-400 hover:shadow-lg
                  transition-all duration-300 ease-out whitespace-nowrap
                  border-2 border-purple-300 bg-gradient-to-r from-purple-200 to-pink-200 shadow-md
                  font-bold text-purple-800 text-sm
                  backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default NavigationTabs;