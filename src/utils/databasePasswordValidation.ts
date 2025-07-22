
import { supabase } from '@/integrations/supabase/client';

export interface DatabasePasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
}

/**
 * Validate password using client-side rules (database functions removed for auth fix)
 */
export const validatePasswordWithDatabase = async (password: string): Promise<DatabasePasswordValidationResult> => {
  const errors: string[] = [];
  let score = 0;

  // Basic client-side validation rules
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 25;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 25;
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 25;
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 25;
  }
  
  return {
    isValid: errors.length === 0,
    score: Math.min(score, 100),
    errors
  };
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
