
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, logSecurityEvent } from './security';

/**
 * Secure data operations with enhanced validation
 */
export class SecureDataOperations {
  
  /**
   * Securely create user profile with comprehensive validation
   */
  static async createSecureProfile(profileData: {
    bio: string;
    values: string;
    lifeGoals: string;
    greenFlags: string;
  }) {
    try {
      // Enhanced sanitization
      const sanitizedData = {
        bio: sanitizeInput(profileData.bio),
        values: sanitizeInput(profileData.values),
        lifeGoals: sanitizeInput(profileData.lifeGoals),
        greenFlags: sanitizeInput(profileData.greenFlags)
      };

      // Additional security checks
      if (this.detectSuspiciousContent(Object.values(sanitizedData).join(' '))) {
        logSecurityEvent('suspicious_profile_content', 'Profile contains suspicious content', 'high');
        throw new Error('Profile content failed security validation');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          ...sanitizedData,
          verified: false,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      logSecurityEvent('secure_profile_created', `User ${user.id} created secure profile`, 'low');
      return { success: true };

    } catch (error) {
      logSecurityEvent('secure_profile_creation_failed', `Failed to create secure profile: ${error}`, 'high');
      throw error;
    }
  }

  /**
   * Detect suspicious content patterns
   */
  private static detectSuspiciousContent(content: string): boolean {
    const suspiciousPatterns = [
      /script\s*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\s*\(/gi,
      /document\.cookie/gi,
      /window\.location/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Secure message sending with enhanced validation
   */
  static async sendSecureMessage(conversationId: string, content: string) {
    try {
      const sanitizedContent = sanitizeInput(content);
      
      if (this.detectSuspiciousContent(sanitizedContent)) {
        logSecurityEvent('suspicious_message_content', 'Message contains suspicious content', 'high');
        throw new Error('Message content failed security validation');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user is participant in conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_1, participant_2')
        .eq('id', conversationId)
        .single();

      if (!conversation || 
          (conversation.participant_1 !== user.id && conversation.participant_2 !== user.id)) {
        logSecurityEvent('unauthorized_message_attempt', 
          `User ${user.id} attempted to send message to unauthorized conversation ${conversationId}`, 'high');
        throw new Error('Unauthorized conversation access');
      }

      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: sanitizedContent,
          message_type: 'text'
        });

      if (error) throw error;

      logSecurityEvent('secure_message_sent', `User ${user.id} sent secure message`, 'low');
      return { success: true };

    } catch (error) {
      logSecurityEvent('secure_message_failed', `Failed to send secure message: ${error}`, 'high');
      throw error;
    }
  }
}
