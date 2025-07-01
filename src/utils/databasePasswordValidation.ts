
import { supabase } from '@/integrations/supabase/client';

export interface DatabasePasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
}

/**
 * Validate password using the database function with comprehensive rules
 */
export const validatePasswordWithDatabase = async (password: string): Promise<DatabasePasswordValidationResult> => {
  try {
    const { data, error } = await supabase.rpc('validate_password_enhanced', {
      password: password
    });

    if (error) {
      console.error('Database password validation error:', error);
      // Fallback to basic validation if database function fails
      return {
        isValid: password.length >= 8,
        errors: password.length < 8 ? ['Password must be at least 8 characters'] : [],
        score: password.length >= 8 ? 50 : 0
      };
    }

    // The function returns a single row with columns: is_valid, errors, score
    const result = data?.[0];
    if (!result) {
      throw new Error('No validation result returned');
    }

    return {
      isValid: result.is_valid,
      errors: result.errors || [],
      score: result.score || 0
    };
  } catch (error) {
    console.error('Password validation failed:', error);
    // Fallback validation
    return {
      isValid: password.length >= 8,
      errors: password.length < 8 ? ['Password must be at least 8 characters'] : [],
      score: password.length >= 8 ? 50 : 0
    };
  }
};

/**
 * Get password strength description based on score
 */
export const getPasswordStrengthText = (score: number): { text: string; color: string } => {
  if (score >= 80) return { text: 'Very Strong', color: 'text-green-600' };
  if (score >= 60) return { text: 'Strong', color: 'text-blue-600' };
  if (score >= 40) return { text: 'Moderate', color: 'text-yellow-600' };
  if (score >= 20) return { text: 'Weak', color: 'text-orange-600' };
  return { text: 'Very Weak', color: 'text-red-600' };
};

/**
 * Get all password rules from database for display
 */
export const getPasswordRules = async (): Promise<Array<{ description: string; pattern: string }>> => {
  try {
    const { data, error } = await supabase
      .from('password_rules')
      .select('description, pattern')
      .order('rule_id');

    if (error) {
      console.error('Failed to fetch password rules:', error);
      return [
        { description: 'At least 8 characters', pattern: '^.{8,}$' },
        { description: 'At least one uppercase letter', pattern: '[A-Z]' },
        { description: 'At least one lowercase letter', pattern: '[a-z]' },
        { description: 'At least one number', pattern: '[0-9]' },
        { description: 'At least one special character', pattern: '[^A-Za-z0-9]' }
      ];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching password rules:', error);
    return [];
  }
};
