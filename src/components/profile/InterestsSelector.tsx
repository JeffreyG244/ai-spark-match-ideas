
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';

const AVAILABLE_INTERESTS = [
  // Lifestyle
  'Travel', 'Photography', 'Cooking', 'Fitness', 'Yoga', 'Meditation', 'Dancing', 'Music',
  // Entertainment
  'Movies', 'TV Shows', 'Reading', 'Gaming', 'Theater', 'Concerts', 'Festivals', 'Art',
  // Outdoor Activities
  'Hiking', 'Camping', 'Beach', 'Swimming', 'Running', 'Cycling', 'Rock Climbing', 'Skiing',
  // Food & Drink
  'Wine Tasting', 'Coffee', 'Craft Beer', 'Fine Dining', 'Street Food', 'Vegetarian', 'Vegan',
  // Hobbies
  'Gardening', 'DIY Projects', 'Crafting', 'Painting', 'Writing', 'Blogging', 'Podcasts',
  // Social
  'Volunteering', 'Networking', 'Board Games', 'Trivia', 'Karaoke', 'Comedy Shows',
  // Sports
  'Football', 'Basketball', 'Tennis', 'Golf', 'Soccer', 'Baseball', 'Hockey', 'Martial Arts',
  // Tech & Science
  'Technology', 'Science', 'Astronomy', 'Environmental Issues', 'Startups', 'Investing'
];

interface InterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
}

const InterestsSelector = ({ selectedInterests, onInterestsChange }: InterestsSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInterests = AVAILABLE_INTERESTS.filter(interest =>
    interest.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedInterests.includes(interest)
  );

  const addInterest = (interest: string) => {
    if (selectedInterests.length < 10 && !selectedInterests.includes(interest)) {
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  const addCustomInterest = () => {
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm && selectedInterests.length < 10 && !selectedInterests.includes(trimmedTerm)) {
      onInterestsChange([...selectedInterests, trimmedTerm]);
      setSearchTerm('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest();
    }
  };

  const removeInterest = (interest: string) => {
    onInterestsChange(selectedInterests.filter(i => i !== interest));
  };

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-800">Interests & Hobbies</CardTitle>
        <p className="text-sm text-gray-600">Choose up to 10 interests that represent you</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Interests */}
        {selectedInterests.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Your Interests ({selectedInterests.length}/10)</h4>
            <div className="flex flex-wrap gap-2">
              {selectedInterests.map(interest => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                  onClick={() => removeInterest(interest)}
                >
                  {interest}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search and Add Custom Interest */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search interests or type your own..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchTerm.trim() && !AVAILABLE_INTERESTS.includes(searchTerm.trim()) && (
              <Button
                onClick={addCustomInterest}
                disabled={selectedInterests.length >= 10 || selectedInterests.includes(searchTerm.trim())}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            )}
          </div>
          {searchTerm.trim() && !AVAILABLE_INTERESTS.includes(searchTerm.trim()) && selectedInterests.length < 10 && !selectedInterests.includes(searchTerm.trim()) && (
            <p className="text-xs text-purple-600">
              Press Enter or click "Add" to add "{searchTerm.trim()}" as a custom interest
            </p>
          )}
        </div>

        {/* Available Interests */}
        {filteredInterests.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Suggested Interests</h4>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {filteredInterests.map(interest => (
                <Badge
                  key={interest}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-50 hover:border-purple-300"
                  onClick={() => addInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedInterests.length >= 10 && (
          <p className="text-sm text-amber-600">
            You've reached the maximum of 10 interests. Remove some to add others.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default InterestsSelector;
