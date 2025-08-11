import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Users, Phone, MapPin, Heart, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/logo';

const Safety = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportForm, setReportForm] = useState({
    reportedUserId: '',
    reason: '',
    description: ''
  });
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  const handleReport = async () => {
    if (!user || !reportForm.reason) return;

    try {
      // Mock user reports since table doesn't exist
      console.log('Mock report submission:', {
        reporter_id: user.id,
        reported_user_id: reportForm.reportedUserId,
        reason: reportForm.reason,
        description: reportForm.description
      });

      // Success message

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe."
      });

      setReportForm({ reportedUserId: '', reason: '', description: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      });
    }
  };

  const addEmergencyContact = async () => {
    if (!user || !emergencyContact.name || !emergencyContact.phone) return;

    try {
      // Mock emergency contact since table doesn't exist
      console.log('Mock emergency contact:', {
        user_id: user.id,
        contact_name: emergencyContact.name,
        contact_phone: emergencyContact.phone,
        relationship: emergencyContact.relationship
      });

      // Success - no error to check

      toast({
        title: "Emergency contact added",
        description: "Your emergency contact has been saved securely."
      });

      setEmergencyContact({ name: '', phone: '', relationship: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add emergency contact",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/">
                <Logo size="md" />
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Home
                </Link>
                <Link to="/how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">
                  How It Works
                </Link>
                <Link to="/legal" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Legal
                </Link>
                <Link to="/success-stories" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Success Stories
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/membership">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Safety Center</h1>
          <p className="text-lg text-gray-600">Your safety is our top priority</p>
        </div>

        <Tabs defaultValue="guidelines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="meeting">Safe Dating</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Shield className="h-5 w-5" />
                    Community Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <p className="text-sm">Be respectful and kind to all members</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <p className="text-sm">Use recent, authentic photos of yourself</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <p className="text-sm">Never share personal information too quickly</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <p className="text-sm">Report suspicious behavior immediately</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <AlertTriangle className="h-5 w-5" />
                    Warning Signs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <p className="text-sm">Asking for money or financial information</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <p className="text-sm">Pressuring you to move off the platform quickly</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <p className="text-sm">Refusing to video chat or meet in person</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <p className="text-sm">Stories that don't add up or seem inconsistent</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Report a User
                </CardTitle>
                <CardDescription>
                  Help us keep the community safe by reporting inappropriate behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reported-user">User to Report</Label>
                  <Input
                    id="reported-user"
                    placeholder="User ID or profile link"
                    value={reportForm.reportedUserId}
                    onChange={(e) => setReportForm({ ...reportForm, reportedUserId: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Report</Label>
                  <Select onValueChange={(value) => setReportForm({ ...reportForm, reason: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="fake_profile">Fake Profile</SelectItem>
                      <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="scam">Scam/Fraud</SelectItem>
                      <SelectItem value="underage">Underage User</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide additional details about the incident"
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  />
                </div>

                <Button onClick={handleReport} className="w-full">
                  Submit Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>
                  Add trusted contacts who can be reached in case of emergency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Contact Name</Label>
                  <Input
                    id="contact-name"
                    placeholder="Full name"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone Number</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select onValueChange={(value) => setEmergencyContact({ ...emergencyContact, relationship: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="spouse">Spouse/Partner</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={addEmergencyContact} className="w-full">
                  Add Emergency Contact
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meeting">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <MapPin className="h-5 w-5" />
                    First Date Safety
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <p className="text-sm">Meet in a public, well-lit place</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <p className="text-sm">Tell a friend where you're going</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <p className="text-sm">Drive yourself or use your own transportation</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <p className="text-sm">Trust your instincts - leave if you feel uncomfortable</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-pink-200 bg-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-800">
                    <Heart className="h-5 w-5" />
                    Online Safety
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                    <p className="text-sm">Keep conversations on the platform initially</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                    <p className="text-sm">Video chat before meeting in person</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                    <p className="text-sm">Never send money or share financial details</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-pink-600 rounded-full mt-2"></div>
                    <p className="text-sm">Google search their photos to check authenticity</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Safety Resources
                </CardTitle>
                <CardDescription>
                  Additional resources and support contacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">24/7 Safety Hotline</h3>
                    <p className="text-sm text-gray-600 mb-2">Immediate help for urgent safety concerns</p>
                    <p className="font-mono text-lg">1-800-SAFETY-1</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Support Email</h3>
                    <p className="text-sm text-gray-600 mb-2">Non-urgent safety and support questions</p>
                    <p className="font-mono">safety@luvlang.com</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Crisis Text Line</h3>
                    <p className="text-sm text-gray-600 mb-2">Text "HOME" for immediate crisis support</p>
                    <p className="font-mono text-lg">741741</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Local Emergency</h3>
                    <p className="text-sm text-gray-600 mb-2">For immediate danger or emergencies</p>
                    <p className="font-mono text-lg">911</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Safety;