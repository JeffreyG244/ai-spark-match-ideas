import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Heart, 
  Eye,
  Smartphone,
  Mail,
  Lock,
  CreditCard,
  HelpCircle,
  Trash2,
  LogOut,
  Crown,
  Globe,
  Settings as SettingsIcon,
  CheckCircle,
  AlertTriangle,
  FileText,
  Scale,
  UserCheck,
  Database,
  Camera,
  MessageSquare,
  UserX,
  Copyright,
  RotateCcw,
  Star,
  Cookie,
  Flag,
  ChevronDown,
  ExternalLink,
  Search,
  Zap,
  Palette,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  type: 'button' | 'switch' | 'navigation';
  value?: boolean;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('profile');

  const [settings, setSettings] = useState({
    notifications: {
      messages: true,
      matches: true,
      meetings: true,
      emails: false,
      pushNotifications: true,
      smsAlerts: false
    },
    privacy: {
      profileVisibility: true,
      onlineStatus: true,
      readReceipts: true,
      locationSharing: false
    },
    matching: {
      autoMatch: true,
      longDistance: false,
      executiveOnly: true
    }
  });

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: !prev[category as keyof typeof prev][setting as keyof any]
      }
    }));
    
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved.",
      duration: 2000
    });
  };

  const settingsCategories: SettingsCategory[] = [
    {
      id: 'profile',
      title: 'Profile & Identity',
      description: 'Manage your executive profile and verification',
      icon: <User className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile Details',
          description: 'Update your basic information and bio',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="4" height="4"/><rect x="4" y="12" width="4" height="4"/><rect x="12" y="4" width="8" height="2"/><rect x="12" y="6" width="6" height="2"/><rect x="12" y="12" width="8" height="2"/><rect x="12" y="14" width="6" height="2"/><rect x="16" y="18" width="4" height="2"/></svg>,
          action: () => navigate('/executive-profile'),
          type: 'navigation'
        },
        {
          id: 'update-photos',
          title: 'Manage Photos',
          description: 'Add, edit, or reorder your profile photos',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="6" y="8" width="4" height="4"/><rect x="14" y="8" width="4" height="4"/><circle cx="8" cy="10" r="1"/><circle cx="16" cy="10" r="1"/><rect x="10" y="14" width="4" height="2"/></svg>,
          action: () => navigate('/executive-profile'),
          type: 'navigation'
        },
        {
          id: 'verification',
          title: 'Identity Verification',
          description: 'Verify your identity and professional status',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="6" y="2" width="12" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="8" y="10" width="2" height="2"/><rect x="11" y="10" width="2" height="2"/><rect x="14" y="10" width="2" height="2"/><rect x="8" y="13" width="2" height="2"/><rect x="11" y="13" width="2" height="2"/><rect x="14" y="13" width="2" height="2"/></svg>,
          action: () => navigate('/verification'),
          type: 'navigation'
        },
        {
          id: 'profile-visibility',
          title: 'Profile Visibility',
          description: 'Control who can see your profile',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="11" y="11" width="2" height="2"/><rect x="4" y="11" width="2" height="2"/><rect x="18" y="11" width="2" height="2"/><rect x="11" y="4" width="2" height="2"/><rect x="11" y="18" width="2" height="2"/></svg>,
          action: () => handleToggle('privacy', 'profileVisibility'),
          type: 'switch',
          value: settings.privacy.profileVisibility
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications & Alerts',
      description: 'Customize your notification preferences',
      icon: <Bell className="w-5 h-5" />,
      color: 'from-amber-500 to-yellow-500',
      badge: '3',
      items: [
        {
          id: 'message-notifications',
          title: 'Message Notifications',
          description: 'Get alerted when you receive new messages',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="8" y="10" width="2" height="2"/><rect x="11" y="10" width="2" height="2"/><rect x="14" y="10" width="2" height="2"/></svg>,
          action: () => handleToggle('notifications', 'messages'),
          type: 'switch',
          value: settings.notifications.messages
        },
        {
          id: 'match-notifications',
          title: 'New Match Alerts',
          description: 'Be notified of new potential matches',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/><rect x="10" y="8" width="2" height="2"/><rect x="12" y="8" width="2" height="2"/><rect x="11" y="10" width="2" height="2"/></svg>,
          action: () => handleToggle('notifications', 'matches'),
          type: 'switch',
          value: settings.notifications.matches
        },
        {
          id: 'push-notifications',
          title: 'Push Notifications',
          description: 'Receive notifications on your device',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="7" y="4" width="10" height="12"/><rect x="9" y="6" width="2" height="2"/><rect x="13" y="6" width="2" height="2"/><rect x="9" y="9" width="6" height="2"/><rect x="9" y="12" width="4" height="2"/><circle cx="12" cy="18" r="1"/></svg>,
          action: () => handleToggle('notifications', 'pushNotifications'),
          type: 'switch',
          value: settings.notifications.pushNotifications
        },
        {
          id: 'email-digest',
          title: 'Email Digest',
          description: 'Weekly summary of your activity',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M2 6l10 8 10-8" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="6" y="9" width="4" height="2"/><rect x="6" y="12" width="6" height="2"/><rect x="6" y="15" width="8" height="2"/><rect x="16" y="9" width="2" height="2"/><rect x="16" y="12" width="2" height="2"/></svg>,
          action: () => handleToggle('notifications', 'emails'),
          type: 'switch',
          value: settings.notifications.emails
        }
      ]
    },
    {
      id: 'matching',
      title: 'Discovery & Matching',
      description: 'Fine-tune your matching preferences',
      icon: <Heart className="w-5 h-5" />,
      color: 'from-pink-500 to-purple-500',
      items: [
        {
          id: 'executive-only',
          title: 'Executive Only Matches',
          description: 'Only match with verified executives',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><rect x="10" y="6" width="4" height="2"/><rect x="9" y="9" width="6" height="2"/><rect x="10" y="12" width="4" height="2"/></svg>,
          action: () => handleToggle('matching', 'executiveOnly'),
          type: 'switch',
          value: settings.matching.executiveOnly
        },
        {
          id: 'auto-matching',
          title: 'Auto-Matching',
          description: 'Automatically find compatible matches',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="10" width="3" height="4"/><rect x="7" y="8" width="3" height="8"/><rect x="11" y="6" width="3" height="12"/><rect x="15" y="9" width="3" height="6"/><rect x="19" y="11" width="2" height="2"/><circle cx="4.5" cy="12" r="1"/><circle cx="8.5" cy="12" r="1"/><circle cx="12.5" cy="12" r="1"/><circle cx="16.5" cy="12" r="1"/></svg>,
          action: () => handleToggle('matching', 'autoMatch'),
          type: 'switch',
          value: settings.matching.autoMatch
        },
        {
          id: 'long-distance',
          title: 'Long Distance Matches',
          description: 'Include matches outside your area',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="8" y="4" width="8" height="4" rx="1"/><rect x="6" y="10" width="12" height="2"/><rect x="4" y="16" width="16" height="2"/><rect x="10" y="6" width="4" height="2"/><circle cx="12" cy="12" r="2"/></svg>,
          action: () => handleToggle('matching', 'longDistance'),
          type: 'switch',
          value: settings.matching.longDistance
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Protect your account and data',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500',
      items: [
        {
          id: 'change-password',
          title: 'Change Password',
          description: 'Update your account password',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="10" width="12" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="10" y="14" width="4" height="2"/><rect x="11" y="16" width="2" height="2"/><circle cx="12" cy="15" r="1"/></svg>,
          action: () => navigate('/auth/reset-password'),
          type: 'navigation'
        },
        {
          id: 'two-factor',
          title: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="6" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="9" y="2" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="8" y="10" width="2" height="2"/><rect x="11" y="10" width="2" height="2"/><rect x="14" y="10" width="2" height="2"/><rect x="8" y="13" width="2" height="2"/><rect x="11" y="13" width="2" height="2"/><rect x="14" y="13" width="2" height="2"/><rect x="11" y="16" width="2" height="2"/></svg>,
          action: () => toast({ title: "Coming Soon", description: "Two-factor authentication will be available soon." }),
          type: 'button'
        },
        {
          id: 'login-activity',
          title: 'Login Activity',
          description: 'View your recent login history',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="6" y="7" width="12" height="2"/><rect x="6" y="10" width="8" height="2"/><rect x="6" y="13" width="10" height="2"/><rect x="6" y="16" width="6" height="2"/><circle cx="18" cy="8" r="2" fill="currentColor"/></svg>,
          action: () => toast({ title: "Security", description: "No suspicious login activity detected." }),
          type: 'button'
        },
        {
          id: 'data-export',
          title: 'Export My Data',
          description: 'Download a copy of your data',
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="7" y="7" width="10" height="2"/><rect x="7" y="10" width="8" height="2"/><rect x="7" y="13" width="6" height="2"/><rect x="7" y="16" width="4" height="2"/><path d="M12 2v6m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" fill="none"/></svg>,
          action: () => toast({ title: "Data Export", description: "Your data export will be ready within 24 hours." }),
          type: 'button'
        }
      ]
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      description: 'Manage your membership and payments',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'from-violet-500 to-purple-500',
      items: [
        {
          id: 'payment-method',
          title: 'Payment Method',
          description: 'Update your billing information',
          icon: <CreditCard className="w-4 h-4" />,
          action: () => navigate('/membership'),
          type: 'navigation'
        },
        {
          id: 'subscription',
          title: 'Manage Subscription',
          description: 'Change or cancel your plan',
          icon: <SettingsIcon className="w-4 h-4" />,
          action: () => navigate('/membership'),
          type: 'navigation'
        },
        {
          id: 'billing-history',
          title: 'Billing History',
          description: 'View your payment history',
          icon: <FileText className="w-4 h-4" />,
          action: () => navigate('/membership'),
          type: 'navigation'
        }
      ]
    },
    {
      id: 'support',
      title: 'Help & Support',
      description: 'Get assistance and manage your account',
      icon: <HelpCircle className="w-5 h-5" />,
      color: 'from-indigo-500 to-blue-500',
      items: [
        {
          id: 'help-center',
          title: 'Help Center',
          description: 'Browse our knowledge base',
          icon: <HelpCircle className="w-4 h-4" />,
          action: () => window.open('https://help.luvlang.com', '_blank'),
          type: 'navigation'
        },
        {
          id: 'contact-support',
          title: 'Contact Support',
          description: 'Get personalized help',
          icon: <Mail className="w-4 h-4" />,
          action: () => window.open('mailto:support@luvlang.com', '_blank'),
          type: 'navigation'
        },
        {
          id: 'legal-docs',
          title: 'Legal Documents',
          description: 'Review terms and policies',
          icon: <FileText className="w-4 h-4" />,
          action: () => navigate('/legal'),
          type: 'navigation'
        },
        {
          id: 'delete-account',
          title: 'Delete Account',
          description: 'Permanently delete your account',
          icon: <Trash2 className="w-4 h-4" />,
          action: () => toast({ title: "Account Deletion", description: "Please contact support to delete your account." }),
          type: 'button'
        }
      ]
    }
  ];

  const filteredCategories = settingsCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.items.some(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const activeSettings = settingsCategories.find(cat => cat.id === activeCategory);

  const renderSettingItem = (item: SettingItem) => {
    return (
      <Card 
        key={item.id} 
        className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50 hover:border-pink-300/70 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-purple-400/30 hover:scale-[1.02] hover:-translate-y-1 shadow-lg" 
        onClick={item.action}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-r from-white/30 to-purple-200/40 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg backdrop-blur-sm">
                <div className="text-white group-hover:text-purple-100 transition-colors">
                  {item.icon}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white group-hover:text-purple-100 transition-colors text-base">{item.title}</h4>
                <p className="text-white/90 group-hover:text-white mt-1 transition-colors font-medium">{item.description}</p>
              </div>
            </div>
            {item.type === 'switch' && (
              <Switch 
                checked={item.value || false}
                onCheckedChange={(checked) => item.action()}
                className="ml-4 data-[state=checked]:bg-purple-500"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {item.type === 'navigation' && (
              <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors ml-4 group-hover:scale-110" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800">
      {/* Modern Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6 bg-purple-500/20" />
              <Logo size="sm" />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-400 focus:bg-slate-700/70"
                />
              </div>
              
              {/* Premium Badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-xl border border-yellow-500/40 rounded-xl px-4 py-2"  >
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium hidden sm:inline">C-Suite Premium</span>
              </div>
              
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden text-white hover:bg-purple-500/10"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className={`lg:col-span-3 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30 sticky top-24 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2 font-bold">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <nav className="space-y-2">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-500 hover:scale-[1.02] hover:shadow-lg ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-xl shadow-purple-500/25 scale-[1.02]'
                          : 'bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 hover:text-white border border-slate-600/50 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="relative z-10 flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          activeCategory === category.id
                            ? 'bg-white/20 shadow-lg'
                            : 'bg-gradient-to-r ' + category.color + ' opacity-90 group-hover:opacity-100 group-hover:scale-110'
                        }`}>
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-white">{category.title}</h3>
                            {category.badge && (
                              <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {category.badge}
                              </div>
                            )}
                          </div>
                          <p className="text-xs opacity-90 mt-1 text-white/80 font-medium">{category.description}</p>
                        </div>
                      </div>
                      {activeCategory === category.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-30 animate-pulse" />
                      )}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {activeSettings && (
              <div className="space-y-6">
                {/* Category Header */}
                <div className="text-center">
                  <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${activeSettings.color} text-white mb-4`}>
                    {activeSettings.icon}
                    <h2 className="text-2xl font-bold text-white">{activeSettings.title}</h2>
                  </div>
                  <p className="text-white font-medium text-lg max-w-2xl mx-auto">{activeSettings.description}</p>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeSettings.items.map(renderSettingItem)}
                </div>

                {/* Additional Actions */}
                <Card className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 backdrop-blur-xl border-purple-500/30 mt-8 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <h3 className="text-white font-bold">Executive Concierge Support</h3>
                        <p className="text-white/90 text-sm mt-1 font-medium">White-glove assistance for our C-Suite members</p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => window.open('mailto:concierge@luvlang.com', '_blank')}
                          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300 hover:scale-105"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Concierge
                        </Button>
                        <Button 
                          onClick={signOut}
                          variant="outline"
                          className="border-red-500/50 text-red-300 hover:bg-red-500/20 hover:border-red-400 transition-all duration-300 hover:scale-105"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;