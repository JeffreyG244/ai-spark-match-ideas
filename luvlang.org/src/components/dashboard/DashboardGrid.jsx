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
            iconColor: 'text-purple-500',
            borderColor: 'border-purple-200',
            bgColor: 'bg-purple-50',
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
            bgColor: 'bg-red-50',
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
            bgColor: 'bg-blue-50',
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
            bgColor: 'bg-orange-50',
            buttonBg: 'bg-orange-500 hover:bg-orange-600'
        }
    ];
    const handleCardClick = (path) => {
        navigate(path);
    };
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {dashboardItems.map((item) => (<Card key={item.title} className={`
            ${item.borderColor} ${item.bgColor} 
            hover:shadow-lg hover:scale-105 
            transition-all duration-200 cursor-pointer 
            group border-2 hover:border-purple-300
          `} onClick={() => handleCardClick(item.path)}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow`}>
              <item.icon className={`h-8 w-8 ${item.iconColor}`}/>
            </div>
            
            <CardTitle className="text-xl group-hover:text-purple-700 transition-colors">
              {item.title}
            </CardTitle>
            
            <CardDescription className="text-gray-600">
              {item.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center pb-4">
            <div className="flex items-center justify-center text-purple-600 group-hover:text-purple-700 transition-colors mb-4">
              <span className="text-sm font-medium mr-2">Get Started</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
            </div>
            
            <Button onClick={(e) => {
                e.stopPropagation(); // Prevent card click when button is clicked
                navigate(item.path);
            }} className={`w-full text-white shadow-md hover:shadow-lg transition-shadow ${item.buttonBg}`}>
              {item.buttonText}
            </Button>
          </CardContent>
        </Card>))}
    </div>);
};
export default DashboardGrid;
