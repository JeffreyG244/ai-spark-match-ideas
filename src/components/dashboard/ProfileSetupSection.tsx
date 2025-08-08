import React from 'react';
import { Crown, Briefcase, TrendingUp, Palette, Dumbbell, Plane, Lightbulb, Heart, ArrowRight } from 'lucide-react';

interface ProfileSetupSectionProps {
  onStartProfileSetup: () => void;
}

const ProfileSetupSection = ({ onStartProfileSetup }: ProfileSetupSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-love-primary/10 to-love-secondary/10 backdrop-blur-xl border border-love-border rounded-3xl p-8 mb-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-love-primary to-love-secondary rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-love-text mb-4">
          Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-love-primary to-love-secondary">Executive Profile</span>
        </h2>
        
        <p className="text-love-text-light text-lg mb-8 max-w-2xl mx-auto">
          Set up your professional interests, personality traits, and preferences to find sophisticated matches who share your values and lifestyle.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Briefcase className="w-6 h-6" />, label: "Professional", color: "from-blue-500 to-purple-600" },
            { icon: <Crown className="w-6 h-6" />, label: "Luxury", color: "from-yellow-400 to-orange-500" },
            { icon: <TrendingUp className="w-6 h-6" />, label: "Investment", color: "from-green-500 to-emerald-600" },
            { icon: <Palette className="w-6 h-6" />, label: "Culture", color: "from-purple-500 to-pink-600" }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                {item.icon}
              </div>
              <span className="text-love-text-muted text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStartProfileSetup}
          className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center gap-2 mx-auto hover:transform hover:scale-105 shadow-lg"
        >
          Start Profile Setup
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <p className="text-love-text-muted mt-4 text-sm">
          Takes 5-10 minutes • Increases match quality by 300%
        </p>
      </div>
    </div>
  );
};

export default ProfileSetupSection;