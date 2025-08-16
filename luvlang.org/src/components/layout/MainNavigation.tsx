import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, FileText, Shield, Users, Heart, Briefcase } from 'lucide-react';
import Logo from '@/components/ui/logo';

const MainNavigation = () => {
  const location = useLocation();

  const legalPages = [
    { label: 'Privacy Policy', path: '/legal/privacy-policy' },
    { label: 'Terms of Service', path: '/legal/terms-of-service' },
    { label: 'Community Guidelines', path: '/legal/community-guidelines' },
    { label: 'Safety Guidelines', path: '/legal/safety-guidelines' },
    { label: 'Cookie Policy', path: '/legal/cookie-policy' },
    { label: 'GDPR', path: '/legal/gdpr' },
    { label: 'CCPA', path: '/legal/ccpa' },
    { label: 'Data Retention', path: '/legal/data-retention' },
    { label: 'Intellectual Property', path: '/legal/intellectual-property' },
    { label: 'Content Moderation', path: '/legal/content-moderation-policy' },
    { label: 'Age Verification', path: '/legal/age-verification-policy' },
    { label: 'Identity Verification', path: '/legal/identity-verification-policy' },
    { label: 'Photo Verification', path: '/legal/photo-verification' },
    { label: 'Blocking & Reporting', path: '/legal/blocking-reporting-policy' },
    { label: 'Message Monitoring', path: '/legal/message-monitoring' },
    { label: 'Romance Scam Prevention', path: '/legal/romance-scam-prevention' },
    { label: 'Account Suspension', path: '/legal/account-suspension' },
  ];

  const companyPages = [
    { label: 'How It Works', path: '/how-it-works', icon: Heart },
    { label: 'Success Stories', path: '/success-stories', icon: Users },
    { label: 'Safety', path: '/safety', icon: Shield },
    { label: 'Executive Features', path: '/executive-luvlang', icon: Briefcase },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>
          
          <div className="flex items-center space-x-6">
            {/* Company Pages Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Company
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm border border-border/50">
                <DropdownMenuLabel>About Luvlang</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {companyPages.map((page) => (
                  <DropdownMenuItem key={page.path} asChild>
                    <Link to={page.path} className="flex items-center gap-2 w-full">
                      <page.icon className="h-4 w-4" />
                      {page.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Legal Pages Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Legal & Safety
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto bg-background/95 backdrop-blur-sm border border-border/50">
                <DropdownMenuLabel>Legal Documentation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/legal" className="flex items-center gap-2 w-full font-medium">
                    <FileText className="h-4 w-4" />
                    Legal Overview
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {legalPages.map((page) => (
                  <DropdownMenuItem key={page.path} asChild>
                    <Link to={page.path} className="w-full">
                      {page.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/dashboard">
              <Button variant="outline">
                Dashboard
              </Button>
            </Link>

            <Link to="/membership">
              <Button className="bg-gradient-to-r from-love-primary to-love-secondary hover:from-love-primary/90 hover:to-love-secondary/90 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;