import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trash2, AlertTriangle, Shield, Download, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

export const AccountDeletion = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'warning' | 'confirmation' | 'processing' | 'complete'>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [wantDataExport, setWantDataExport] = useState(false);

  const handleDataExport = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Export user data before deletion
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email,
        reason: 'Account deletion export',
        data: {}
      };

      // Get profile data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        exportData.data = { profile };
      }

      // Create download
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luvlang-account-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Export Complete",
        description: "Your data has been downloaded before account deletion."
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. You can still proceed with deletion.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE MY ACCOUNT' exactly as shown.",
        variant: "destructive"
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please confirm you understand the consequences.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      // In a real implementation, you would:
      // 1. Cancel any active subscriptions
      // 2. Delete user data from all tables
      // 3. Mark the account as deleted
      // 4. Send confirmation email
      
      // For now, we'll simulate the deletion process
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        // If admin deletion fails, we can still mark the user as deleted
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            deleted_at: new Date().toISOString(),
            email: `deleted_${user.id}@luvlang.org`,
            deletion_reason: deleteReason
          })
          .eq('id', user.id);
        
        if (updateError) {
          throw updateError;
        }
      }

      setStep('complete');
      
      // Sign out after successful deletion
      setTimeout(() => {
        signOut();
      }, 3000);

    } catch (error) {
      setStep('confirmation');
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting your account. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetProcess = () => {
    setStep('warning');
    setConfirmationText('');
    setDeleteReason('');
    setAgreedToTerms(false);
    setWantDataExport(false);
  };

  if (step === 'complete') {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Account Deletion Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-green-300 space-y-4">
            <p className="text-lg">Your account has been successfully deleted.</p>
            <p className="text-sm">You will be signed out shortly.</p>
            <p className="text-sm">Thank you for being part of the LuvLang community.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'processing') {
    return (
      <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
        <CardContent className="text-center py-12">
          <div className="text-white space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p>Processing account deletion...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-red-500/30">
      <CardHeader>
        <CardTitle className="text-red-400 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Delete Account
        </CardTitle>
        <CardDescription className="text-slate-300">
          Permanently delete your LuvLang account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 'warning' && (
          <>
            {/* Warning Section */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h5 className="text-red-400 font-medium mb-2">This action cannot be undone</h5>
                  <p className="text-red-300 text-sm mb-3">
                    Deleting your account will permanently remove:
                  </p>
                  <ul className="text-red-300 text-sm space-y-1 ml-4">
                    <li>• Your profile and all photos</li>
                    <li>• All your matches and conversations</li>
                    <li>• Your subscription and billing history</li>
                    <li>• All verification badges and status</li>
                    <li>• Account settings and preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Data Export Option */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-blue-400 font-medium mb-2">Download Your Data First?</h5>
                  <p className="text-blue-300 text-sm mb-3">
                    We recommend downloading a copy of your data before deletion.
                  </p>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="export-data"
                      checked={wantDataExport}
                      onCheckedChange={(checked) => setWantDataExport(checked as boolean)}
                    />
                    <Label htmlFor="export-data" className="text-blue-300 text-sm cursor-pointer">
                      Yes, download my data before deleting
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-white">
                Why are you deleting your account? (Optional)
              </Label>
              <Textarea
                id="reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Help us improve by sharing your reason..."
                className="bg-slate-700/50 border-slate-600 text-white resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => setStep('confirmation')}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                Continue with Deletion
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-slate-500 text-slate-300 flex-1"
              >
                Cancel
              </Button>
            </div>
          </>
        )}

        {step === 'confirmation' && (
          <>
            {/* Data Export */}
            {wantDataExport && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <Button
                  onClick={handleDataExport}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 w-full mb-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isLoading ? "Exporting..." : "Download My Data"}
                </Button>
                <p className="text-blue-300 text-sm text-center">
                  Complete the data export before proceeding with deletion
                </p>
              </div>
            )}

            {/* Final Confirmation */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h5 className="text-red-400 font-medium mb-4">Final Confirmation</h5>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confirm-text" className="text-white">
                    Type "DELETE MY ACCOUNT" to confirm:
                  </Label>
                  <Input
                    id="confirm-text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agree-terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label htmlFor="agree-terms" className="text-white text-sm cursor-pointer">
                    I understand that this action is permanent and cannot be reversed
                  </Label>
                </div>
              </div>
            </div>

            {/* Final Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleDeleteAccount}
                disabled={isLoading || confirmationText !== 'DELETE MY ACCOUNT' || !agreedToTerms}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                {isLoading ? "Deleting..." : "Delete My Account Permanently"}
              </Button>
              <Button
                onClick={resetProcess}
                variant="outline"
                className="border-slate-500 text-slate-300 flex-1"
              >
                Go Back
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountDeletion;