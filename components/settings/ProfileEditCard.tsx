import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import { useToast } from '@/hooks/use-toast';
import { User, Save, ExternalLink } from 'lucide-react';
import { validateAndSanitize } from '@/utils/inputSanitizer';

const ProfileEditCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileData, isLoading, saveProfile, updateProfileField } = useEnhancedProfileData();
  const [isSaving, setIsSaving] = useState(false);

  const handleQuickSave = async () => {
    if (!profileData.first_name?.trim() || !profileData.bio?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and bio before saving.",
        variant: "destructive"
      });
      return;
    }

    // Validate bio
    const bioValidation = validateAndSanitize(profileData.bio, 500);
    if (!bioValidation.isValid) {
      toast({
        title: "Invalid Bio",
        description: bioValidation.error,
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveProfile(true);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    updateProfileField(field as any, value);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-4"></div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50 hover:border-pink-300/70 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-400/30 hover:scale-[1.02] hover:-translate-y-1 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Edit Profile Details</CardTitle>
              <p className="text-white/80 text-sm">Update your basic information and bio</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/executive-profile')}
            className="text-white hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-white font-medium">First Name</Label>
            <Input
              id="firstName"
              value={profileData.first_name || ''}
              onChange={(e) => handleFieldChange('first_name', e.target.value)}
              placeholder="Enter your first name"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
              maxLength={50}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-white font-medium">Last Name</Label>
            <Input
              id="lastName"
              value={profileData.last_name || ''}
              onChange={(e) => handleFieldChange('last_name', e.target.value)}
              placeholder="Enter your last name"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
              maxLength={50}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-white font-medium">Bio</Label>
          <Textarea
            id="bio"
            value={profileData.bio || ''}
            onChange={(e) => handleFieldChange('bio', e.target.value)}
            placeholder="Tell others about yourself..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 min-h-[100px]"
            maxLength={500}
          />
          <p className="text-white/60 text-xs">
            {profileData.bio?.length || 0}/500 characters
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleQuickSave}
            disabled={isSaving}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Quick Save'}
          </Button>
          
          <Button
            onClick={() => navigate('/executive-profile')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Full Editor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditCard;