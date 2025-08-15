import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { User, Heart, MapPin, Calendar, Target, Users } from 'lucide-react';

const SEXUAL_ORIENTATIONS = [
  { value: 'heterosexual', label: 'Heterosexual/Straight', description: 'Attracted to opposite gender' },
  { value: 'homosexual', label: 'Homosexual/Gay/Lesbian', description: 'Attracted to same gender' },
  { value: 'bisexual', label: 'Bisexual', description: 'Attracted to both genders' },
  { value: 'pansexual', label: 'Pansexual', description: 'Attracted to all gender identities' },
  { value: 'asexual', label: 'Asexual', description: 'Little to no sexual attraction' },
  { value: 'demisexual', label: 'Demisexual', description: 'Attraction develops after emotional bond' },
  { value: 'questioning', label: 'Questioning', description: 'Exploring sexual orientation' },
  { value: 'other', label: 'Other', description: 'Prefer to specify' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', description: 'Keep private' }
];

const GENDER_IDENTITIES = [
  'Man', 'Woman', 'Non-binary', 'Genderfluid', 'Transgender man', 
  'Transgender woman', 'Agender', 'Two-spirit', 'Other', 'Prefer not to say'
];

const RELATIONSHIP_GOALS = [
  { value: 'serious_relationship', label: 'Serious Long-term Relationship', icon: '💍' },
  { value: 'marriage', label: 'Marriage & Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'casual_dating', label: 'Casual Dating', icon: '☕' },
  { value: 'friends_first', label: 'Friends First', icon: '🤝' },
  { value: 'companionship', label: 'Companionship', icon: '🫂' },
  { value: 'exploring', label: 'Still Exploring', icon: '🔍' }
];

const LIFESTYLE_QUESTIONS = [
  {
    id: 'smoking',
    question: 'Do you smoke cigarettes?',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'socially', label: 'Socially' },
      { value: 'regularly', label: 'Regularly' },
      { value: 'trying_to_quit', label: 'Trying to quit' }
    ]
  },
  {
    id: 'vaping',
    question: 'Do you vape?',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'regularly', label: 'Regularly' },
      { value: 'trying_to_quit', label: 'Trying to quit' }
    ]
  },
  {
    id: 'cannabis',
    question: 'Do you use cannabis?',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'regularly', label: 'Regularly' },
      { value: 'medical_only', label: 'Medical use only' }
    ]
  },
  {
    id: 'drinking',
    question: 'How often do you drink alcohol?',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'socially', label: 'Socially' },
      { value: 'regularly', label: 'Regularly' }
    ]
  },
  {
    id: 'exercise',
    question: 'How often do you exercise?',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'few_times_week', label: 'Few times a week' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' }
    ]
  },
  {
    id: 'diet',
    question: 'What best describes your diet?',
    options: [
      { value: 'omnivore', label: 'Omnivore' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'pescatarian', label: 'Pescatarian' },
      { value: 'keto', label: 'Keto' },
      { value: 'paleo', label: 'Paleo' },
      { value: 'other', label: 'Other' }
    ]
  }
];

const PERSONALITY_TRAITS = [
  {
    id: 'extroversion',
    question: 'In social situations, I am:',
    options: [
      { value: 'very_extroverted', label: 'Very outgoing and energetic' },
      { value: 'somewhat_extroverted', label: 'Generally social and talkative' },
      { value: 'balanced', label: 'Sometimes social, sometimes quiet' },
      { value: 'somewhat_introverted', label: 'Prefer smaller groups' },
      { value: 'very_introverted', label: 'Prefer solitude or one-on-one' }
    ]
  },
  {
    id: 'communication_style',
    question: 'My communication style is:',
    options: [
      { value: 'direct', label: 'Direct and straightforward' },
      { value: 'diplomatic', label: 'Diplomatic and thoughtful' },
      { value: 'emotional', label: 'Emotional and expressive' },
      { value: 'analytical', label: 'Logical and analytical' },
      { value: 'supportive', label: 'Supportive and encouraging' }
    ]
  }
];

interface BasicProfileQuestionsProps {
  answers: any; // Allow any type to be more flexible
  onAnswerChange: (questionId: string, answer: string) => void;
}

