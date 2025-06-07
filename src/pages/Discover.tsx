
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { diverseUsersData } from '@/data/diverseUsersData';

const Discover = () => {
  const { signOut } = useAuth();

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
              <Link to="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover New Connections</h1>
          <p className="text-gray-600">Find people who share your values and life goals</p>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diverseUsersData.map((user, index) => (
            <Card key={index} className="border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={user.photos[0]} 
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">{user.firstName} {user.lastName}</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {Math.floor(Math.random() * 20) + 20} years
                  </Badge>
                </CardTitle>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{Math.floor(Math.random() * 10) + 1} miles away</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                  {user.bio}
                </p>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Core Values</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.values.split(', ').map((value, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-purple-300 text-purple-700">
                        {value.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Green Flags</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{user.greenFlags}</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discover;
