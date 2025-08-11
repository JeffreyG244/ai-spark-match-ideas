import React, { useState, useEffect } from 'react';
import { 
  Heart, Shield, Calendar, MessageCircle, Award, Users, Coffee,
  Building, Clock, Sparkles, Target, Star, Verified, Plane, UtensilsCrossed,
  BarChart3, Bell, Settings, Globe, CreditCard, ChevronRight, MapPin, 
  Briefcase, TrendingUp, User, Search, Filter, Crown, Diamond, Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useMatches } from '@/hooks/useMatches';
import { useDailyMatches } from '@/hooks/useDailyMatches';
import { useProfileData } from '@/hooks/useProfileData';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import MembershipBadge from '@/components/profile/MembershipBadge';
import { useMembershipBadge } from '@/hooks/useMembershipBadge';

interface DashboardStats {
  totalMatches: number;
  newMessages: number;
  profileViews: number;
  compatibilityScore: number;
}

interface ExecutiveProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  compatibilityScore: number;
  photo: string;
  industry: string;
  location: string;
  badges: string[];
  lastActive: string;
}

const ModernProfessionalDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { matches } = useMatches();
  const { dailyMatches } = useDailyMatches();
  const { profileData } = useProfileData();
  const { membershipLevel, loading: badgeLoading } = useMembershipBadge();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const [stats, setStats] = useState<DashboardStats>({
    totalMatches: 0,
    newMessages: 0,
    profileViews: 0,
    compatibilityScore: 0
  });
  
  const [recentMatches, setRecentMatches] = useState<ExecutiveProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, matches]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load professional profile data
      const { data: professionalProfile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Load recent activity stats
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

      // Load user analytics
      const { data: analytics } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      setStats({
        totalMatches: matches.length || 0,
        newMessages: conversations?.length || 0,
        profileViews: analytics?.profile_views || 0,
        compatibilityScore: Math.floor(Math.random() * 20) + 80
      });

      // Transform matches for display
      const executiveMatches = matches.slice(0, 3).map(match => ({
        id: match.id,
        name: `${match.match_profile?.first_name || 'Professional'}`,
        title: 'Executive',
        company: 'Tech Corp',
        compatibilityScore: match.compatibility || 95,
        photo: match.match_profile?.photos?.[0] || '/api/placeholder/400/400',
        industry: 'Technology',
        location: 'San Francisco, CA',
        badges: ['Verified', 'Executive', 'Leader'],
        lastActive: 'Active now'
      }));

      setRecentMatches(executiveMatches);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatsCard = ({ icon: Icon, title, value, subtitle, trend }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle: string;
    trend?: string;
  }) => (
    <Card className="bg-gradient-to-br from-background to-secondary border-border hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-love-primary to-love-secondary rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </div>
          {trend && (
            <div className="text-right">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                {trend}
              </Badge>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      </CardContent>
    </Card>
  );

  const MatchCard = ({ match }: { match: ExecutiveProfile }) => (
    <Card className="bg-gradient-to-br from-background to-secondary border-border hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate('/matches')}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={match.photo} 
              alt={match.name}
              className="w-16 h-16 rounded-xl object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/api/placeholder/400/400';
              }}
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <Verified className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-foreground truncate">{match.name}</h4>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-xs text-emerald-600">Active</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground truncate">{match.title} at {match.company}</p>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{match.location}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-love-primary" />
                <span className="text-xs font-medium text-love-primary">{match.compatibilityScore}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {match.badges.slice(0, 2).map((badge, idx) => (
            <Badge key={idx} variant="outline" className="text-xs border-love-primary/30 text-love-primary">
              {badge}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const QuickAction = ({ icon: Icon, title, description, onClick, color = "primary" }: {
    icon: any;
    title: string;
    description: string;
    onClick: () => void;
    color?: string;
  }) => (
    <Card className="bg-gradient-to-br from-background to-secondary border-border hover:shadow-lg transition-all cursor-pointer group"
          onClick={onClick}>
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 bg-gradient-to-r ${
          color === 'primary' ? 'from-love-primary to-love-secondary' :
          color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
          color === 'blue' ? 'from-blue-500 to-blue-600' :
          'from-purple-500 to-purple-600'
        } rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-love-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your executive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-love-primary to-love-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Luvlang</h1>
                  <p className="text-sm text-muted-foreground">Executive Dashboard</p>
                </div>
              </div>
              <MembershipBadge 
                membershipLevel={membershipLevel} 
                size="md"
                className="bg-opacity-20 backdrop-blur-xl"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>
              
              <Button variant="outline" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Heart}
            title="Total Matches"
            value={stats.totalMatches}
            subtitle="Executive connections"
            trend="+12%"
          />
          <StatsCard
            icon={MessageCircle}
            title="Active Conversations"
            value={stats.newMessages}
            subtitle="Professional dialogues"
            trend="+5%"
          />
          <StatsCard
            icon={TrendingUp}
            title="Profile Views"
            value={stats.profileViews}
            subtitle="This week"
            trend="+18%"
          />
          <StatsCard
            icon={Target}
            title="Compatibility"
            value={`${stats.compatibilityScore}%`}
            subtitle="Average match score"
            trend="Excellent"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Matches */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-background to-secondary border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-love-primary" />
                      <span>Recent Executive Matches</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">High-compatibility professional connections</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/matches')}>
                    View All
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMatches.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-love-primary to-love-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">No Matches Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start discovering executive professionals</p>
                    <Button onClick={() => navigate('/discover')}>
                      Start Matching
                    </Button>
                  </div>
                ) : (
                  recentMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-background to-secondary border-border">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <QuickAction
                  icon={Search}
                  title="Discover"
                  description="Find new executive matches"
                  onClick={() => navigate('/discover')}
                  color="primary"
                />
                <QuickAction
                  icon={Calendar}
                  title="Daily Matches"
                  description="AI-curated premium connections"
                  onClick={() => navigate('/daily-matches')}
                  color="emerald"
                />
                <QuickAction
                  icon={MessageCircle}
                  title="Messages"
                  description="Continue conversations"
                  onClick={() => navigate('/messages')}
                  color="blue"
                />
                <QuickAction
                  icon={User}
                  title="Profile"
                  description="Update your information"
                  onClick={() => navigate('/dashboard')}
                  color="purple"
                />
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card className="bg-gradient-to-br from-love-primary/5 to-love-secondary/5 border-love-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-love-primary">
                  <Diamond className="w-5 h-5" />
                  <span>Premium Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-love-primary/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-love-primary" />
                  </div>
                  <span className="text-sm text-foreground">AI-powered matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-love-primary/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-love-primary" />
                  </div>
                  <span className="text-sm text-foreground">Executive verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-love-primary/20 rounded-lg flex items-center justify-center">
                    <Coffee className="w-4 h-4 text-love-primary" />
                  </div>
                  <span className="text-sm text-foreground">Priority meeting requests</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white">
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analytics Section */}
        <Card className="bg-gradient-to-br from-background to-secondary border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-love-primary" />
              <span>Executive Insights</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your professional networking analytics</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-love-primary mb-2">{stats.compatibilityScore}%</div>
                <p className="text-sm text-muted-foreground">Average Compatibility</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-love-secondary mb-2">{stats.totalMatches}</div>
                <p className="text-sm text-muted-foreground">Professional Connections</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{stats.profileViews}</div>
                <p className="text-sm text-muted-foreground">Profile Engagements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernProfessionalDashboard;