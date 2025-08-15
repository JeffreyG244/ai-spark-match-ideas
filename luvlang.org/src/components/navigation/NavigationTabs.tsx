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
    <div className="w-full bg-white/80 backdrop-blur-sm border-b border-purple-200 mb-6 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <Tabs value={currentPath} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent h-16 p-2">
            {tabs.map(({ value, label, path, icon: Icon }) => (
              <Link key={value} to={path} className="flex-shrink-0">
                <TabsTrigger
                  value={path}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm hover:bg-purple-50 transition-all duration-200 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
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