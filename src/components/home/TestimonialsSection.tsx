
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    comment: "After years of endless swiping and superficial matches on other apps, Luvlang was a breath of fresh air. The AI matching actually works - I met my partner through deep compatibility, not just looks."
  },
  {
    name: "Michael Rodriguez",
    role: "Software Engineer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    comment: "Other dating apps felt like a game where no one was serious. Luvlang's verification process and focus on values meant I could trust that people were genuinely looking for meaningful relationships."
  },
  {
    name: "Emma Thompson",
    role: "Financial Analyst",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    comment: "I was so tired of small talk and ghosting on traditional apps. The MindMeld feature helped me connect with someone who actually shared my life goals before we even exchanged photos."
  },
  {
    name: "David Park",
    role: "Product Manager",
    image: "https://images.unsplash.com/photo-1507003211169-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    comment: "The security features gave me confidence that wasn't possible on other platforms. No fake profiles, no scammers - just real professionals looking for authentic connections."
  },
  {
    name: "Jessica Williams",
    role: "UX Designer",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    comment: "Finally, a dating platform that understands quality over quantity. Instead of hundreds of meaningless matches, I got 3 highly compatible connections that led to real relationships."
  },
  {
    name: "James Foster",
    role: "Consultant",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    comment: "Luvlang solved the biggest problem with modern dating - authenticity. The personality analysis meant I could skip the games and connect with someone who truly understood me."
  }
];

const TestimonialsSection = () => {
  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
        <p className="text-xl text-gray-600">Real professionals who found authentic love beyond the superficial swipe culture</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Quote className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700 italic leading-relaxed">
                  {testimonial.comment}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
