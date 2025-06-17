
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  showButtons: boolean;
}

const HeroSection = ({ showButtons }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-20">
      <h1 className="text-6xl font-bold text-gray-900 mb-6">
        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Soul Match</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        AI-powered deep connections for serious professionals. No swiping, no games - just authentic, meaningful relationships built on compatibility.
      </p>
      <div className="flex gap-4 justify-center">
        {showButtons && (
          <>
            <Button size="lg" onClick={() => navigate("/auth")} className="bg-purple-600 hover:bg-purple-700">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/how-it-works")}>
              How It Works
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
