
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/ui/logo";

const Navigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="flex justify-between items-center mb-16">
      <div className="flex items-center gap-3">
        <Logo size="md" />
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
