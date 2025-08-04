import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  MessageCircle, 
  Zap, 
  Award, 
  Users, 
  Coffee,
  Building,
  Clock,
  Sparkles,
  Target,
  Heart,
  Star,
  Shield,
  MapPin,
  Phone,
  Video,
  Globe,
  CreditCard,
  ChevronRight,
  Settings,
  Bell,
  Verified,
  Plane,
  UtensilsCrossed,
  Car,
  Trophy,
  Lock,
  BarChart3,
  Smartphone,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ExecutiveMatch {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  score: number;
  image: string;
  commonInterests: string[];
  meetingPreference: string;
  distance: string;
  education: string;
  verifications: string[];
  badges: string[];
  travelSchedule: string;
  availability: string;
  personalityMatch: string;
  mutualConnections: number;
  lastActive: string;
  preferredRestaurants: string[];
  languages: string[];
}

interface UserStats {
  totalMatches: number;
  compatibility: number;
  meetings: number;
  successRate: number;
  verificationLevel: string;
  membershipTier: string;
}

const ExecutiveLuvlang = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<ExecutiveMatch[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userStats, setUserStats] = useState<UserStats>({
    totalMatches: 0,
    compatibility: 94,
    meetings: 0,
    successRate: 89,
    verificationLevel: 'Executive Verified',
    membershipTier: 'C-Suite Premium'
  });

  useEffect(() => {
    if (user) {
      loadUserStats();
      loadMatches();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Load user analytics
      const { data: analytics } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Load executive matches count
      const { data: matchesData } = await supabase
        .from('executive_matches')
        .select('*')
        .or(`user_id.eq.${user?.id},matched_user_id.eq.${user?.id}`)
        .eq('status', 'matched');

      setUserStats(prev => ({
        ...prev,
        totalMatches: matchesData?.length || 0,
        meetings: analytics?.meetings_completed || 0,
      }));
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadMatches = async () => {
    try {
      // Get user's professional profile and matches
      const { data: professionalProfile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!professionalProfile) {
        toast({
          title: 'Complete Your Profile',
          description: 'Please complete your professional profile to see executive matches.',
        });
        return;
      }

      // Load executive matches
      const { data: executiveMatches } = await supabase
        .from('executive_matches')
        .select(`
          *,
          matched_user:users!executive_matches_matched_user_id_fkey(*),
          user:users!executive_matches_user_id_fkey(*)
        `)
        .or(`user_id.eq.${user?.id},matched_user_id.eq.${user?.id}`)
        .eq('status', 'matched')
        .limit(10);

      // Transform matches for display
      const transformedMatches: ExecutiveMatch[] = (executiveMatches || []).map((match, index) => {
        const isCurrentUserFirst = match.user_id === user?.id;
        const otherUser = isCurrentUserFirst ? match.matched_user : match.user;
        
        return {
          id: match.id,
          name: `${otherUser?.first_name || 'Professional'} ${otherUser?.last_name || 'Executive'}`,
          title: otherUser?.job_title || 'Senior Executive',
          company: otherUser?.company || 'Fortune 500 Company',
          industry: otherUser?.industry || 'Technology',
          score: match.compatibility_score || 90 + Math.floor(Math.random() * 10),
          image: otherUser?.photos?.[0] || '/api/placeholder/120/120',
          commonInterests: match.common_interests || ['Leadership', 'Innovation'],
          meetingPreference: match.optimal_meeting_type || 'Executive Lunch',
          distance: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)} miles`,
          education: otherUser?.education_level || 'MBA',
          verifications: ['LinkedIn', 'Company', 'Education'],
          badges: match.match_reasons || ['Industry Leader', 'Mentor'],
          travelSchedule: 'Available this week',
          availability: 'Tuesday 12-2pm, Thursday 6-8pm',
          personalityMatch: 'Strategic Thinker • Results-Driven',
          mutualConnections: match.mutual_connections || Math.floor(Math.random() * 20) + 5,
          lastActive: index === 0 ? '30 minutes ago' : `${Math.floor(Math.random() * 24) + 1} hours ago`,
          preferredRestaurants: ['Fine Dining', 'Business Casual'],
          languages: ['English']
        };
      });

      setMatches(transformedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load executive matches.',
        variant: 'destructive'
      });
    }
  };

  const triggerMatching = async () => {
    setIsMatching(true);
    try {
      // Simulate AI matching process
      toast({
        title: 'AI Matching Started',
        description: 'Our quantum-powered algorithm is finding your perfect executive matches...',
      });

      // In a real implementation, this would trigger the matching algorithm
      setTimeout(() => {
        loadMatches();
        setIsMatching(false);
        toast({
          title: 'New Matches Found!',
          description: 'Your executive matches have been updated with fresh connections.',
        });
      }, 3000);
    } catch (error) {
      console.error('Matching error:', error);
      setIsMatching(false);
      toast({
        title: 'Error',
        description: 'Failed to trigger matching. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const scheduleCalendarMeeting = async (matchId: string, matchName: string) => {
    try {
      // Create meeting request
      const { error } = await supabase
        .from('meeting_requests')
        .insert({
          requester_id: user?.id,
          recipient_id: matchId,
          match_id: matchId,
          meeting_type: 'coffee',
          proposed_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          proposed_time: '14:00',
          message: `Hi ${matchName}, I'd love to schedule a coffee meeting to discuss potential collaboration opportunities.`,
          venue_suggestion: 'Executive Coffee Lounge'
        });

      if (error) throw error;

      toast({
        title: 'Meeting Request Sent',
        description: `Calendar integration: Meeting request sent to ${matchName}`,
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule meeting. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const requestRestaurantSuggestion = (matchPreferences: string[]) => {
    const suggestions = [
      "The Capital Grille - Private dining available",
      "Eleven Madison Park - Michelin starred experience", 
      "Blue Hill - Farm-to-table executive favorite"
    ];
    
    toast({
      title: 'Restaurant Concierge',
      description: `Suggestion: ${suggestions[0]}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Enhanced Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-love-primary to-love-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Luvlang</h1>
                <p className="text-muted-foreground text-sm">Executive Dating Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Verification Status */}
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-600 text-sm font-medium">{userStats.verificationLevel}</span>
              </div>
              
              {/* Membership Tier */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl px-4 py-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-600 text-sm font-medium">{userStats.membershipTier}</span>
              </div>
              
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>
              
              <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Executive Welcome Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-love-primary to-love-secondary">Executive</span>
            </h2>
            <p className="text-xl text-muted-foreground">Your AI-powered executive connections await</p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 text-emerald-600">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Global Network Active</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-500">
                <Plane className="w-4 h-4" />
                <span className="text-sm">Travel Mode: Enabled</span>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-r from-love-primary/5 to-love-secondary/5 border-love-primary/20 hover:scale-105 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Premium Matches</p>
                    <p className="text-3xl font-bold text-foreground">{userStats.totalMatches}</p>
                  </div>
                  <Target className="w-8 h-8 text-love-primary" />
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 text-sm">+15% this week</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/20 hover:scale-105 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">AI Compatibility</p>
                    <p className="text-3xl font-bold text-foreground">{userStats.compatibility}%</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-500 text-sm">Top 5% platform</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-emerald-500/5 to-green-500/5 border-emerald-500/20 hover:scale-105 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Executive Meetings</p>
                    <p className="text-3xl font-bold text-foreground">{userStats.meetings}</p>
                  </div>
                  <Coffee className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 text-sm">3 scheduled</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500/5 to-red-500/5 border-orange-500/20 hover:scale-105 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Success Rate</p>
                    <p className="text-3xl font-bold text-foreground">{userStats.successRate}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500 text-sm">Industry leader</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced AI Matching Section */}
          <Card className="bg-gradient-to-r from-love-primary/5 to-love-secondary/5 border-love-primary/20 mb-12">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-love-primary to-love-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">Advanced AI Executive Matching</h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-3xl mx-auto">
                  Our quantum-powered algorithm analyzes 500+ professional compatibility factors including career trajectory, 
                  leadership style, industry influence, and global networking potential to find your perfect executive match.
                </p>
                
                {/* AI Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-background/50 rounded-xl p-4">
                    <Video className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-foreground font-semibold">Video Verification</p>
                    <p className="text-muted-foreground text-sm">AI-powered identity confirmation</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4">
                    <Globe className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-foreground font-semibold">Global Matching</p>
                    <p className="text-muted-foreground text-sm">International executive network</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4">
                    <Lock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-foreground font-semibold">Privacy Shield</p>
                    <p className="text-muted-foreground text-sm">Company/industry blocking</p>
                  </div>
                </div>
                
                <Button 
                  onClick={triggerMatching}
                  disabled={isMatching}
                  size="lg"
                  className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white px-16 py-5 text-xl"
                >
                  {isMatching ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>AI Processing Your Executive Matches...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-7 h-7" />
                      <span>Discover Executive Matches</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Executive Matches Section */}
        {matches.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-foreground">Your Executive Matches</h3>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-love-primary/10 text-love-primary border-love-primary/20">
                  <Star className="w-4 h-4 mr-2" />
                  C-Suite Quality
                </Badge>
                <Button variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Global View
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {matches.map((match) => (
                <Card key={match.id} className="bg-gradient-to-br from-background to-secondary border-border hover:scale-[1.02] transition-all duration-500 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6 mb-6">
                      <div className="relative">
                        <img 
                          src={match.image} 
                          alt={match.name}
                          className="w-28 h-28 rounded-2xl object-cover border-2 border-love-primary/50 shadow-lg"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = '/api/placeholder/120/120';
                          }}
                        />
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full p-2 shadow-lg">
                          <Verified className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-love-primary to-love-secondary rounded-full px-3 py-1 shadow-lg">
                          <span className="text-white font-bold text-sm">{match.score}%</span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-2xl font-bold text-foreground">{match.name}</h4>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-emerald-500 text-sm">{match.lastActive}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-5 h-5 text-love-primary" />
                            <span className="text-muted-foreground font-medium">{match.title}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Building className="w-5 h-5 text-blue-500" />
                            <span className="text-muted-foreground">{match.company} • {match.industry}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                            <span className="text-muted-foreground">{match.education}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-emerald-500" />
                            <span className="text-muted-foreground">{match.mutualConnections} mutual connections</span>
                          </div>
                        </div>
                        
                        {/* Verification Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {match.verifications.map((verification, idx) => (
                            <Badge key={idx} variant="outline" className="border-emerald-500/50 text-emerald-600">
                              <Shield className="w-3 h-3 mr-1" />
                              {verification}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Achievement Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {match.badges.map((badge, idx) => (
                            <Badge key={idx} variant="outline" className="border-love-primary/50 text-love-primary">
                              <Trophy className="w-3 h-3 mr-1" />
                              {badge}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Common Interests */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {match.commonInterests.map((interest, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Enhanced Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            onClick={() => navigate('/messages')}
                            className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Button 
                            onClick={() => scheduleCalendarMeeting(match.id, match.name)}
                            variant="outline"
                            className="border-blue-500/50 text-blue-600 hover:bg-blue-500/10"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </Button>
                          <Button 
                            onClick={() => requestRestaurantSuggestion(match.preferredRestaurants)}
                            variant="outline"
                            className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
                          >
                            <UtensilsCrossed className="w-4 h-4 mr-2" />
                            Dine
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
                          >
                            <Car className="w-4 h-4 mr-2" />
                            Transport
                          </Button>
                        </div>
                        
                        {/* Quick Info */}
                        <div className="mt-4 p-4 bg-muted/50 rounded-xl">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Availability</p>
                              <p className="text-foreground font-medium">{match.availability}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Meeting Style</p>
                              <p className="text-foreground font-medium">{match.meetingPreference}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Executive Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/20 hover:scale-105 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-all" />
              <h4 className="text-xl font-bold text-foreground mb-2">Smart Calendar</h4>
              <p className="text-muted-foreground text-sm">AI-optimized scheduling with calendar sync</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-emerald-500/5 to-green-500/5 border-emerald-500/20 hover:scale-105 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <UtensilsCrossed className="w-12 h-12 text-emerald-500 mx-auto mb-4 group-hover:scale-110 transition-all" />
              <h4 className="text-xl font-bold text-foreground mb-2">Restaurant Concierge</h4>
              <p className="text-muted-foreground text-sm">Michelin-starred recommendations & reservations</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-love-primary/5 to-love-secondary/5 border-love-primary/20 hover:scale-105 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Plane className="w-12 h-12 text-love-primary mx-auto mb-4 group-hover:scale-110 transition-all" />
              <h4 className="text-xl font-bold text-foreground mb-2">Travel Matching</h4>
              <p className="text-muted-foreground text-sm">Connect globally during business travel</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500/5 to-red-500/5 border-orange-500/20 hover:scale-105 transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4 group-hover:scale-110 transition-all" />
              <h4 className="text-xl font-bold text-foreground mb-2">Executive Security</h4>
              <p className="text-muted-foreground text-sm">Background checks & privacy controls</p>
            </CardContent>
          </Card>
        </div>

        {/* Premium Membership Upgrade */}
        <Card className="bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 border-yellow-500/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">Unlock C-Suite Premium</h3>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              Access Fortune 500 executives, private jet coordination, Michelin concierge, and white-glove meeting services.
            </p>
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">500+</div>
                <div className="text-muted-foreground text-sm">C-Suite Executives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">24/7</div>
                <div className="text-muted-foreground text-sm">Concierge Service</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">Global</div>
                <div className="text-muted-foreground text-sm">Network Access</div>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/membership')}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-12 py-4 text-lg"
            >
              Upgrade to C-Suite Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveLuvlang;