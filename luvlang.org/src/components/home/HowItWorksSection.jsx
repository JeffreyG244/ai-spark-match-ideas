import React from 'react';
import { Star, Brain, MessageCircle } from "lucide-react";
const HowItWorksSection = () => {
    return (<div className="text-center mb-20">
      <h2 className="text-4xl font-bold text-gray-900 mb-12">How Luvlang Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-white"/>
          </div>
          <h3 className="text-xl font-semibold mb-2">1. Create Secure Profile</h3>
          <p className="text-gray-600">Use our secure profile builder with database protection and content validation</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-white"/>
          </div>
          <h3 className="text-xl font-semibold mb-2">2. AI Deep Matching</h3>
          <p className="text-gray-600">Our Luvlang AI analyzes personality, values, and life goals for profound compatibility</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-white"/>
          </div>
          <h3 className="text-xl font-semibold mb-2">3. Secure Connections</h3>
          <p className="text-gray-600">Connect through verified, secure messaging with privacy protection</p>
        </div>
      </div>
    </div>);
};
export default HowItWorksSection;
