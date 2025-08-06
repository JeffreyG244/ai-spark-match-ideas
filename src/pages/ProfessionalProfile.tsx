import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface FormData {
  firstName: string;
  lastName: string;
  age: string;
  genderIdentity: string;
  lookingFor: string;
  jobTitle: string;
  company: string;
  industry: string;
  careerLevel: string;
  income: string;
  city: string;
  state: string;
  remoteWork: string;
  relationshipGoal: string;
  minAge: string;
  maxAge: string;
  bio: string;
  professionalGoals: string[];
  meetupAvailability: string[];
  coreValues: string[];
  interests: string[];
}

export default function ProfessionalProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    age: '',
    genderIdentity: '',
    lookingFor: '',
    jobTitle: '',
    company: '',
    industry: '',
    careerLevel: '',
    income: '',
    city: '',
    state: '',
    remoteWork: '',
    relationshipGoal: '',
    minAge: '',
    maxAge: '',
    bio: '',
    professionalGoals: [],
    meetupAvailability: [],
    coreValues: [],
    interests: []
  });

  const [newInterest, setNewInterest] = useState('');

  const calculateProgress = () => {
    const requiredFields = [
      'firstName', 'lastName', 'age', 'genderIdentity', 'lookingFor',
      'jobTitle', 'company', 'industry', 'careerLevel', 'income',
      'city', 'state', 'relationshipGoal', 'minAge', 'maxAge', 'bio'
    ];
    
    const completedFields = requiredFields.filter(field => 
      formData[field as keyof FormData] && 
      (formData[field as keyof FormData] as string).length > 0
    ).length;
    
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof FormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(item => item !== interest)
    }));
  };

  const handleSubmit = () => {
    const progress = calculateProgress();
    if (progress < 80) {
      toast.error('Please complete more fields before continuing');
      return;
    }
    
    toast.success('Profile saved! Continuing to personality assessment...');
    // Navigate to next step or save data
    navigate('/dashboard');
  };

  const incomeRanges = [
    '$50K - $75K', '$75K - $100K', '$100K - $150K',
    '$150K - $200K', '$200K - $300K', '$300K+'
  ];

  const professionalGoalOptions = [
    { id: 'growth', title: '🚀 Rapid Career Growth', desc: 'Focused on promotions and advancement' },
    { id: 'balance', title: '⚖️ Work-Life Balance', desc: 'Prioritize personal time and relationships' },
    { id: 'financial', title: '💰 Financial Success', desc: 'Building wealth and financial security' },
    { id: 'leadership', title: '🌟 Industry Leadership', desc: 'Becoming a thought leader in your field' },
    { id: 'entrepreneur', title: '🏢 Entrepreneurship', desc: 'Starting or growing your own business' },
    { id: 'mastery', title: '🎯 Skill Mastery', desc: 'Becoming an expert in your domain' }
  ];

  const meetupOptions = [
    { id: 'coffee', title: '☕ Coffee Meetings', desc: 'Morning or afternoon coffee chats' },
    { id: 'lunch', title: '🥗 Lunch Meetings', desc: 'Business lunch discussions' },
    { id: 'afterwork', title: '🍷 After-Work Events', desc: 'Evening networking and dates' },
    { id: 'weekend', title: '🏌️ Weekend Activities', desc: 'Weekend professional events' }
  ];

  const valueOptions = [
    { id: 'excellence', title: '🎯 Excellence' },
    { id: 'innovation', title: '🚀 Innovation' },
    { id: 'collaboration', title: '🤝 Collaboration' },
    { id: 'growth', title: '🌱 Growth Mindset' },
    { id: 'balance', title: '⚖️ Work-Life Balance' },
    { id: 'resilience', title: '💪 Resilience' },
    { id: 'creativity', title: '🎨 Creativity' },
    { id: 'data', title: '📊 Data-Driven' }
  ];

  const relationshipOptions = [
    { id: 'serious', title: '💍 Serious Partnership', desc: 'Long-term commitment and marriage' },
    { id: 'professional_dating', title: '👔 Professional Dating', desc: 'Dating within professional circles' },
    { id: 'networking_plus', title: '🤝 Networking Plus', desc: 'Professional connections with romantic potential' },
    { id: 'power_couple', title: '⚡ Power Couple', desc: 'Building success together professionally' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-primary)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-8 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold mb-2">
                🎯 Complete Your Professional Profile
              </CardTitle>
              <p className="text-lg opacity-90">
                Where exceptional careers meet extraordinary connections
              </p>
              <div className="mt-6">
                <Progress value={calculateProgress()} className="h-2" />
                <p className="text-sm mt-2 opacity-80">
                  Profile completion: {calculateProgress()}%
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Professional Identity Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👤 Professional Identity
              </CardTitle>
              <p className="text-muted-foreground">
                Help us understand your professional background and goals
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="required">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="required">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="required">Age</Label>
                  <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25-29">25-29</SelectItem>
                      <SelectItem value="30-34">30-34</SelectItem>
                      <SelectItem value="35-39">35-39</SelectItem>
                      <SelectItem value="40-44">40-44</SelectItem>
                      <SelectItem value="45-49">45-49</SelectItem>
                      <SelectItem value="50+">50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="required">Gender Identity</Label>
                  <Select value={formData.genderIdentity} onValueChange={(value) => handleInputChange('genderIdentity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="man">Man</SelectItem>
                      <SelectItem value="woman">Woman</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="required">Looking For</Label>
                  <Select value={formData.lookingFor} onValueChange={(value) => handleInputChange('lookingFor', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="all">All identities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💼 Career & Professional Life
              </CardTitle>
              <p className="text-muted-foreground">
                Your career details help us find professionally compatible matches
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle" className="required">Current Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="e.g., Senior Product Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="required">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="e.g., Google, Microsoft, or your company"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="required">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology/Software</SelectItem>
                      <SelectItem value="finance">Finance/Banking</SelectItem>
                      <SelectItem value="healthcare">Healthcare/Medical</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="law">Law/Legal</SelectItem>
                      <SelectItem value="marketing">Marketing/Advertising</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                      <SelectItem value="media">Media/Entertainment</SelectItem>
                      <SelectItem value="startup">Startup/Entrepreneur</SelectItem>
                      <SelectItem value="non-profit">Non-profit</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="required">Career Level</Label>
                  <Select value={formData.careerLevel} onValueChange={(value) => handleInputChange('careerLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                      <SelectItem value="executive">Executive (10+ years)</SelectItem>
                      <SelectItem value="csuite">C-Suite/Founder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="required">Annual Income Range</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {incomeRanges.map((range) => (
                    <Button
                      key={range}
                      type="button"
                      variant={formData.income === range ? "default" : "outline"}
                      className="h-auto py-3"
                      onClick={() => handleInputChange('income', range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Professional Goals (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {professionalGoalOptions.map((goal) => (
                    <div key={goal.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={goal.id}
                        checked={formData.professionalGoals.includes(goal.id)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('professionalGoals', goal.id, checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor={goal.id} className="font-medium cursor-pointer">
                          {goal.title}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {goal.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📍 Location & Availability
              </CardTitle>
              <p className="text-muted-foreground">
                Help us find matches in your area and with compatible schedules
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className="required">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="e.g., San Francisco"
                  />
                </div>
                <div>
                  <Label className="required">State</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="california">California</SelectItem>
                      <SelectItem value="new-york">New York</SelectItem>
                      <SelectItem value="texas">Texas</SelectItem>
                      <SelectItem value="florida">Florida</SelectItem>
                      {/* Add more states as needed */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Remote Work</Label>
                  <Select value={formData.remoteWork} onValueChange={(value) => handleInputChange('remoteWork', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-office">In-office</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="remote">Fully remote</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Available for Professional Meetups</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {meetupOptions.map((option) => (
                    <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={option.id}
                        checked={formData.meetupAvailability.includes(option.id)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('meetupAvailability', option.id, checked as boolean)
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.title}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {option.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Relationship Goals Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Relationship Goals & Values
              </CardTitle>
              <p className="text-muted-foreground">
                What are you looking for in a professional partner?
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="required">Primary Relationship Goal</Label>
                <RadioGroup
                  value={formData.relationshipGoal}
                  onValueChange={(value) => handleInputChange('relationshipGoal', value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3"
                >
                  {relationshipOptions.map((option) => (
                    <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.title}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {option.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="required">Preferred Partner Age Range - Min</Label>
                  <Select value={formData.minAge} onValueChange={(value) => handleInputChange('minAge', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select minimum age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="35">35</SelectItem>
                      <SelectItem value="40">40</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="55">55+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="required">Preferred Partner Age Range - Max</Label>
                  <Select value={formData.maxAge} onValueChange={(value) => handleInputChange('maxAge', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select maximum age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="35">35</SelectItem>
                      <SelectItem value="40">40</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="55">55</SelectItem>
                      <SelectItem value="60">60+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About You Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌟 About You
              </CardTitle>
              <p className="text-muted-foreground">
                Share what makes you unique as a professional and partner
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="bio" className="required">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell potential matches about your career journey, achievements, and what drives you professionally. What makes you passionate about your work? What are your biggest professional wins?"
                  rows={5}
                  maxLength={750}
                />
                <div className="text-right text-sm text-muted-foreground mt-1">
                  {formData.bio.length}/750 characters
                </div>
              </div>

              <div>
                <Label>Core Professional Values (Select up to 5)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  {valueOptions.map((value) => (
                    <div key={value.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={value.id}
                        checked={formData.coreValues.includes(value.id)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('coreValues', value.id, checked as boolean)
                        }
                        disabled={formData.coreValues.length >= 5 && !formData.coreValues.includes(value.id)}
                      />
                      <label htmlFor={value.id} className="text-sm font-medium cursor-pointer">
                        {value.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Professional Interests & Hobbies</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Type and press Enter to add"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  />
                  <Button type="button" onClick={addInterest}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.interests.map((interest) => (
                    <div key={interest} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:bg-primary-foreground/20 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Button 
                  onClick={handleSubmit}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Continue to Personality Assessment →
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Next: Professional compatibility and communication style assessment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}