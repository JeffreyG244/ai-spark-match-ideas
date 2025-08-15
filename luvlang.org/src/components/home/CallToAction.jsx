import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const CallToAction = ({ showButton }) => {
    const navigate = useNavigate();
    return (<div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
      <h2 className="text-3xl font-bold mb-4">Ready to Find Your Soul Match?</h2>
      <p className="text-xl mb-8 opacity-90">Join thousands of professionals who've found meaningful love through secure AI matching</p>
      {showButton && (<Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
          Start Matching Today
        </Button>)}
    </div>);
};
export default CallToAction;