const BasicProfileQuestions = ({ answers, onAnswerChange }: BasicProfileQuestionsProps) => {
  return (
    <div className="space-y-8">
      {/* Demographics Section */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <p className="text-sm text-gray-600">
            Help us understand who you are
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium">Age *</Label>
              <Select 
                value={answers.age || ''} 
                onValueChange={(value) => onAnswerChange('age', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your age" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 63 }, (_, i) => i + 18).map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years old
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">City *</Label>
              <Select 
                value={answers.city || ''} 
                onValueChange={(value) => onAnswerChange('city', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                  <SelectItem value="Houston">Houston</SelectItem>
                  <SelectItem value="Phoenix">Phoenix</SelectItem>
                  <SelectItem value="Philadelphia">Philadelphia</SelectItem>
                  <SelectItem value="San Antonio">San Antonio</SelectItem>
                  <SelectItem value="San Diego">San Diego</SelectItem>
                  <SelectItem value="Dallas">Dallas</SelectItem>
                  <SelectItem value="San Jose">San Jose</SelectItem>
                  <SelectItem value="Austin">Austin</SelectItem>
                  <SelectItem value="Jacksonville">Jacksonville</SelectItem>
                  <SelectItem value="Fort Worth">Fort Worth</SelectItem>
                  <SelectItem value="Columbus">Columbus</SelectItem>
                  <SelectItem value="Charlotte">Charlotte</SelectItem>
                  <SelectItem value="San Francisco">San Francisco</SelectItem>
                  <SelectItem value="Indianapolis">Indianapolis</SelectItem>
                  <SelectItem value="Seattle">Seattle</SelectItem>
                  <SelectItem value="Denver">Denver</SelectItem>
                  <SelectItem value="Washington">Washington</SelectItem>
                  <SelectItem value="Boston">Boston</SelectItem>
                  <SelectItem value="Nashville">Nashville</SelectItem>
                  <SelectItem value="Detroit">Detroit</SelectItem>
                  <SelectItem value="Portland">Portland</SelectItem>
                  <SelectItem value="Las Vegas">Las Vegas</SelectItem>
                  <SelectItem value="Memphis">Memphis</SelectItem>
                  <SelectItem value="Louisville">Louisville</SelectItem>
                  <SelectItem value="Baltimore">Baltimore</SelectItem>
                  <SelectItem value="Milwaukee">Milwaukee</SelectItem>
                  <SelectItem value="Albuquerque">Albuquerque</SelectItem>
                  <SelectItem value="Tucson">Tucson</SelectItem>
                  <SelectItem value="Fresno">Fresno</SelectItem>
                  <SelectItem value="Sacramento">Sacramento</SelectItem>
                  <SelectItem value="Mesa">Mesa</SelectItem>
                  <SelectItem value="Kansas City">Kansas City</SelectItem>
                  <SelectItem value="Atlanta">Atlanta</SelectItem>
                  <SelectItem value="Long Beach">Long Beach</SelectItem>
                  <SelectItem value="Colorado Springs">Colorado Springs</SelectItem>
                  <SelectItem value="Raleigh">Raleigh</SelectItem>
                  <SelectItem value="Miami">Miami</SelectItem>
                  <SelectItem value="Virginia Beach">Virginia Beach</SelectItem>
                  <SelectItem value="Omaha">Omaha</SelectItem>
                  <SelectItem value="Oakland">Oakland</SelectItem>
                  <SelectItem value="Minneapolis">Minneapolis</SelectItem>
                  <SelectItem value="Tulsa">Tulsa</SelectItem>
                  <SelectItem value="Arlington">Arlington</SelectItem>
                  <SelectItem value="Tampa">Tampa</SelectItem>
                  <SelectItem value="New Orleans">New Orleans</SelectItem>
                  <SelectItem value="Wichita">Wichita</SelectItem>
                  <SelectItem value="Cleveland">Cleveland</SelectItem>
                  <SelectItem value="Bakersfield">Bakersfield</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium">State *</Label>
              <Select 
                value={answers.state || ''} 
                onValueChange={(value) => onAnswerChange('state', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AL">Alabama</SelectItem>
                  <SelectItem value="AK">Alaska</SelectItem>
                  <SelectItem value="AZ">Arizona</SelectItem>
                  <SelectItem value="AR">Arkansas</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="CO">Colorado</SelectItem>
                  <SelectItem value="CT">Connecticut</SelectItem>
                  <SelectItem value="DE">Delaware</SelectItem>
                  <SelectItem value="DC">District of Columbia</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="GA">Georgia</SelectItem>
                  <SelectItem value="HI">Hawaii</SelectItem>
                  <SelectItem value="ID">Idaho</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                  <SelectItem value="IN">Indiana</SelectItem>
                  <SelectItem value="IA">Iowa</SelectItem>
                  <SelectItem value="KS">Kansas</SelectItem>
                  <SelectItem value="KY">Kentucky</SelectItem>
                  <SelectItem value="LA">Louisiana</SelectItem>
                  <SelectItem value="ME">Maine</SelectItem>
                  <SelectItem value="MD">Maryland</SelectItem>
                  <SelectItem value="MA">Massachusetts</SelectItem>
                  <SelectItem value="MI">Michigan</SelectItem>
                  <SelectItem value="MN">Minnesota</SelectItem>
                  <SelectItem value="MS">Mississippi</SelectItem>
                  <SelectItem value="MO">Missouri</SelectItem>
                  <SelectItem value="MT">Montana</SelectItem>
                  <SelectItem value="NE">Nebraska</SelectItem>
                  <SelectItem value="NV">Nevada</SelectItem>
                  <SelectItem value="NH">New Hampshire</SelectItem>
                  <SelectItem value="NJ">New Jersey</SelectItem>
                  <SelectItem value="NM">New Mexico</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="NC">North Carolina</SelectItem>
                  <SelectItem value="ND">North Dakota</SelectItem>
                  <SelectItem value="OH">Ohio</SelectItem>
                  <SelectItem value="OK">Oklahoma</SelectItem>
                  <SelectItem value="OR">Oregon</SelectItem>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                  <SelectItem value="RI">Rhode Island</SelectItem>
                  <SelectItem value="SC">South Carolina</SelectItem>
                  <SelectItem value="SD">South Dakota</SelectItem>
                  <SelectItem value="TN">Tennessee</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="UT">Utah</SelectItem>
                  <SelectItem value="VT">Vermont</SelectItem>
                  <SelectItem value="VA">Virginia</SelectItem>
                  <SelectItem value="WA">Washington</SelectItem>
                  <SelectItem value="WV">West Virginia</SelectItem>
                  <SelectItem value="WI">Wisconsin</SelectItem>
                  <SelectItem value="WY">Wyoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Zip Code</Label>
              <Input
                type="text"
                value={answers.zipcode || ''}
                onChange={(e) => onAnswerChange('zipcode', e.target.value)}
                placeholder="12345"
                className="mt-1"
                maxLength={5}
                pattern="[0-9]{5}"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Gender Identity *</Label>
            <Select 
              value={answers.gender || ''} 
              onValueChange={(value) => onAnswerChange('gender', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your gender identity" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_IDENTITIES.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Height (optional)</Label>
            <Select 
              value={answers.height || ''} 
              onValueChange={(value) => onAnswerChange('height', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your height" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const totalInches = 48 + i * 2; // 4'0" to 6'10"
                  const feet = Math.floor(totalInches / 12);
                  const inches = totalInches % 12;
                  return (
                    <SelectItem key={totalInches} value={`${feet}'${inches}"`}>
                      {feet}'{inches}"
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sexual Orientation Section */}
      <Card className="border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Heart className="h-5 w-5" />
            Sexual Orientation & Dating Preferences
          </CardTitle>
          <p className="text-sm text-gray-600">
            This helps us match you with compatible people
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Sexual Orientation *</Label>
            <RadioGroup
              value={answers.sexual_orientation || ''}
              onValueChange={(value) => onAnswerChange('sexual_orientation', value)}
              className="space-y-3"
            >
              {SEXUAL_ORIENTATIONS.map((orientation) => (
                <div key={orientation.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                  <RadioGroupItem value={orientation.value} id={orientation.value} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={orientation.value} className="font-medium cursor-pointer">
                      {orientation.label}
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">{orientation.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium">Interested In *</Label>
            <Select 
              value={answers.interested_in || ''} 
              onValueChange={(value) => onAnswerChange('interested_in', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Who are you interested in meeting?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="non_binary">Non-binary people</SelectItem>
                <SelectItem value="everyone">Everyone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Preferred Age Range - Min *</Label>
              <Input
                type="number"
                min="18"
                max="100"
                value={answers.age_preference_min || ''}
                onChange={(e) => onAnswerChange('age_preference_min', e.target.value)}
                placeholder="18"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Preferred Age Range - Max *</Label>
              <Input
                type="number"
                min="18"
                max="100"
                value={answers.age_preference_max || ''}
                onChange={(e) => onAnswerChange('age_preference_max', e.target.value)}
                placeholder="65"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Goals */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Target className="h-5 w-5" />
            Relationship Goals
          </CardTitle>
          <p className="text-sm text-gray-600">
            What are you looking for in a relationship?
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers.relationship_goals || ''}
            onValueChange={(value) => onAnswerChange('relationship_goals', value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {RELATIONSHIP_GOALS.map((goal) => (
              <div key={goal.value} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value={goal.value} id={goal.value} />
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{goal.icon}</span>
                  <Label htmlFor={goal.value} className="font-medium cursor-pointer">
                    {goal.label}
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Lifestyle Questions */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Users className="h-5 w-5" />
            Lifestyle & Habits
          </CardTitle>
          <p className="text-sm text-gray-600">
            These help us find compatible matches for you
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {LIFESTYLE_QUESTIONS.map((question) => (
            <div key={question.id}>
              <Label className="text-sm font-medium mb-3 block">{question.question}</Label>
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => onAnswerChange(question.id, value)}
                className="flex flex-wrap gap-3"
              >
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                    <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Personality Traits */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Calendar className="h-5 w-5" />
            Personality Insights
          </CardTitle>
          <p className="text-sm text-gray-600">
            Help us understand your personality for better matches
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {PERSONALITY_TRAITS.map((trait) => (
            <div key={trait.id}>
              <Label className="text-sm font-medium mb-3 block">{trait.question}</Label>
              <RadioGroup
                value={answers[trait.id] || ''}
                onValueChange={(value) => onAnswerChange(trait.id, value)}
                className="space-y-2"
              >
                {trait.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 rounded border hover:bg-gray-50">
                    <RadioGroupItem value={option.value} id={`${trait.id}-${option.value}`} />
                    <Label
                      htmlFor={`${trait.id}-${option.value}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bio Section */}
      <Card className="border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <MapPin className="h-5 w-5" />
            About You
          </CardTitle>
          <p className="text-sm text-gray-600">
            Share what makes you unique
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bio" className="text-sm font-medium">Tell us about yourself *</Label>
            <Textarea
              id="bio"
              value={answers.bio || ''}
              onChange={(e) => onAnswerChange('bio', e.target.value)}
              placeholder="Share your interests, what you're passionate about, what you're looking for in a partner... (minimum 150 characters)"
              className={`mt-1 min-h-[120px] ${(answers.bio || '').length < 150 ? 'border-red-300' : ''}`}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className={`text-xs ${(answers.bio || '').length < 150 ? 'text-red-500' : 'text-gray-500'}`}>
                {(answers.bio || '').length < 150 
                  ? `Minimum 150 characters required (${150 - (answers.bio || '').length} more needed)`
                  : `${(answers.bio || '').length}/500 characters`
                }
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="interests" className="text-sm font-medium">Interests & Hobbies</Label>
            <Input
              id="interests"
              value={answers.interests || ''}
              onChange={(e) => onAnswerChange('interests', e.target.value)}
              placeholder="e.g., hiking, cooking, photography, travel, music..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="profession" className="text-sm font-medium">Profession</Label>
            <Input
              id="profession"
              value={answers.profession || ''}
              onChange={(e) => onAnswerChange('profession', e.target.value)}
              placeholder="What do you do for work?"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="education" className="text-sm font-medium">Education</Label>
            <Select 
              value={answers.education || ''} 
              onValueChange={(value) => onAnswerChange('education', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="some_college">Some College</SelectItem>
                <SelectItem value="associate">Associate Degree</SelectItem>
                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                <SelectItem value="master">Master's Degree</SelectItem>
                <SelectItem value="doctorate">Doctorate</SelectItem>
                <SelectItem value="trade_school">Trade School</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicProfileQuestions;