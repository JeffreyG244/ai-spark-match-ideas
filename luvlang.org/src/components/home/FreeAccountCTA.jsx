import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
const FreeAccountCTA = () => {
    const navigate = useNavigate();
    return (<div className="mb-20 bg-white rounded-2xl p-8 shadow-lg border border-purple-200">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-white"/>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Your Free Account Today</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of verified professionals who've discovered authentic love beyond superficial swiping. 
          Your perfect match is waiting - and it's completely free to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" onClick={() => navigate("/auth")} className="bg-purple-600 hover:bg-purple-700 px-8">
            Create Free Account
          </Button>
          <p className="text-sm text-gray-500">No credit card required • 2-minute setup</p>
        </div>
      </div>
    </div>);
};
export default FreeAccountCTA;
