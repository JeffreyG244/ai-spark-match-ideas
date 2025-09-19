import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface InterestCard {
  emoji: string;
  title: string;
  description: string;
  isPremium?: boolean;
}

interface Category {
  icon: string;
  title: string;
  description: string;
  interests: InterestCard[];
}

const ProfessionalInterests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  const categories: Category[] = [
    {
      icon: '📈',
      title: 'Professional Development',
      description: 'Career growth and industry engagement',
      interests: [
        { emoji: '🎤', title: 'Public Speaking', description: 'Keynotes, conferences, and thought leadership presentations' },
        { emoji: '🤝', title: 'Executive Networking', description: 'C-suite connections, board meetings, and strategic partnerships', isPremium: true },
        { emoji: '📚', title: 'Industry Research', description: 'Market analysis, trend forecasting, and competitive intelligence' },
        { emoji: '🏆', title: 'Awards & Recognition', description: 'Industry honors, professional achievements, and excellence programs' },
        { emoji: '🎯', title: 'Mentorship', description: 'Developing talent, coaching executives, and leadership development' },
        { emoji: '💡', title: 'Innovation Labs', description: 'R&D projects, startup incubation, and disruptive technologies' }
      ]
    },
    {
      icon: '💎',
      title: 'Luxury Lifestyle',
      description: 'Refined tastes and exclusive experiences',
      interests: [
        { emoji: '🥂', title: 'Fine Wine Collecting', description: 'Vintage collections, wine auctions, and vineyard experiences', isPremium: true },
        { emoji: '🍸', title: 'Craft Cocktails', description: 'Mixology, speakeasies, and artisanal spirits' },
        { emoji: '⭐', title: 'Michelin Dining', description: 'Celebrity chefs, tasting menus, and culinary adventures', isPremium: true },
        { emoji: '🏎️', title: 'Luxury Automobiles', description: 'Sports cars, classic collections, and racing experiences' },
        { emoji: '⌚', title: 'Fine Timepieces', description: 'Swiss watches, vintage collections, and horological craftsmanship' },
        { emoji: '🛥️', title: 'Yachting', description: 'Private charters, sailing, and luxury marine experiences', isPremium: true }
      ]
    },
    {
      icon: '🧠',
      title: 'Intellectual & Cultural',
      description: 'Mind-expanding activities and cultural refinement',
      interests: [
        { emoji: '🎭', title: 'Theater & Opera', description: 'Broadway premieres, classical performances, and cultural events' },
        { emoji: '🖼️', title: 'Art Collecting', description: 'Gallery openings, auctions, and contemporary art investments' },
        { emoji: '📖', title: 'Literary Circles', description: 'Book clubs, author events, and intellectual discourse' },
        { emoji: '🎼', title: 'Classical Music', description: 'Symphony concerts, chamber music, and musical patronage' },
        { emoji: '🌍', title: 'Cultural Travel', description: 'Historical sites, archaeological expeditions, and cultural immersion' },
        { emoji: '🔬', title: 'Scientific Innovation', description: 'Research breakthroughs, tech conferences, and scientific patronage' }
      ]
    },
    {
      icon: '💪',
      title: 'Executive Wellness',
      description: 'High-performance fitness and wellness practices',
      interests: [
        { emoji: '🏌️', title: 'Private Golf', description: 'Exclusive courses, tournaments, and golf networking', isPremium: true },
        { emoji: '🎾', title: 'Tennis', description: 'Private courts, coaching, and competitive play' },
        { emoji: '🥊', title: 'Executive Boxing', description: 'Personal training, stress relief, and mental toughness' },
        { emoji: '🧘', title: 'Mindfulness & Meditation', description: 'Executive coaching, mental clarity, and peak performance' },
        { emoji: '🎿', title: 'Alpine Skiing', description: 'Exclusive resorts, powder skiing, and mountain retreats', isPremium: true },
        { emoji: '🏃', title: 'Marathon Running', description: 'Endurance challenges, charity races, and personal achievement' }
      ]
    },
    {
      icon: '📊',
      title: 'Investment & Wealth',
      description: 'Financial growth and alternative investments',
      interests: [
        { emoji: '🏘️', title: 'Real Estate Investment', description: 'Property development, luxury markets, and portfolio diversification', isPremium: true },
        { emoji: '💰', title: 'Angel Investing', description: 'Startup funding, venture capital, and emerging technologies' },
        { emoji: '₿', title: 'Cryptocurrency', description: 'Digital assets, blockchain technology, and alternative investments' },
        { emoji: '📈', title: 'Trading & Markets', description: 'Active trading, market analysis, and financial instruments' },
        { emoji: '🏛️', title: 'Private Banking', description: 'Wealth management, private equity, and exclusive financial services' },
        { emoji: '💎', title: 'Luxury Asset Collecting', description: 'Art, watches, jewelry, and appreciating collectibles' }
      ]
    },
    {
      icon: '🌟',
      title: 'Social Impact',
      description: 'Making a difference and giving back',
      interests: [
        { emoji: '🎓', title: 'Education Philanthropy', description: 'Scholarship programs, university boards, and educational reform' },
        { emoji: '🏥', title: 'Healthcare Advocacy', description: 'Medical research funding, hospital boards, and health initiatives' },
        { emoji: '🌱', title: 'Environmental Conservation', description: 'Sustainability investing, conservation projects, and climate solutions' },
        { emoji: '🏛️', title: 'Policy & Governance', description: 'Think tanks, policy research, and civic leadership' },
        { emoji: '🎯', title: 'Foundation Leadership', description: 'Private foundations, charitable giving, and strategic philanthropy', isPremium: true },
        { emoji: '🤝', title: 'Social Entrepreneurship', description: 'Impact investing, B-corps, and mission-driven ventures' }
      ]
    },
    {
      icon: '❤️',
      title: 'Personal Passions',
      description: 'What drives you beyond professional success',
      interests: [
        { emoji: '👨‍👩‍👧‍👦', title: 'Family Legacy', description: 'Building generational wealth, family traditions, and heritage' },
        { emoji: '✈️', title: 'Luxury Travel', description: 'Private jets, exclusive resorts, and curated experiences' },
        { emoji: '🍳', title: 'Culinary Arts', description: 'Cooking classes with celebrity chefs, food & wine pairing' },
        { emoji: '📸', title: 'Photography', description: 'Professional equipment, travel photography, and artistic expression' },
        { emoji: '✍️', title: 'Writing & Publishing', description: 'Thought leadership articles, books, and content creation' },
        { emoji: '🎮', title: 'Strategic Gaming', description: 'Chess, poker, board games that develop strategic thinking' }
      ]
    }
  ];

  const maxSelections = 20;
  const minSelections = 8;
  const totalSelected = selectedInterests.length + customInterests.length;

  const toggleInterest = (interestTitle: string) => {
    if (selectedInterests.includes(interestTitle)) {
      setSelectedInterests(prev => prev.filter(interest => interest !== interestTitle));
    } else {
      if (totalSelected < maxSelections) {
        setSelectedInterests(prev => [...prev, interestTitle]);
      } else {
        toast({
          title: "Selection Limit Reached",
          description: `You can select up to ${maxSelections} interests. Please deselect some before adding more.`,
          variant: "destructive"
        });
      }
    }
  };

  const addCustomInterest = () => {
    const interest = customInput.trim();
    if (interest && customInterests.length < 5 && !customInterests.includes(interest) && !selectedInterests.includes(interest)) {
      if (totalSelected < maxSelections) {
        setCustomInterests(prev => [...prev, interest]);
        setCustomInput('');
      } else {
        toast({
          title: "Selection Limit Reached",
          description: `You can select up to ${maxSelections} interests total.`,
          variant: "destructive"
        });
      }
    }
  };

  const removeCustomInterest = (interest: string) => {
    setCustomInterests(prev => prev.filter(item => item !== interest));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest();
    }
  };

  const handleContinue = () => {
    if (totalSelected >= minSelections) {
      toast({
        title: "Interests Saved!",
        description: `Your ${totalSelected} interests will help us find perfect professional matches.`
      });
      // Navigate to next step - could be compatibility matching or back to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="overflow-hidden shadow-2xl">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-center py-12">
            <CardTitle className="text-4xl font-bold mb-2">
              🌟 Professional Interests & Lifestyle
            </CardTitle>
            <p className="text-xl opacity-90 mb-6">
              Curated interests that matter to sophisticated professionals
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block font-semibold">
              Selected: {totalSelected} of {minSelections}+ interests
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Categories */}
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <Card className="bg-muted/50 border-l-4 border-l-primary">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl flex items-center justify-center text-2xl">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-foreground">{category.title}</h3>
                        <p className="text-muted-foreground text-lg">{category.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.interests.map((interest, interestIndex) => (
                        <Card
                          key={interestIndex}
                          className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            selectedInterests.includes(interest.title)
                              ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg transform scale-105'
                              : 'hover:bg-accent/50'
                          }`}
                          onClick={() => toggleInterest(interest.title)}
                        >
                          <CardContent className="p-6 relative">
                            {interest.isPremium && (
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-foreground px-2 py-1 rounded-lg text-xs font-bold uppercase">
                                Elite
                              </div>
                            )}
                            {selectedInterests.includes(interest.title) && (
                              <div className="absolute top-2 right-3 text-2xl font-bold">✓</div>
                            )}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{interest.emoji}</span>
                              <span className="font-semibold text-lg">{interest.title}</span>
                            </div>
                            <p className={`text-sm leading-relaxed ${
                              selectedInterests.includes(interest.title) ? 'opacity-90' : 'text-muted-foreground'
                            }`}>
                              {interest.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Custom Interests */}
            <Card className="bg-gradient-to-r from-accent/20 to-muted/20 border-2 border-dashed border-primary/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💫</span>
                  <h3 className="text-xl font-semibold">Add Your Unique Interests</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  What other sophisticated interests define you? Add up to 5 custom interests.
                </p>
                <Input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your interest and press Enter (e.g., 'Rare Book Collecting', 'Formula 1 Racing')"
                  className="mb-4"
                />
                <div className="flex flex-wrap gap-2">
                  {customInterests.map((interest, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {interest}
                      <button
                        onClick={() => removeCustomInterest(interest)}
                        className="text-lg font-bold opacity-80 hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <div className="text-center mt-12 pt-8 border-t border-border">
              <Button
                onClick={handleContinue}
                disabled={totalSelected < minSelections}
                size="lg"
                className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
              >
                {totalSelected >= minSelections
                  ? `Continue to Compatibility Matching (${totalSelected} interests selected) →`
                  : `Select at least ${minSelections} interests to continue (${totalSelected}/${minSelections}) →`
                }
              </Button>
              <p className="text-muted-foreground mt-4">
                Next: Our AI will analyze your interests for deep compatibility matching
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalInterests;