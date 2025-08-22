import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Camera, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import VoiceIntroductionCapture from './VoiceIntroductionCapture';
import SimpleWorkingUpload from '@/components/settings/SimpleWorkingUpload';

const logoImage = '/lovable-uploads/5c07b7a7-1ceb-456a-a4b3-381d70437f98.png';

interface FormData {
  // Section 1: Executive Profile
  firstName: string;
  lastName: string;
  age: string;
  pronouns: string;
  executiveTitle: string;
  industry: string;
  successLevel: string;
  primaryLocation: string;
  lifestyleLevel: string;

  // Section 2: Identity & Preferences
  sexualOrientation: string[];
  relationshipStyle: string;
  interestedInMeeting: string[];
  dealBreakers: string[];
  ageRangeMin: string;
  ageRangeMax: string;
  distancePreference: string;

  // Section 3: Lifestyle & Values
  politicalViews: string;
  religiousViews: string;
  familyPlans: string;
  livingArrangement: string;
  coreValues: string[];
  languagesSpoken: string[];

  // Section 4: Psychology & Compatibility
  myersBriggsType: string;
  attachmentStyle: string;
  loveLanguages: string[];
  conflictResolutionStyle: string;
  communicationStyle: string[];

  // Section 5: Interests & Culture
  weekendActivities: string[];
  culturalInterests: string[];
  intellectualPursuits: string[];
  vacationStyle: string[];

  // Section 6: Professional Gallery
  photos: string[];
  voiceIntroduction: string;
}

const ExecutiveProfileForm = () => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '', lastName: '', age: '', pronouns: '', executiveTitle: '', industry: '', successLevel: '',
    primaryLocation: '', lifestyleLevel: '', sexualOrientation: [], relationshipStyle: '', interestedInMeeting: [],
    dealBreakers: [], ageRangeMin: '', ageRangeMax: '', distancePreference: '', politicalViews: '', religiousViews: '',
    familyPlans: '', livingArrangement: '', coreValues: [], languagesSpoken: [], myersBriggsType: '', attachmentStyle: '',
    loveLanguages: [], conflictResolutionStyle: '', communicationStyle: [], weekendActivities: [], culturalInterests: [],
    intellectualPursuits: [], vacationStyle: [], photos: [], voiceIntroduction: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const N8N_WEBHOOK_URL = 'https://luvlang.org/webhook-test/luvlang-match';

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('executive_dating_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Error loading executive profile:', error);
        return;
      }
      if (data) {
        setFormData(prev => ({
          ...prev,
          firstName: data.first_name ?? '',
          lastName: data.last_name ?? '',
          age: data.age ? String(data.age) : '',
          pronouns: data.pronouns ?? '',
          executiveTitle: data.executive_title ?? '',
          industry: data.industry ?? '',
          successLevel: data.success_level ?? '',
          primaryLocation: data.primary_location ?? '',
          lifestyleLevel: data.lifestyle_level ?? '',
          sexualOrientation: data.sexual_orientation ?? [],
          relationshipStyle: data.relationship_style ?? '',
          interestedInMeeting: data.interested_in_meeting ?? [],
          dealBreakers: data.deal_breakers ?? [],
          ageRangeMin: data.age_range_min ? String(data.age_range_min) : '',
          ageRangeMax: data.age_range_max ? String(data.age_range_max) : '',
          distancePreference: data.distance_preference ? String(data.distance_preference) : '',
          politicalViews: data.political_views ?? '',
          religiousViews: data.religious_views ?? '',
          familyPlans: data.family_plans ?? '',
          livingArrangement: data.living_arrangement ?? '',
          coreValues: data.core_values ?? [],
          languagesSpoken: data.languages_spoken ?? [],
          myersBriggsType: data.myers_briggs_type ?? '',
          attachmentStyle: data.attachment_style ?? '',
          loveLanguages: data.love_languages ?? [],
          conflictResolutionStyle: data.conflict_resolution_style ?? '',
          communicationStyle: data.communication_style ?? [],
          weekendActivities: data.weekend_activities ?? [],
          culturalInterests: data.cultural_interests ?? [],
          intellectualPursuits: data.intellectual_pursuits ?? [],
          vacationStyle: data.vacation_style ?? [],
          photos: data.photos ?? [],
          voiceIntroduction: data.voice_introduction ?? '',
        }));
      }
    })();
  }, [user]);

  const sections = [
    'Executive Profile',
    'Identity & Preferences', 
    'Lifestyle & Values',
    'Psychology',
    'Interests & Culture',
    'Professional Gallery'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      const isSelected = currentArray.includes(value);
      const newArray = isSelected 
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const removeBadge = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      return { ...prev, [field]: currentArray.filter(item => item !== value) };
    });
  };

  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => 
      Array.isArray(value) ? value.length > 0 : value !== ''
    ).length;
    return (filledFields / totalFields) * 100;
  };

const handleComplete = async () => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to save your profile.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        user_id: user.id,
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        age: formData.age ? Number(formData.age) : null,
        pronouns: formData.pronouns || null,
        executive_title: formData.executiveTitle || null,
        industry: formData.industry || null,
        success_level: formData.successLevel || null,
        primary_location: formData.primaryLocation || null,
        lifestyle_level: formData.lifestyleLevel || null,
        sexual_orientation: formData.sexualOrientation,
        relationship_style: formData.relationshipStyle || null,
        interested_in_meeting: formData.interestedInMeeting,
        deal_breakers: formData.dealBreakers,
        age_range_min: formData.ageRangeMin ? Number(formData.ageRangeMin) : null,
        age_range_max: formData.ageRangeMax ? Number(formData.ageRangeMax) : null,
        distance_preference: formData.distancePreference ? Number(formData.distancePreference) : null,
        political_views: formData.politicalViews || null,
        religious_views: formData.religiousViews || null,
        family_plans: formData.familyPlans || null,
        living_arrangement: formData.livingArrangement || null,
        core_values: formData.coreValues,
        languages_spoken: formData.languagesSpoken,
        myers_briggs_type: formData.myersBriggsType || null,
        attachment_style: formData.attachmentStyle || null,
        love_languages: formData.loveLanguages,
        conflict_resolution_style: formData.conflictResolutionStyle || null,
        communication_style: formData.communicationStyle,
        weekend_activities: formData.weekendActivities,
        cultural_interests: formData.culturalInterests,
        intellectual_pursuits: formData.intellectualPursuits,
        vacation_style: formData.vacationStyle,
        photos: formData.photos,
        voice_introduction: formData.voiceIntroduction || null,
        completed: true,
      };

      const { error } = await supabase
        .from('executive_dating_profiles')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;

      console.log('Executive Profile Data:', JSON.stringify({ userId: user.id, ...payload }, null, 2));

      // Send to N8N webhook (best-effort)
      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, profile: payload, sent_at: new Date().toISOString() })
        });
      } catch (e) {
        console.warn('N8N webhook call failed (non-blocking):', e);
      }

      toast({ title: 'Profile saved', description: 'Your executive profile was saved successfully.' });
    } catch (e: any) {
      console.error('Error saving profile:', e);
      toast({ title: 'Save failed', description: e?.message || 'Unable to save your profile.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderMultiSelectBadges = (field: keyof FormData, options: string[], limit?: number) => (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(formData[field] as string[]).map(item => (
          <Badge key={item} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            {item}
            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeBadge(field, item)} />
          </Badge>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map(option => {
          const isSelected = (formData[field] as string[]).includes(option);
          const isLimitReached = limit && (formData[field] as string[]).length >= limit;
          return (
            <Button
              key={option}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={`justify-start ${isSelected ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50'}`}
              onClick={() => handleMultiSelect(field, option)}
              disabled={!isSelected && isLimitReached}
            >
              {option}
            </Button>
          );
        })}
      </div>
      {limit && (
        <p className="text-sm text-muted-foreground">
          Select up to {limit} options ({(formData[field] as string[]).length}/{limit})
        </p>
      )}
    </div>
  );

  const renderSection1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="pronouns">Pronouns</Label>
          <Select value={formData.pronouns} onValueChange={(value) => handleInputChange('pronouns', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select pronouns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="he/him">He/Him</SelectItem>
              <SelectItem value="she/her">She/Her</SelectItem>
              <SelectItem value="they/them">They/Them</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="executiveTitle">Executive Title</Label>
        <Input
          id="executiveTitle"
          value={formData.executiveTitle}
          onChange={(e) => handleInputChange('executiveTitle', e.target.value)}
          placeholder="e.g., CEO, Managing Partner, Senior VP"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          value={formData.industry}
          onChange={(e) => handleInputChange('industry', e.target.value)}
          placeholder="e.g., Finance, Technology, Healthcare"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="successLevel">Success Level</Label>
        <Select value={formData.successLevel} onValueChange={(value) => handleInputChange('successLevel', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select success level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="emerging-leader">Emerging Leader</SelectItem>
            <SelectItem value="established-executive">Established Executive</SelectItem>
            <SelectItem value="senior-executive">Senior Executive</SelectItem>
            <SelectItem value="c-suite">C-Suite</SelectItem>
            <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="primaryLocation">Primary Location</Label>
        <Input
          id="primaryLocation"
          value={formData.primaryLocation}
          onChange={(e) => handleInputChange('primaryLocation', e.target.value)}
          placeholder="City, State/Country"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="lifestyleLevel">Lifestyle Level</Label>
        <Select value={formData.lifestyleLevel} onValueChange={(value) => handleInputChange('lifestyleLevel', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select lifestyle level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="affluent">Affluent</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
            <SelectItem value="ultra-high-net-worth">Ultra High Net Worth</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Sexual Orientation</Label>
        {renderMultiSelectBadges('sexualOrientation', [
          'Straight/Heterosexual', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 
          'Queer', 'Asexual', 'Demisexual', 'Sapiosexual', 'Questioning', 'Fluid'
        ])}
      </div>

      <div>
        <Label htmlFor="relationshipStyle">Relationship Style</Label>
        <Select value={formData.relationshipStyle} onValueChange={(value) => handleInputChange('relationshipStyle', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select relationship style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monogamous">Monogamous</SelectItem>
            <SelectItem value="ethically-non-monogamous">Ethically Non-monogamous</SelectItem>
            <SelectItem value="polyamorous">Polyamorous</SelectItem>
            <SelectItem value="open-relationship">Open Relationship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Interested in Meeting</Label>
        {renderMultiSelectBadges('interestedInMeeting', [
          'Men', 'Women', 'Non-binary people', 'Trans men', 'Trans women', 'Anyone'
        ])}
      </div>

      <div>
        <Label>Deal Breakers</Label>
        {renderMultiSelectBadges('dealBreakers', [
          'Smoking', 'Heavy drinking', 'Drug use', 'Dishonesty', 'Lack of ambition',
          'Poor communication', 'Different life goals', 'Incompatible values'
        ])}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ageRangeMin">Minimum Age</Label>
          <Input
            id="ageRangeMin"
            type="number"
            value={formData.ageRangeMin}
            onChange={(e) => handleInputChange('ageRangeMin', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="ageRangeMax">Maximum Age</Label>
          <Input
            id="ageRangeMax"
            type="number"
            value={formData.ageRangeMax}
            onChange={(e) => handleInputChange('ageRangeMax', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="distancePreference">Distance (miles)</Label>
          <Input
            id="distancePreference"
            type="number"
            value={formData.distancePreference}
            onChange={(e) => handleInputChange('distancePreference', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="politicalViews">Political Views</Label>
          <Select value={formData.politicalViews} onValueChange={(value) => handleInputChange('politicalViews', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select political views" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="liberal">Liberal</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="libertarian">Libertarian</SelectItem>
              <SelectItem value="apolitical">Apolitical</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="religiousViews">Religious Views</Label>
          <Select value={formData.religiousViews} onValueChange={(value) => handleInputChange('religiousViews', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select religious views" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="christian">Christian</SelectItem>
              <SelectItem value="jewish">Jewish</SelectItem>
              <SelectItem value="muslim">Muslim</SelectItem>
              <SelectItem value="hindu">Hindu</SelectItem>
              <SelectItem value="buddhist">Buddhist</SelectItem>
              <SelectItem value="spiritual">Spiritual</SelectItem>
              <SelectItem value="agnostic">Agnostic</SelectItem>
              <SelectItem value="atheist">Atheist</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="familyPlans">Family Plans</Label>
          <Select value={formData.familyPlans} onValueChange={(value) => handleInputChange('familyPlans', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select family plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="want-children">Want children</SelectItem>
              <SelectItem value="have-children">Have children</SelectItem>
              <SelectItem value="dont-want-children">Don't want children</SelectItem>
              <SelectItem value="open-to-children">Open to children</SelectItem>
              <SelectItem value="undecided">Undecided</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="livingArrangement">Living Arrangement</Label>
          <Select value={formData.livingArrangement} onValueChange={(value) => handleInputChange('livingArrangement', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select living arrangement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="own-home">Own home</SelectItem>
              <SelectItem value="rent-apartment">Rent apartment</SelectItem>
              <SelectItem value="rent-house">Rent house</SelectItem>
              <SelectItem value="with-roommates">With roommates</SelectItem>
              <SelectItem value="with-family">With family</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Core Values (Select up to 6)</Label>
        {renderMultiSelectBadges('coreValues', [
          'Honesty & Integrity', 'Ambition & Success', 'Family & Loyalty', 'Adventure & Spontaneity',
          'Stability & Security', 'Creativity & Innovation', 'Compassion & Kindness', 'Independence & Freedom',
          'Tradition & Heritage', 'Growth & Learning', 'Justice & Fairness', 'Health & Wellness'
        ], 6)}
      </div>

      <div>
        <Label>Languages Spoken</Label>
        {renderMultiSelectBadges('languagesSpoken', [
          'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
          'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Other'
        ])}
      </div>
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="myersBriggsType">Myers-Briggs Personality Type</Label>
        <Select value={formData.myersBriggsType} onValueChange={(value) => handleInputChange('myersBriggsType', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select personality type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INTJ">INTJ - The Architect</SelectItem>
            <SelectItem value="INTP">INTP - The Thinker</SelectItem>
            <SelectItem value="ENTJ">ENTJ - The Commander</SelectItem>
            <SelectItem value="ENTP">ENTP - The Debater</SelectItem>
            <SelectItem value="INFJ">INFJ - The Advocate</SelectItem>
            <SelectItem value="INFP">INFP - The Mediator</SelectItem>
            <SelectItem value="ENFJ">ENFJ - The Protagonist</SelectItem>
            <SelectItem value="ENFP">ENFP - The Campaigner</SelectItem>
            <SelectItem value="ISTJ">ISTJ - The Logistician</SelectItem>
            <SelectItem value="ISFJ">ISFJ - The Protector</SelectItem>
            <SelectItem value="ESTJ">ESTJ - The Executive</SelectItem>
            <SelectItem value="ESFJ">ESFJ - The Consul</SelectItem>
            <SelectItem value="ISTP">ISTP - The Virtuoso</SelectItem>
            <SelectItem value="ISFP">ISFP - The Adventurer</SelectItem>
            <SelectItem value="ESTP">ESTP - The Entrepreneur</SelectItem>
            <SelectItem value="ESFP">ESFP - The Entertainer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="attachmentStyle">Attachment Style</Label>
        <Select value={formData.attachmentStyle} onValueChange={(value) => handleInputChange('attachmentStyle', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select attachment style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="secure">Secure</SelectItem>
            <SelectItem value="anxious">Anxious</SelectItem>
            <SelectItem value="avoidant">Avoidant</SelectItem>
            <SelectItem value="disorganized">Disorganized</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Love Languages (Select top 2)</Label>
        {renderMultiSelectBadges('loveLanguages', [
          'Words of Affirmation', 'Quality Time', 'Physical Touch', 
          'Acts of Service', 'Receiving Gifts'
        ], 2)}
      </div>

      <div>
        <Label htmlFor="conflictResolutionStyle">Conflict Resolution Style</Label>
        <Select value={formData.conflictResolutionStyle} onValueChange={(value) => handleInputChange('conflictResolutionStyle', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select conflict resolution style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="collaborative">Collaborative</SelectItem>
            <SelectItem value="compromising">Compromising</SelectItem>
            <SelectItem value="accommodating">Accommodating</SelectItem>
            <SelectItem value="competing">Competing</SelectItem>
            <SelectItem value="avoiding">Avoiding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Communication Style</Label>
        {renderMultiSelectBadges('communicationStyle', [
          'Direct & Honest', 'Diplomatic & Tactful', 'Analytical & Logical', 
          'Empathetic & Supportive', 'Humorous & Light-hearted', 'Passionate & Expressive'
        ])}
      </div>
    </div>
  );

  const renderSection5 = () => (
    <div className="space-y-6">
      <div>
        <Label>Weekend Activities</Label>
        {renderMultiSelectBadges('weekendActivities', [
          'Fine Dining', 'Art Galleries', 'Golf', 'Tennis', 'Wine Tasting', 'Theater',
          'Concerts', 'Museums', 'Yacht Clubs', 'Private Events', 'Charity Galas', 'Spa Days'
        ])}
      </div>

      <div>
        <Label>Cultural Interests</Label>
        {renderMultiSelectBadges('culturalInterests', [
          'Classical Music', 'Opera', 'Contemporary Art', 'Literature', 'Film & Cinema',
          'Architecture', 'Fashion', 'Dance', 'Photography', 'Sculpture', 'Jazz', 'World Music'
        ])}
      </div>

      <div>
        <Label>Intellectual Pursuits</Label>
        {renderMultiSelectBadges('intellectualPursuits', [
          'Investment Strategy', 'Business Innovation', 'Philosophy', 'History',
          'Science & Technology', 'Economics', 'Psychology', 'Political Science',
          'Languages', 'Writing', 'Research', 'Mentoring'
        ])}
      </div>

      <div>
        <Label>Vacation Style</Label>
        {renderMultiSelectBadges('vacationStyle', [
          'Luxury Resorts', 'Cultural Immersion', 'Adventure Travel', 'Business & Leisure',
          'Private Villas', 'Yacht Charters', 'City Breaks', 'Wellness Retreats',
          'Safari & Wildlife', 'Mountain Retreats', 'Island Getaways', 'Historical Tours'
        ])}
      </div>
    </div>
  );

  const renderSection6 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-lg">Professional Gallery (Upload 1-6 photos)</Label>
        <div className="mt-4 space-y-4">
          {/* Working Photo Upload Component */}
          <SimpleWorkingUpload />
          
          <div className="bg-purple-900/50 border border-purple-400/50 backdrop-blur-sm p-4 rounded-lg">
            <h4 className="font-medium text-purple-200 mb-2">Photo Guidelines:</h4>
            <ul className="text-sm text-purple-300 space-y-1">
              <li>• Professional headshot (recommended)</li>
              <li>• Business attire photos</li>
              <li>• Social/networking events</li>
              <li>• Lifestyle activities</li>
              <li>• High quality, well-lit images</li>
              <li>• Recent photos (within 2 years)</li>
              <li>• 5MB max per photo</li>
            </ul>
          </div>
        </div>
      </div>

      <VoiceIntroductionCapture
        onVoiceIntroductionChange={(audioUrl) => 
          setFormData(prev => ({ ...prev, voiceIntroduction: audioUrl }))
        }
        currentVoiceIntroduction={formData.voiceIntroduction}
      />
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 1: return renderSection1();
      case 2: return renderSection2();
      case 3: return renderSection3();
      case 4: return renderSection4();
      case 5: return renderSection5();
      case 6: return renderSection6();
      default: return renderSection1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-48 h-48 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-purple-300/30 shadow-2xl">
            <img 
              src={logoImage}
              alt="Luvlang Logo"
              className="w-40 h-40 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Executive Profile</h1>
          <p className="text-purple-200">Create your comprehensive dating profile</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-purple-200 font-medium">Section {currentSection} of {sections.length}</span>
            <span className="text-purple-200 font-medium">{Math.round(calculateProgress())}% Complete</span>
          </div>
          <Progress value={calculateProgress()} className="h-2 bg-purple-800" />
        </div>

        {/* Section Navigation */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {sections.map((section, index) => (
              <Button
                key={index}
                variant={currentSection === index + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentSection(index + 1)}
                className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis font-medium ${
                  currentSection === index + 1 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
                    : 'bg-purple-100/90 border-purple-300 text-purple-800 hover:bg-purple-200/90 hover:border-purple-400 shadow-sm'
                }`}
              >
                {section}
              </Button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-purple-300/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{sections[currentSection - 1]}</CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            {renderCurrentSection()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
            disabled={currentSection === 1}
            className="border-purple-400 text-purple-200 hover:bg-purple-700/20"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentSection === sections.length ? (
            <Button
              onClick={handleComplete}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSaving ? 'Saving…' : 'Complete Profile'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentSection(Math.min(sections.length, currentSection + 1))}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveProfileForm;