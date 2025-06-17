
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, Users, Crown, ArrowLeft, User, Brain, Camera } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ProfileManager from '@/components/ProfileManager';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

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

  const profileSetupItems = [
    {
      title: 'Create Profile',
      description: 'Complete your basic information',
      icon: User,
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Compatibility Questions',
      description: 'Answer questions to find better matches',
      icon: Brain,
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Profile Pics',
      description: 'Upload verified photos',
      icon: Camera,
      iconColor: 'text-green-500',
      borderColor: 'border-green-200',
    }
  ];

  if (showProfileSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Luvlang</h2>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setShowProfileSetup(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>

          <ProfileManager />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Luvlang</h2>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-xl text-gray-600">
            Ready to find your perfect match? Choose what you'd like to do next.
          </p>
        </div>

        {/* Profile Setup Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Profile</h2>
            <p className="text-gray-600">Complete these steps to get the best matches</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
            {profileSetupItems.map((item) => (
              <Card key={item.title} className={`hover:shadow-lg transition-shadow ${item.borderColor}`}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center`}>
                    <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => setShowProfileSetup(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              Start Profile Setup
            </Button>
          </div>
        </div>

        {/* Dashboard Grid */}
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

        {/* Additional Info */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-gray-600">
            Your journey to finding meaningful connections starts here. Each feature is designed 
            to help you build authentic relationships based on deep compatibility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
