import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Shield, Target, MessageCircle } from "lucide-react";
const features = [
    {
        icon: Brain,
        title: "Luvlang AI Matching",
        description: "Deep personality and values alignment using advanced AI psychology models"
    },
    {
        icon: Shield,
        title: "AuthentiDate Security",
        description: "Mandatory verification and AI-powered safety scanning for authentic connections"
    },
    {
        icon: Target,
        title: "LifeStage Alignment",
        description: "Match with people who share your timeline and life goals"
    },
    {
        icon: MessageCircle,
        title: "MindMeld First",
        description: "Text-based connections before photos - meaningful conversations first"
    }
];
const FeaturesSection = () => {
    return (<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
      {features.map((feature, index) => (<Card key={index} className="hover:shadow-lg transition-shadow border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-purple-600"/>
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </div>
            <CardDescription className="text-base">
              {feature.description}
            </CardDescription>
          </CardHeader>
        </Card>))}
    </div>);
};
export default FeaturesSection;
