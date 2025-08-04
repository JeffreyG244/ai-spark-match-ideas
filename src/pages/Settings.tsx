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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile & Verification',
    icon: <User className="w-4 h-4" />,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <Bell className="w-4 h-4" />,
    badge: '3'
  },
  {
    id: 'matching',
    title: 'Matching & Discovery',
    icon: <Heart className="w-4 h-4" />,
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 'billing',
    title: 'Billing & Subscription',
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: 'legal',
    title: 'Legal & Compliance',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: 'support',
    title: 'Support & Help',
    icon: <HelpCircle className="w-4 h-4" />,
  }
];

const legalDocuments = [
  { title: 'Privacy Policy', path: '/legal/privacy', icon: Shield },
  { title: 'Terms of Service', path: '/legal/terms', icon: FileText },
  { title: 'Community Guidelines', path: '/legal/community', icon: User },
  { title: 'Safety Guidelines', path: '/legal/safety', icon: Shield },
  { title: 'Cookie Policy', path: '/legal/cookies', icon: Cookie },
  { title: 'GDPR Compliance', path: '/legal/gdpr', icon: Shield },
  { title: 'CCPA Compliance', path: '/legal/ccpa', icon: Scale },
  { title: 'Data Retention Policy', path: '/legal/data-retention', icon: Database },
  { title: 'Content Moderation', path: '/legal/moderation', icon: Eye },
  { title: 'Age Verification', path: '/legal/age-verification', icon: CheckCircle },
  { title: 'Identity Verification', path: '/legal/identity-verification', icon: UserCheck },
  { title: 'Photo Verification', path: '/legal/photo-verification', icon: Camera },
  { title: 'Message Monitoring', path: '/legal/message-monitoring', icon: MessageSquare },
  { title: 'Romance Scam Prevention', path: '/legal/scam-prevention', icon: AlertTriangle },
  { title: 'Blocking & Reporting', path: '/legal/reporting', icon: Flag },
  { title: 'Account Suspension', path: '/legal/suspension', icon: UserX },
  { title: 'Intellectual Property', path: '/legal/ip', icon: Copyright },
  { title: 'Refund Policy', path: '/legal/refunds', icon: RotateCcw },
  { title: 'Subscription Terms', path: '/legal/subscription', icon: Star },
  { title: 'Billing Policy', path: '/legal/billing', icon: CreditCard }
];

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('profile');

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
      ageRange: [28, 45],
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
        <p className="text-gray-400">Manage your profile information and visibility</p>
      </div>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Profile Visibility</CardTitle>
          <CardDescription className="text-gray-400">
            Control how your profile appears to other members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Profile Visibility</h4>
              <p className="text-sm text-gray-400">Show your profile to potential matches</p>
            </div>
            <Switch 
              checked={settings.privacy.profileVisibility}
              onCheckedChange={() => handleToggle('privacy', 'profileVisibility')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Online Status</h4>
              <p className="text-sm text-gray-400">Let others see when you're online</p>
            </div>
            <Switch 
              checked={settings.privacy.onlineStatus}
              onCheckedChange={() => handleToggle('privacy', 'onlineStatus')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Read Receipts</h4>
              <p className="text-sm text-gray-400">Show when you've read messages</p>
            </div>
            <Switch 
              checked={settings.privacy.readReceipts}
              onCheckedChange={() => handleToggle('privacy', 'readReceipts')}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Profile Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <User className="w-4 h-4 mr-3" />
            Edit Profile Details
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <Eye className="w-4 h-4 mr-3" />
            Update Photos
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/verification')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <UserCheck className="w-4 h-4 mr-3" />
            Identity Verification
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
        <p className="text-gray-400">Choose how you want to be notified</p>
      </div>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">New Messages</h4>
                <p className="text-sm text-gray-400">Get notified of new messages instantly</p>
              </div>
            </div>
            <Switch 
              checked={settings.notifications.messages}
              onCheckedChange={() => handleToggle('notifications', 'messages')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-pink-400" />
              <div>
                <h4 className="text-white font-medium">New Matches</h4>
                <p className="text-sm text-gray-400">Be alerted when you get a new match</p>
              </div>
            </div>
            <Switch 
              checked={settings.notifications.matches}
              onCheckedChange={() => handleToggle('notifications', 'matches')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-green-400" />
              <div>
                <h4 className="text-white font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-400">Receive notifications on your device</p>
              </div>
            </div>
            <Switch 
              checked={settings.notifications.pushNotifications}
              onCheckedChange={() => handleToggle('notifications', 'pushNotifications')}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Email Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-purple-400" />
              <div>
                <h4 className="text-white font-medium">Email Digest</h4>
                <p className="text-sm text-gray-400">Weekly summary of your activity</p>
              </div>
            </div>
            <Switch 
              checked={settings.notifications.emails}
              onCheckedChange={() => handleToggle('notifications', 'emails')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMatchingSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Matching Preferences</h2>
        <p className="text-gray-400">Customize your matching criteria</p>
      </div>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Match Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Executive Only Matches</h4>
              <p className="text-sm text-gray-400">Only match with verified executives</p>
            </div>
            <Switch 
              checked={settings.matching.executiveOnly}
              onCheckedChange={() => handleToggle('matching', 'executiveOnly')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Auto-Matching</h4>
              <p className="text-sm text-gray-400">Automatically find compatible matches</p>
            </div>
            <Switch 
              checked={settings.matching.autoMatch}
              onCheckedChange={() => handleToggle('matching', 'autoMatch')}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Long Distance</h4>
              <p className="text-sm text-gray-400">Include matches outside your area</p>
            </div>
            <Switch 
              checked={settings.matching.longDistance}
              onCheckedChange={() => handleToggle('matching', 'longDistance')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Security & Privacy</h2>
        <p className="text-gray-400">Manage your account security</p>
      </div>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Account Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth/reset-password')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <Lock className="w-4 h-4 mr-3" />
            Change Password
          </Button>
          <Button 
            variant="outline"
            onClick={() => toast({ title: "Coming Soon", description: "Two-factor authentication will be available soon." })}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <Shield className="w-4 h-4 mr-3" />
            Two-Factor Authentication
          </Button>
          <Button 
            variant="outline"
            onClick={() => toast({ title: "Security", description: "No suspicious login activity detected." })}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <CheckCircle className="w-4 h-4 mr-3" />
            Login Activity
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Privacy Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline"
            onClick={() => setActiveSection('legal')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <Eye className="w-4 h-4 mr-3" />
            Privacy Settings
          </Button>
          <Button 
            variant="outline"
            onClick={() => toast({ title: "Data Export", description: "Your data export will be ready within 24 hours." })}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <Globe className="w-4 h-4 mr-3" />
            Request Data Export
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
        <p className="text-gray-400">Manage your membership and billing</p>
      </div>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
            <Crown className="w-6 h-6 text-yellow-400" />
            <div>
              <h4 className="text-white font-medium">C-Suite Premium</h4>
              <p className="text-sm text-yellow-300">Active until March 15, 2025</p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/membership')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <CreditCard className="w-4 h-4 mr-3" />
            Update Payment Method
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/membership')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <SettingsIcon className="w-4 h-4 mr-3" />
            Manage Subscription
          </Button>
          <Button 
            variant="outline"
            onClick={() => setActiveSection('legal')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <FileText className="w-4 h-4 mr-3" />
            Billing Terms & Policies
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSupportSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Support & Account</h2>
        <p className="text-gray-400">Get help and manage your account</p>
      </div>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Support Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline"
            onClick={() => window.open('https://help.luvlang.com', '_blank')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <HelpCircle className="w-4 h-4 mr-3" />
            Help Center
            <ExternalLink className="w-3 h-3 ml-auto" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('mailto:support@luvlang.com', '_blank')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <Mail className="w-4 h-4 mr-3" />
            Contact Support
            <ExternalLink className="w-3 h-3 ml-auto" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => setActiveSection('legal')}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <FileText className="w-4 h-4 mr-3" />
            Terms & Policies
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-red-500/20">
        <CardHeader>
          <CardTitle className="text-white">Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start text-red-400 border-red-500/30 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-3" />
            Delete Account
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderLegalSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Legal & Compliance</h2>
        <p className="text-gray-400">Access legal documents, policies, and compliance information</p>
      </div>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Legal Documents</CardTitle>
          <CardDescription className="text-gray-400">
            Review our policies and legal agreements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {legalDocuments.map((doc, index) => {
              const IconComponent = doc.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => navigate(doc.path)}
                  className="h-auto p-4 justify-start text-white border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-400/50 transition-all"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{doc.title}</div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white">Compliance & Data Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <h4 className="text-white font-medium">GDPR Compliant</h4>
                <p className="text-sm text-gray-400">European data protection standards</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <h4 className="text-white font-medium">CCPA Compliant</h4>
                <p className="text-sm text-gray-400">California privacy rights protected</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-white font-medium">SOC 2 Type II</h4>
                <p className="text-sm text-gray-400">Enterprise security standards</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'matching':
        return renderMatchingSettings();
      case 'security':
        return renderSecuritySettings();
      case 'billing':
        return renderBillingSettings();
      case 'legal':
        return renderLegalSettings();
      case 'support':
        return renderSupportSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-purple-400 hover:text-purple-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6 bg-purple-500/20" />
              <Logo size="sm" className="text-white" />
              <Separator orientation="vertical" className="h-6 bg-purple-500/20" />
              <div>
                <h1 className="text-2xl font-bold text-white">Account Settings</h1>
                <p className="text-purple-300 text-sm">Manage your executive preferences and privacy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Legal Documents Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-white border-purple-500/30 hover:bg-purple-500/10">
                    <FileText className="w-4 h-4 mr-2" />
                    Legal & Policies
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-slate-900/95 backdrop-blur-xl border-purple-500/30 z-50">
                  <DropdownMenuLabel className="text-purple-300">Legal Documents</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-purple-500/20" />
                  {legalDocuments.slice(0, 10).map((doc, index) => {
                    const IconComponent = doc.icon;
                    return (
                      <DropdownMenuItem 
                        key={index}
                        onClick={() => navigate(doc.path)}
                        className="text-white hover:bg-purple-500/20 cursor-pointer"
                      >
                        <IconComponent className="w-4 h-4 mr-2 text-purple-400" />
                        {doc.title}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator className="bg-purple-500/20" />
                  <DropdownMenuItem 
                    onClick={() => navigate('/legal')}
                    className="text-purple-300 hover:bg-purple-500/20 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View All Legal Documents
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-xl px-3 py-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">C-Suite Premium</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20 sticky top-6">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? 'bg-purple-500/20 text-white border border-purple-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {section.icon}
                        <span className="text-sm font-medium">{section.title}</span>
                      </div>
                      {section.badge && (
                        <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {section.badge}
                        </div>
                      )}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;