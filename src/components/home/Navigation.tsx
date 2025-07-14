
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="flex justify-between items-center mb-16">
      <div className="flex items-center gap-3">
        <img 
          src="/lovable-uploads/94fd3267-c16b-4e6f-95bf-6043d9f798d2.png" 
          alt="Luvlang Logo" 
          className="w-10 h-10 rounded-xl object-contain"
        />
        <h1 className="text-2xl font-bold text-love-text">Luvlang</h1>
      </div>
      <div className="flex gap-3">
        {!user && (
          <>
            <Button onClick={() => navigate("/auth")} variant="outline">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white">
              Get Started
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
