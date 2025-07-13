import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Heart, 
  Eye, 
  Star, 
  Calendar,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserAnalytics {
  total_matches: number;
  total_conversations: number;
  profile_views: number;
  photos_liked: number;
  messages_sent: number;
  messages_received: number;
  success_rate: number;
}

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAnalytics(data);
      } else {
        // Create initial analytics record
        const { data: newAnalytics, error: insertError } = await supabase
          .from('user_analytics')
          .insert({
            user_id: user.id,
            total_matches: 0,
            total_conversations: 0,
            profile_views: 0,
            photos_liked: 0,
            messages_sent: 0,
            messages_received: 0,
            success_rate: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setAnalytics(newAnalytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletionScore = () => {
    // This would calculate based on profile fields filled
    return 85; // Mock score
  };

  const getPopularityScore = () => {
    if (!analytics) return 0;
    const base = Math.min(analytics.profile_views / 10, 100);
    return Math.round(base);
  };

  const getEngagementScore = () => {
    if (!analytics) return 0;
    const sent = analytics.messages_sent;
    const received = analytics.messages_received;
    const total = sent + received;
    return Math.min(Math.round(total / 5), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">Loading your analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Dating Analytics</h1>
          <p className="text-lg text-gray-600">Track your progress and optimize your dating success</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Heart className="h-5 w-5" />
                    Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{analytics?.total_matches || 0}</div>
                  <p className="text-sm text-blue-600">Total matches</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <MessageCircle className="h-5 w-5" />
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{analytics?.total_conversations || 0}</div>
                  <p className="text-sm text-green-600">Active chats</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Eye className="h-5 w-5" />
                    Profile Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">{analytics?.profile_views || 0}</div>
                  <p className="text-sm text-purple-600">This month</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Star className="h-5 w-5" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{analytics?.success_rate || 0}%</div>
                  <p className="text-sm text-orange-600">Match to chat</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Profile Scores
                  </CardTitle>
                  <CardDescription>How well your profile is performing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Profile Completion</span>
                      <Badge variant="secondary">{getProfileCompletionScore()}%</Badge>
                    </div>
                    <Progress value={getProfileCompletionScore()} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Popularity Score</span>
                      <Badge variant="secondary">{getPopularityScore()}%</Badge>
                    </div>
                    <Progress value={getPopularityScore()} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <Badge variant="secondary">{getEngagementScore()}%</Badge>
                    </div>
                    <Progress value={getEngagementScore()} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your activity over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Messages Sent</span>
                      </div>
                      <Badge variant="outline">{analytics?.messages_sent || 0}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Photos Liked</span>
                      </div>
                      <Badge variant="outline">{analytics?.photos_liked || 0}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm">New Matches</span>
                      </div>
                      <Badge variant="outline">{analytics?.total_matches || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of your dating app performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Messaging Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Messages Sent:</span>
                        <span className="font-semibold">{analytics?.messages_sent || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Messages Received:</span>
                        <span className="font-semibold">{analytics?.messages_received || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Rate:</span>
                        <span className="font-semibold">
                          {analytics?.messages_sent ? 
                            Math.round((analytics.messages_received / analytics.messages_sent) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Match Quality</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Matches:</span>
                        <span className="font-semibold">{analytics?.total_matches || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversations Started:</span>
                        <span className="font-semibold">{analytics?.total_conversations || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversion Rate:</span>
                        <span className="font-semibold">
                          {analytics?.total_matches ? 
                            Math.round((analytics.total_conversations / analytics.total_matches) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">💡 Profile Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Add more photos to increase profile views by 30%</li>
                    <li>• Complete your bio to improve match quality</li>
                    <li>• Answer compatibility questions for better matches</li>
                    <li>• Update your photos regularly for more engagement</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">📈 Growth Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Your response rate is above average! Keep it up</li>
                    <li>• Try logging in during peak hours (7-9 PM)</li>
                    <li>• Consider upgrading for more visibility</li>
                    <li>• Engage with daily matches for better results</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Dating Goals
                </CardTitle>
                <CardDescription>
                  Set and track your dating objectives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Weekly Goals</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Send 10 messages</span>
                          <span className="text-sm font-medium">7/10</span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Get 5 new matches</span>
                          <span className="text-sm font-medium">3/5</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Start 2 conversations</span>
                          <span className="text-sm font-medium">2/2</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Monthly Goals</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Go on 2 dates</span>
                          <span className="text-sm font-medium">0/2</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Get 20 profile views</span>
                          <span className="text-sm font-medium">15/20</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Improve success rate to 25%</span>
                          <span className="text-sm font-medium">20%/25%</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;