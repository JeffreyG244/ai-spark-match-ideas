import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Shield, 
  CreditCard, 
  Users, 
  Heart,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  Book
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: number;
}

export const HelpCenter = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of using LuvLang',
      icon: <Book className="w-5 h-5" />,
      articles: 8
    },
    {
      id: 'profile-matching',
      title: 'Profile & Matching',
      description: 'Optimize your profile and understand matching',
      icon: <Heart className="w-5 h-5" />,
      articles: 12
    },
    {
      id: 'messaging',
      title: 'Messages & Communication',
      description: 'How to connect and communicate safely',
      icon: <MessageCircle className="w-5 h-5" />,
      articles: 6
    },
    {
      id: 'billing',
      title: 'Billing & Subscriptions',
      description: 'Manage payments and membership plans',
      icon: <CreditCard className="w-5 h-5" />,
      articles: 10
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      description: 'Stay safe while dating online',
      icon: <Shield className="w-5 h-5" />,
      articles: 9
    },
    {
      id: 'technical',
      title: 'Technical Support',
      description: 'Troubleshoot technical issues',
      icon: <Globe className="w-5 h-5" />,
      articles: 7
    }
  ];

  const frequentlyAsked: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create an attractive profile?',
      answer: 'Upload high-quality photos that show your face clearly, write an authentic bio that reflects your personality, and be honest about your interests and what you\'re looking for.',
      category: 'profile-matching'
    },
    {
      id: '2',
      question: 'Why am I not getting matches?',
      answer: 'Try updating your photos, expanding your search criteria, being more active on the platform, and ensuring your profile is complete with verified information.',
      category: 'profile-matching'
    },
    {
      id: '3',
      question: 'How do I report someone?',
      answer: 'Go to their profile, click the three dots menu, and select "Report". You can report inappropriate behavior, fake profiles, or safety concerns.',
      category: 'safety'
    },
    {
      id: '4',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from Settings > Billing & Subscription. You\'ll retain access until the end of your billing period.',
      category: 'billing'
    },
    {
      id: '5',
      question: 'How does verification work?',
      answer: 'We offer photo, phone, and identity verification. Go to Settings > Profile & Identity > Identity Verification to start the process.',
      category: 'safety'
    },
    {
      id: '6',
      question: 'What makes LuvLang different?',
      answer: 'LuvLang focuses on professional singles, offers advanced AI matching, provides comprehensive verification, and maintains high safety standards.',
      category: 'getting-started'
    }
  ];

  const filteredFAQs = frequentlyAsked.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSupport = () => {
    window.open('mailto:support@luvlang.org?subject=Help Center - Support Request', '_blank');
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          Help Center
        </CardTitle>
        <CardDescription className="text-slate-300">
          Find answers to common questions and get help with LuvLang
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        {!searchQuery ? (
          <>
            {/* Help Categories */}
            <div>
              <h3 className="text-white font-medium mb-4">Browse by Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {helpCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700/70 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-purple-400 group-hover:scale-110 transition-transform">
                          {category.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{category.title}</h4>
                          <p className="text-slate-300 text-sm">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm">{category.articles} articles</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div>
              <h3 className="text-white font-medium mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {frequentlyAsked.slice(0, 4).map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
                  >
                    <h4 className="text-white font-medium mb-2 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </h4>
                    <p className="text-slate-300 text-sm pl-6">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Search Results */
          <div>
            <h3 className="text-white font-medium mb-4">
              Search Results ({filteredFAQs.length} found)
            </h3>
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <div className="text-slate-300">No results found for "{searchQuery}"</div>
                <p className="text-slate-400 text-sm mt-2">Try different keywords or contact support</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
                  >
                    <h4 className="text-white font-medium mb-2 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </h4>
                    <p className="text-slate-300 text-sm pl-6">{faq.answer}</p>
                    <div className="mt-2 pl-6">
                      <span className="text-slate-400 text-xs bg-slate-600/50 px-2 py-1 rounded-full">
                        {helpCategories.find(cat => cat.id === faq.category)?.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Options */}
        <div className="border-t border-slate-600/50 pt-6">
          <h3 className="text-white font-medium mb-4">Still Need Help?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={handleContactSupport}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({ 
                title: "Phone Support", 
                description: "Phone support available Monday-Friday 9AM-6PM EST" 
              })}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Phone Support
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h5 className="text-blue-400 font-medium mb-3">Quick Links</h5>
          <div className="space-y-2 text-sm">
            <button 
              onClick={() => window.location.href = '/legal'}
              className="text-blue-300 hover:text-blue-200 block transition-colors"
            >
              • Terms of Service & Privacy Policy
            </button>
            <button 
              onClick={() => window.location.href = '/safety'}
              className="text-blue-300 hover:text-blue-200 block transition-colors"
            >
              • Safety Guidelines & Community Standards
            </button>
            <button 
              onClick={() => window.location.href = '/verification'}
              className="text-blue-300 hover:text-blue-200 block transition-colors"
            >
              • Account Verification Process
            </button>
            <button 
              onClick={() => window.location.href = '/membership'}
              className="text-blue-300 hover:text-blue-200 block transition-colors"
            >
              • Membership Plans & Pricing
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HelpCenter;