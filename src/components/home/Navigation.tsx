
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
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Luvlang</h1>
      </div>
      <div className="flex gap-3">
        {!user && (
          <>
            <Button onClick={() => navigate("/auth")} variant="outline">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-purple-600 hover:bg-purple-700">
              Get Started
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
