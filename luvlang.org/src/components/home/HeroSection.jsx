import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const HeroSection = ({ showButtons }) => {
    const navigate = useNavigate();
    return (<div className="text-center mb-20">
      <h1 className="text-6xl font-bold text-love-text mb-6">
        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-love-primary to-love-secondary">Soul Match</span>
      </h1>
      <p className="text-xl text-love-text-light mb-8 max-w-3xl mx-auto">
        AI-powered deep connections for serious professionals. No swiping, no games - just authentic, meaningful relationships built on compatibility.
      </p>
      <div className="flex gap-4 justify-center">
        {showButtons && (<>
            <Button size="lg" onClick={() => navigate("/auth")} className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white shadow-lg">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/how-it-works")}>
              How It Works
            </Button>
          </>)}
      </div>
    </div>);
};
export default HeroSection;
