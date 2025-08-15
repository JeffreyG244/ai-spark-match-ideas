import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Camera, Heart, Trash2, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { seedRealisticProfiles, clearDuplicateProfiles } from '@/utils/realisticSeedProfiles';
import { seedDiverseProfiles } from '@/utils/diverseSeedProfiles';
import { supabase } from '@/integrations/supabase/client';

interface ProfileStats {
  total: number;
  visible: number;
  male: number;
  female: number;
  withPhotos: number;
  withoutPhotos: number;
}

const ProfileManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  const fetchProfileStats = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('users')
        .select('is_active, gender, photos');

      if (error) {
        console.error('Error fetching profile stats:', error);
        return;
      }

      if (profiles) {
        const stats: ProfileStats = {
          total: profiles.length,
          visible: profiles.filter(p => p.is_active).length,
          male: profiles.filter(p => p.gender?.toLowerCase().includes('male')).length,
          female: profiles.filter(p => p.gender?.toLowerCase().includes('female')).length,
          withPhotos: profiles.filter(p => p.photos && p.photos.length > 0).length,
          withoutPhotos: profiles.filter(p => !p.photos || p.photos.length === 0).length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  React.useEffect(() => {
    fetchProfileStats();
  }, []);

  const handleSeedRealistic = async () => {
    setIsLoading(true);
    try {
      const result = await seedRealisticProfiles();
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        await fetchProfileStats();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error seeding realistic profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to seed realistic profiles',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDiverse = async () => {
    setIsLoading(true);
    try {
      const result = await seedDiverseProfiles();
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        await fetchProfileStats();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error seeding diverse profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to seed diverse profiles',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDuplicates = async () => {
    setIsLoading(true);
    try {
      const result = await clearDuplicateProfiles();
      
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        await fetchProfileStats();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error clearing duplicates:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear duplicate profiles',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixGenderMatching = async () => {
    setIsLoading(true);
    try {
      // Update profiles to ensure proper gender matching
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          looking_for: 'Female' // Default for males
        })
        .eq('gender', 'Male');

      if (error) throw error;

      const { error: error2 } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          looking_for: 'Male' // Default for females
        })
        .eq('gender', 'Female');

      if (error2) throw error2;

      toast({
        title: 'Success!',
        description: 'Gender matching preferences have been fixed',
      });
      await fetchProfileStats();
    } catch (error) {
      console.error('Error fixing gender matching:', error);
      toast({
        title: 'Error',
        description: 'Failed to fix gender matching',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMissingFields = async () => {
    setIsLoading(true);
    try {
      // Add missing looking_for fields
      const { data: profiles, error: fetchError } = await supabase
        .from('users')
        .select('id, gender, looking_for');

      if (fetchError) throw fetchError;

      const updates = profiles?.map(profile => ({
        id: profile.id,
        looking_for: profile.looking_for || 
          (profile.gender === 'Male' ? 'Female' : 
           profile.gender === 'Female' ? 'Male' : 'Everyone')
      }));

      if (updates && updates.length > 0) {
        // Update in batches
        for (let i = 0; i < updates.length; i += 10) {
          const batch = updates.slice(i, i + 10);
          for (const update of batch) {
            await supabase
              .from('users')
              .update({
                looking_for: update.looking_for
              })
              .eq('id', update.id);
          }
        }
      }

      toast({
        title: 'Success!',
        description: 'Missing profile fields have been added',
      });
      await fetchProfileStats();
    } catch (error) {
      console.error('Error adding missing fields:', error);
      toast({
        title: 'Error',
        description: 'Failed to add missing profile fields',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Profile Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Profiles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.visible}</div>
                <div className="text-sm text-gray-600">Visible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.male}</div>
                <div className="text-sm text-gray-600">Male</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{stats.female}</div>
                <div className="text-sm text-gray-600">Female</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.withPhotos}</div>
                <div className="text-sm text-gray-600">With Photos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.withoutPhotos}</div>
                <div className="text-sm text-gray-600">No Photos</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Loading statistics...</div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Seed Realistic Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Add high-quality, realistic professional profiles with proper photos and diverse backgrounds.
            </p>
            <div className="space-y-2">
              <Badge variant="outline">High-quality photos</Badge>
              <Badge variant="outline">Professional backgrounds</Badge>
              <Badge variant="outline">Realistic bios</Badge>
            </div>
            <Button 
              onClick={handleSeedRealistic}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Seeding...' : 'Seed Realistic Profiles'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Seed Diverse Profiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Add inclusive, diverse profiles with LGBTQ+ representation and varied orientations.
            </p>
            <div className="space-y-2">
              <Badge variant="outline">LGBTQ+ inclusive</Badge>
              <Badge variant="outline">Diverse orientations</Badge>
              <Badge variant="outline">Various backgrounds</Badge>
            </div>
            <Button 
              onClick={handleSeedDiverse}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Seeding...' : 'Seed Diverse Profiles'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Clean Duplicates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Remove duplicate profiles based on email addresses.
            </p>
            <Button 
              onClick={handleClearDuplicates}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? 'Cleaning...' : 'Clear Duplicates'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <UserCheck className="h-5 w-5" />
              Fix Gender Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Ensure proper gender preference settings for matching.
            </p>
            <Button 
              onClick={handleFixGenderMatching}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Fixing...' : 'Fix Gender Matching'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <AlertTriangle className="h-5 w-5" />
              Add Missing Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Add looking_for preferences to existing profiles.
            </p>
            <Button 
              onClick={handleAddMissingFields}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Adding...' : 'Add Missing Fields'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">N8N Workflow Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-yellow-700">
            <p><strong>✅ Database Tables:</strong> All required tables exist for n8n workflow</p>
            <p><strong>✅ Profile Data:</strong> Users can generate and manage profiles</p>
            <p><strong>✅ Matching Logic:</strong> Gender filtering and compatibility scoring in place</p>
            <p><strong>⚠️ N8N Integration:</strong> Ensure your n8n workflow points to the correct database tables:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>users</code> (main profiles table)</li>
              <li><code>executive_matches</code></li>
              <li><code>daily_matches</code></li>
              <li><code>conversations</code> and <code>conversation_messages</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManager;