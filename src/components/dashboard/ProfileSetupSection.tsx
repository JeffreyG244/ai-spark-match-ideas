import React from 'react';
import { Crown, Briefcase, TrendingUp, Palette, Dumbbell, Plane, Lightbulb, ArrowRight } from 'lucide-react';
import logoImage from '@/assets/luvlang-heart-logo.png';

interface ProfileSetupSectionProps {
  onStartProfileSetup: () => void;
}

const ProfileSetupSection = ({ onStartProfileSetup }: ProfileSetupSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-love-primary/10 to-love-secondary/10 backdrop-blur-xl border border-love-border rounded-3xl p-12 mb-8">
      <div className="text-center">
        <div className="w-48 h-48 bg-gradient-to-r from-love-primary/20 to-love-secondary/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-love-primary/30 shadow-2xl">
          <img 
            src={logoImage}
            alt="Luvlang Logo"
            className="w-40 h-40 object-contain"
          />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-love-text mb-6 leading-tight">
          Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-love-primary to-love-secondary">Executive Profile</span>
        </h2>
        
        <p className="text-love-text-light text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
          Set up your professional interests, personality traits, and preferences to find sophisticated matches who share your values and lifestyle.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { icon: <Briefcase className="w-7 h-7" />, label: "Professional", color: "from-blue-500 to-purple-600" },
            { icon: <Crown className="w-7 h-7" />, label: "Luxury", color: "from-yellow-400 to-orange-500" },
            { icon: <TrendingUp className="w-7 h-7" />, label: "Investment", color: "from-green-500 to-emerald-600" },
            { icon: <Palette className="w-7 h-7" />, label: "Culture", color: "from-purple-500 to-pink-600" }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                {item.icon}
              </div>
              <span className="text-love-text-muted text-base font-semibold">{item.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStartProfileSetup}
          className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white px-12 py-5 rounded-full text-xl font-bold transition-all duration-300 flex items-center gap-3 mx-auto hover:transform hover:scale-105 shadow-xl"
        >
          Start Profile Setup
          <ArrowRight className="w-6 h-6" />
        </button>
        
        <p className="text-love-text-muted mt-6 text-base font-medium">
          Takes 5-10 minutes • Increases match quality by 300%
        </p>
      </div>
    </div>
  );
};

export default ProfileSetupSection;