
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
          src="/lovable-uploads/c9f4488e-3013-4e94-8393-ad5ecf13d1a6.png" 
          alt="Luvlang Logo" 
          className="h-12 object-contain"
        />
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
