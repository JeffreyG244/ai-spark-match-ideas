
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Shield, Users, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProfileManager from '@/components/ProfileManager';

const Dashboard = () => {
  const { user, signOut } = useAuth();

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
              <h2 className="text-2xl font-bold text-gray-900">SoulSync</h2>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.email}</p>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-200 hover:border-purple-300 transition-colors">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Messages</h3>
              <p className="text-sm text-gray-600 mb-4">Chat with your matches</p>
              <Link to="/messages">
                <Button className="w-full">Open Messages</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-pink-200 hover:border-pink-300 transition-colors">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-pink-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Matches</h3>
              <p className="text-sm text-gray-600 mb-4">View your compatibility</p>
              <Button className="w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Discover</h3>
              <p className="text-sm text-gray-600 mb-4">Find new connections</p>
              <Button className="w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:border-green-300 transition-colors">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Safety</h3>
              <p className="text-sm text-gray-600 mb-4">Security settings</p>
              <Button className="w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Management */}
        <ProfileManager />
      </div>
    </div>
  );
};

export default Dashboard;
