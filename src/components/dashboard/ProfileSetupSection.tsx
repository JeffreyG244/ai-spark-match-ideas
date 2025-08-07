import React, { useState, useEffect } from 'react';
import { Crown, Briefcase, TrendingUp, Palette, Dumbbell, Plane, Lightbulb, Heart, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://tzskjzkolyiwhijslqmq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6c2tqemtvbHlpd2hpanNscW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTY3ODAsImV4cCI6MjA2NDIzMjc4MH0.EvlZrWKZVsUks6VArpizk98kmOc8nVS7vvjUbd4ThMw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ProfileSetupSectionProps {
  onStartProfileSetup: () => void;
}

const ProfileSetupSection = ({ onStartProfileSetup }: ProfileSetupSectionProps) => {
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [interestCategories, setInterestCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const minInterests = 8;
  const maxInterests = 15;

  // Icon mapping for categories
  const iconMap: { [key: string]: JSX.Element } = {
    'Briefcase': <Briefcase className="w-6 h-6" />,
    'Crown': <Crown className="w-6 h-6" />,
    'TrendingUp': <TrendingUp className="w-6 h-6" />,
    'Palette': <Palette className="w-6 h-6" />,
    'Dumbbell': <Dumbbell className="w-6 h-6" />,
    'Plane': <Plane className="w-6 h-6" />,
    'Lightbulb': <Lightbulb className="w-6 h-6" />,
    'Heart': <Heart className="w-6 h-6" />
  };

  // Load interests and user's existing selections
  useEffect(() => {
    loadInterests();
    loadUserInterests();
  }, []);

  const loadInterests = async () => {
    try {
      // Get categories with their interests
      const { data: categories, error: catError } = await supabase
        .from('interest_categories')
        .select('*')
        .order('id');

      if (catError) throw catError;

      const { data: interests, error: intError } = await supabase
        .from('interests')
        .select('*')
        .order('category_id, id');

      if (intError) throw intError;

      // Group interests by category
      const categoriesWithInterests = categories.map(category => ({
        ...category,
        icon: iconMap[category.icon] || <Briefcase className="w-6 h-6" />,
        interests: interests.filter(interest => interest.category_id === category.id)
      }));

      setInterestCategories(categoriesWithInterests);
    } catch (error) {
      console.error('Error loading interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInterests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userInterests, error } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setSelectedInterestIds(userInterests.map(ui => ui.interest_id));
    } catch (error) {
      console.error('Error loading user interests:', error);
    }
  };

  const toggleInterest = (interestId: number) => {
    if (selectedInterestIds.includes(interestId)) {
      setSelectedInterestIds(selectedInterestIds.filter(id => id !== interestId));
    } else if (selectedInterestIds.length < maxInterests) {
      setSelectedInterestIds([...selectedInterestIds, interestId]);
    }
  };

  const saveInterests = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Delete existing user interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      // Insert new interests
      const userInterestsToInsert = selectedInterestIds.map(interestId => ({
        user_id: user.id,
        interest_id: interestId
      }));

      const { error } = await supabase
        .from('user_interests')
        .insert(userInterestsToInsert);

      if (error) throw error;

      // Call the completion callback
      if (onStartProfileSetup) {
        onStartProfileSetup();
      }

    } catch (error) {
      console.error('Error saving interests:', error);
      alert('Failed to save interests. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isSelected = (interestId: number) => selectedInterestIds.includes(interestId);
  const canContinue = selectedInterestIds.length >= minInterests;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-love-primary/20 via-love-secondary/20 to-love-accent/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-love-primary animate-spin mx-auto mb-4" />
          <p className="text-love-text text-lg">Loading interests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-primary/10 via-love-secondary/10 to-love-accent/10">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-love-text mb-4">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-love-primary to-love-secondary">Professional Interests</span>
          </h1>
          <p className="text-xl text-love-text-light mb-8">
            Select interests that define you as a sophisticated professional
          </p>
          
          {/* Selection Counter */}
          <div className="bg-gradient-to-r from-love-primary/20 to-love-secondary/20 backdrop-blur-xl border border-love-primary/30 rounded-2xl p-6 max-w-md mx-auto">
            <div className="text-2xl font-bold text-love-text mb-2">
              {selectedInterestIds.length} / {maxInterests} Selected
            </div>
            <div className="text-love-text-muted">
              Minimum {minInterests} required • Premium interests marked with <Crown className="w-4 h-4 inline text-love-accent" />
            </div>
            <div className="w-full bg-love-border rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-love-primary to-love-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((selectedInterestIds.length / maxInterests) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Interest Categories */}
        <div className="space-y-12">
          {interestCategories.map((category) => (
            <div key={category.id} className="bg-love-card/50 backdrop-blur-xl border border-love-border rounded-3xl p-8">
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color_gradient} flex items-center justify-center shadow-lg`}>
                  {category.icon}
                </div>
                <h2 className="text-2xl font-bold text-love-text">{category.name}</h2>
              </div>

              {/* Interest Tags */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.interests.map((interest: any) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    disabled={!isSelected(interest.id) && selectedInterestIds.length >= maxInterests}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                      ${isSelected(interest.id)
                        ? `bg-gradient-to-r ${category.color_gradient} border-transparent text-white shadow-lg transform scale-105`
                        : 'bg-love-card border-love-border text-love-text-muted hover:border-love-primary/50 hover:bg-love-card/80'
                      }
                      ${(!isSelected(interest.id) && selectedInterestIds.length >= maxInterests) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer hover:transform hover:scale-105'
                      }
                    `}
                  >
                    {interest.is_premium && (
                      <Crown className="w-4 h-4 text-love-accent absolute top-2 right-2" />
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{interest.name}</span>
                      {isSelected(interest.id) && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    {interest.is_premium && (
                      <div className="text-xs opacity-80 mt-1">Elite Lifestyle</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center mt-12">
          <button
            onClick={saveInterests}
            disabled={!canContinue || saving}
            className={`
              px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center gap-2 mx-auto
              ${canContinue && !saving
                ? 'bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white shadow-lg hover:transform hover:scale-105'
                : 'bg-love-border text-love-text-muted cursor-not-allowed'
              }
            `}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Interests...
              </>
            ) : canContinue ? (
              `Continue with ${selectedInterestIds.length} Interests →`
            ) : (
              `Select ${minInterests - selectedInterestIds.length} More Interests`
            )}
          </button>
          
          <p className="text-love-text-muted mt-4 text-sm">
            Next: Our AI will analyze your interests for sophisticated compatibility matching
          </p>
        </div>

        {/* Selected Interests Preview */}
        {selectedInterestIds.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-love-primary/10 to-love-secondary/10 backdrop-blur-xl border border-love-border rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-love-text mb-4">Your Selected Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interestCategories.flatMap(cat => cat.interests)
                .filter(interest => selectedInterestIds.includes(interest.id))
                .map((interest: any) => (
                <span key={interest.id} className="bg-gradient-to-r from-love-primary to-love-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                  {interest.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetupSection;