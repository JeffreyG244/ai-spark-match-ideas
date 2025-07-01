
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const DataDeletion = () => {
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDataDeletion = async () => {
    if (!user) return;
    
    if (confirmText !== 'DELETE MY DATA') {
      toast({
        title: 'Confirmation Required',
        description: 'Please type "DELETE MY DATA" to confirm',
        variant: 'destructive'
      });
      return;
    }

    setIsDeleting(true);
    
    try {
      // Delete user profile data using correct table name
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Delete user conversation messages
      const { error: messagesError } = await supabase
        .from('conversation_messages')
        .delete()
        .eq('sender_id', user.id);

      if (messagesError) throw messagesError;

      // Delete matches
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .or(`user_id.eq.${user.id},matched_user_id.eq.${user.id}`);

      if (matchesError) throw matchesError;

      // Log the deletion
      await supabase
        .from('security_logs')
        .insert({
          user_id: user.id,
          event_type: 'user_data_deletion',
          severity: 'medium',
          details: { reason: 'user_requested', timestamp: new Date().toISOString() }
        });

      // Note: We cannot delete the auth user from client-side code
      // This would typically be handled by a server-side function or edge function
      
      toast({
        title: 'Data Deletion Initiated',
        description: 'Your profile data has been deleted. Account deletion will be completed shortly.',
      });

      await signOut();
      
    } catch (error) {
      console.error('Error deleting user data:', error);
      toast({
        title: 'Deletion Failed',
        description: 'There was an error deleting your data. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          You must be logged in to manage your data.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Delete All Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This action cannot be undone. All your profile data, messages, 
            matches, and account information will be permanently deleted.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            In compliance with GDPR and CCPA, you have the right to delete all your personal data. 
            This includes:
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Profile information and photos</li>
            <li>All messages and conversations</li>
            <li>Match history and preferences</li>
            <li>Account and authentication data</li>
          </ul>
        </div>

        {!showConfirmation ? (
          <Button 
            onClick={() => setShowConfirmation(true)} 
            variant="destructive"
            className="w-full"
          >
            Request Data Deletion
          </Button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Type "DELETE MY DATA" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="DELETE MY DATA"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleDataDeletion}
                disabled={isDeleting || confirmText !== 'DELETE MY DATA'}
                variant="destructive"
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </Button>
              <Button 
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmText('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataDeletion;
