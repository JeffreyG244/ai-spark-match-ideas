import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, Eye, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ModerationItem {
  id: string;
  content_type: string;
  content_id: string;
  user_id: string;
  content_text?: string;
  content_url?: string;
  ai_score: number;
  ai_flags: any;
  status: string;
  created_at: string;
}

const Moderation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchModerationQueue();
  }, [filter]);

  const fetchModerationQueue = async () => {
    try {
      let query = supabase
        .from('content_moderation_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setModerationQueue(data || []);
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (itemId: string, action: 'approved' | 'rejected' | 'flagged', notes?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('content_moderation_queue')
        .update({
          status: action,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Action completed",
        description: `Content has been ${action}`
      });

      fetchModerationQueue();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update moderation status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'flagged': return <AlertTriangle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return { level: 'High', color: 'text-red-600' };
    if (score >= 0.5) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Content Moderation</h1>
          <p className="text-lg text-gray-600">Review and moderate user-generated content</p>
        </div>

        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  {moderationQueue.length} items
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading moderation queue...</div>
              ) : moderationQueue.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No items in the moderation queue</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {moderationQueue.map((item) => {
                    const risk = getRiskLevel(item.ai_score || 0);
                    return (
                      <Card key={item.id} className="border-l-4 border-l-orange-400">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="capitalize">
                                {item.content_type}
                              </Badge>
                              <Badge className={getStatusColor(item.status)}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1 capitalize">{item.status}</span>
                              </Badge>
                              <Badge variant="outline" className={risk.color}>
                                AI Risk: {risk.level}
                              </Badge>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Content:</h4>
                            {item.content_text && (
                              <p className="text-gray-700 bg-gray-50 p-3 rounded border">
                                {item.content_text}
                              </p>
                            )}
                            {item.content_url && (
                              <div className="bg-gray-50 p-3 rounded border">
                                <p className="text-sm text-gray-600 mb-2">Media URL:</p>
                                <a 
                                  href={item.content_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-all"
                                >
                                  {item.content_url}
                                </a>
                              </div>
                            )}
                          </div>

                          {item.ai_flags && item.ai_flags.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">AI Flags:</h4>
                              <div className="flex flex-wrap gap-2">
                                {item.ai_flags.map((flag, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {flag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">AI Confidence Score:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ width: `${(item.ai_score || 0) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round((item.ai_score || 0) * 100)}%
                            </span>
                          </div>

                          {item.status === 'pending' && (
                            <div className="flex gap-2 pt-4 border-t">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleModerationAction(item.id, 'approved')}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleModerationAction(item.id, 'rejected')}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleModerationAction(item.id, 'flagged')}
                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Flag for Review
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Eye className="h-5 w-5" />
                    Total Reviewed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">1,247</div>
                  <p className="text-sm text-blue-600">This month</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">1,156</div>
                  <p className="text-sm text-green-600">92.7% approval rate</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <XCircle className="h-5 w-5" />
                    Rejected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-900">67</div>
                  <p className="text-sm text-red-600">5.4% rejection rate</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="h-5 w-5" />
                    Flagged
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">24</div>
                  <p className="text-sm text-orange-600">1.9% flagged rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Settings</CardTitle>
                <CardDescription>
                  Configure AI moderation thresholds and rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">AI Thresholds</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Auto-reject threshold</label>
                        <div className="text-sm text-gray-600 mb-2">Content above this score is automatically rejected</div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1" 
                          defaultValue="0.9"
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500">90%</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Manual review threshold</label>
                        <div className="text-sm text-gray-600 mb-2">Content above this score requires manual review</div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1" 
                          defaultValue="0.5"
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500">50%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Content Types</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Profile photos</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Bio text</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Messages</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Media uploads</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Moderation;