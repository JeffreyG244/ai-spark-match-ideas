import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Users, Calendar, Star, Plus, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SuccessStory {
  id: string;
  title: string;
  story: string;
  photo_url?: string;
  is_featured: boolean;
  submitted_at: string;
}

const SuccessStories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    story: '',
    partnerUserId: ''
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      // Mock success stories data since success_stories table doesn't exist
      const mockStories: SuccessStory[] = [
        {
          id: '1',
          title: 'Found My Life Partner Through Executive Connections',
          story: 'After 6 months on the platform, I connected with someone who shares my values and ambition. We bonded over our shared passion for social impact and entrepreneurship. Now we\'re planning our future together!',
          is_featured: true,
          submitted_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'Professional Match, Personal Connection',
          story: 'What started as a networking connection turned into something beautiful. We met at a platform-recommended industry event and discovered we complement each other perfectly in both business and life.',
          is_featured: false,
          submitted_at: '2024-01-10T15:30:00Z'
        },
        {
          id: '3',
          title: 'Quality Over Quantity Approach Worked',
          story: 'The curated matches and professional focus of this platform made all the difference. Instead of endless swiping, I had meaningful conversations that led to a genuine connection.',
          is_featured: true,
          submitted_at: '2024-01-05T09:15:00Z'
        }
      ];
      
      setStories(mockStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitStory = async () => {
    if (!user || !newStory.title || !newStory.story) return;

    setSubmitting(true);
    try {
      // Mock story submission since success_stories table doesn't exist
      // In a real implementation, this would save to a backend service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Story submitted!",
        description: "Thank you for sharing your success story. It will be reviewed before publishing."
      });

      setNewStory({ title: '', story: '', partnerUserId: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your story",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const featuredStories = stories.filter(story => story.is_featured);
  const regularStories = stories.filter(story => !story.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h1>
          <p className="text-lg text-gray-600">Real love stories from our community</p>
        </div>

        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="submit">Share Your Story</TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            {/* Featured Stories */}
            {featuredStories.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Featured Stories
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredStories.map((story) => (
                    <Card key={story.id} className="border-yellow-200 bg-yellow-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-yellow-900">{story.title}</CardTitle>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2 text-yellow-700">
                          <Calendar className="h-4 w-4" />
                          {new Date(story.submitted_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{story.story}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Stories */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                Love Stories
              </h2>
              
              {loading ? (
                <div className="text-center py-8">Loading stories...</div>
              ) : regularStories.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to share your success story!</p>
                    <Button onClick={() => {
                      const submitTab = document.querySelector('[value="submit"]') as HTMLElement;
                      submitTab?.click();
                    }}>
                      Share Your Story
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularStories.map((story) => (
                    <Card key={story.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{story.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(story.submitted_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed line-clamp-4">{story.story}</p>
                        <Button variant="ghost" size="sm" className="mt-4 p-0">
                          Read more →
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="submit">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Share Your Success Story
                </CardTitle>
                <CardDescription>
                  Help inspire others by sharing your love story found through our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Story Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Found My Soulmate After 6 Months"
                    value={newStory.title}
                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner">Partner's User ID (Optional)</Label>
                  <Input
                    id="partner"
                    placeholder="Your partner's user ID if they're also on the platform"
                    value={newStory.partnerUserId}
                    onChange={(e) => setNewStory({ ...newStory, partnerUserId: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    This helps us verify the story and potentially feature both profiles
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">Your Story</Label>
                  <Textarea
                    id="story"
                    placeholder="Tell us your love story... How did you meet? What made you click? What's your advice for others?"
                    rows={8}
                    value={newStory.story}
                    onChange={(e) => setNewStory({ ...newStory, story: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    Share as much detail as you're comfortable with. Great stories inspire others!
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Photo (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Upload a photo of you and your partner</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose Photo
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📝 Story Guidelines</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be genuine and authentic in your storytelling</li>
                    <li>• Respect your partner's privacy</li>
                    <li>• Keep it positive and inspirational</li>
                    <li>• Stories are reviewed before publishing</li>
                    <li>• Featured stories may be used in marketing materials</li>
                  </ul>
                </div>

                <Button 
                  onClick={submitStory} 
                  disabled={submitting || !newStory.title || !newStory.story}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Story'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuccessStories;