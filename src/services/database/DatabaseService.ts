
import { supabase } from '@/integrations/supabase/client';

export class DatabaseService {
  static async createSecureProfile(profileData: {
    bio: string;
    values: string;
    lifeGoals: string;
    greenFlags: string;
  }) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User authentication error:', userError);
        throw new Error('User not authenticated');
      }
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          ...profileData,
          verified: false,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }
      return { success: true };
    } catch (error) {
      console.error('DatabaseService.createSecureProfile error:', error);
      throw error;
    }
  }

  static async sendSecureMessage(conversationId: string, content: string) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User authentication error:', userError);
        throw new Error('User not authenticated');
      }
      if (!user) throw new Error('User not authenticated');

      // Check if user is participant in conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('participant_1, participant_2')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error('Conversation fetch error:', convError);
        throw new Error('Failed to verify conversation access');
      }

      if (!conversation || 
          (conversation.participant_1 !== user.id && conversation.participant_2 !== user.id)) {
        throw new Error('Unauthorized conversation access');
      }

      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content,
          message_type: 'text'
        });

      if (error) {
        console.error('Message send error:', error);
        throw error;
      }
      return { success: true };
    } catch (error) {
      console.error('DatabaseService.sendSecureMessage error:', error);
      throw error;
    }
  }
}
