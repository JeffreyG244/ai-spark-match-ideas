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
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
              <div>
                <h1 className="text-2xl font-bold text-white">Account Settings</h1>
                <p className="text-purple-300 text-sm">Manage your preferences and privacy</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-xl px-3 py-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">C-Suite Premium</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-purple-400" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your profile information and visibility
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

          {/* Notification Settings */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="w-5 h-5 text-purple-400" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose how you want to be notified
              </CardDescription>
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

          {/* Matching Preferences */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="w-5 h-5 text-purple-400" />
                Matching Preferences
              </CardTitle>
              <CardDescription className="text-gray-400">
                Customize your matching criteria
              </CardDescription>
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

          {/* Security & Privacy */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-purple-400" />
                Security & Privacy
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10">
                <Lock className="w-4 h-4 mr-3" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10">
                <Eye className="w-4 h-4 mr-3" />
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10">
                <CreditCard className="w-4 h-4 mr-3" />
                Billing & Subscription
              </Button>
            </CardContent>
          </Card>

          {/* Support & Account */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                Support & Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start text-white border-purple-500/30 hover:bg-purple-500/10">
                <HelpCircle className="w-4 h-4 mr-3" />
                Help & Support
              </Button>
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
      </main>
    </div>
  );
};

export default Settings;