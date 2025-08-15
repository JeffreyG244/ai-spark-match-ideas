
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInputAsync, logSecurityEvent } from './security';

// Add missing type definitions
interface SecureProfileData {
  email: string;
  bio: string;
}

// Add missing validation function
const validateSecureProfileData = (data: SecureProfileData) => {
  if (!data.email || !data.bio) {
    return { isValid: false, error: 'Email and bio are required' };
  }
  if (data.email.length > 255 || data.bio.length > 1000) {
    return { isValid: false, error: 'Email or bio too long' };
  }
  return { isValid: true };
};

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
      // Enhanced sanitization - await all async operations
      const sanitizedData = {
        bio: await sanitizeInputAsync(profileData.bio),
        values: await sanitizeInputAsync(profileData.values),
        lifeGoals: await sanitizeInputAsync(profileData.lifeGoals),
        greenFlags: await sanitizeInputAsync(profileData.greenFlags)
      };

      // Additional security checks
      if (this.detectSuspiciousContent(Object.values(sanitizedData).join(' '))) {
        logSecurityEvent('suspicious_profile_content', 'Profile contains suspicious content', 'high');
        throw new Error('Profile content failed security validation');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          bio: sanitizedData.bio,
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
      const sanitizedContent = await sanitizeInputAsync(content);
      
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

/**
 * Validates and saves secure user profile data
 */
export const saveSecureProfile = async (
  userId: string,
  profileData: SecureProfileData
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate input data
    const validation = validateSecureProfileData(profileData);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Save to database
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        email: profileData.email,
        bio: profileData.bio,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Profile save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Save secure profile error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
