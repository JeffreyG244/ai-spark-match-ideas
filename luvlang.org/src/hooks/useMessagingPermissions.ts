import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MembershipLevel } from '@/hooks/useMembershipBadge';

export const useMessagingPermissions = (recipientId?: string) => {
  const { user } = useAuth();
  const [canSendMessage, setCanSendMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<MembershipLevel>('basic');
  const [recipientLevel, setRecipientLevel] = useState<MembershipLevel>('basic');

  useEffect(() => {
    if (!user?.id || !recipientId) {
      setLoading(false);
      return;
    }
    
    checkMessagingPermissions();
  }, [user?.id, recipientId]);

  const checkMessagingPermissions = async () => {
    if (!user?.id || !recipientId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Call the database function to check messaging permissions
      const { data, error } = await supabase
        .rpc('can_send_message', {
          sender_id: user.id,
          recipient_id: recipientId
        });

      if (error) {
        console.error('Error checking messaging permissions:', error);
        setError('Failed to check messaging permissions');
        return;
      }

      setCanSendMessage(data || false);

      // Also get membership levels for context
      const [senderData, recipientData] = await Promise.all([
        supabase.from('users').select('membership_verification').eq('id', user.id).single(),
        supabase.from('users').select('membership_verification').eq('id', recipientId).single()
      ]);

      if (senderData.data) setUserLevel(senderData.data.membership_verification || 'basic');
      if (recipientData.data) setRecipientLevel(recipientData.data.membership_verification || 'basic');

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionMessage = () => {
    if (canSendMessage) return null;
    
    // Generate helpful message based on membership levels
    if (userLevel === 'basic' || userLevel === 'premium') {
      if (recipientLevel === 'executive' || recipientLevel === 'c_suite') {
        return 'You can message this Executive/C-Suite member!';
      }
      return 'Upgrade to Executive or C-Suite to message other members.';
    }
    
    return 'You can message any member with your current plan!';
  };

  return {
    canSendMessage,
    loading,
    error,
    userLevel,
    recipientLevel,
    permissionMessage: getPermissionMessage(),
    refetch: checkMessagingPermissions
  };
};