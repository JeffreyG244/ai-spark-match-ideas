
import { supabase } from '@/integrations/supabase/client';
import { validatePasswordStrength } from './passwordValidation';

// Configuration for authentication with custom password validation
export const authConfig = {
  // Use client-side password validation instead of bypassing server validation
  useCustomValidation: true,
  
  // Custom validation settings
  minPasswordLength: 6,
  requireStrongPassword: true,
  checkLeakedPasswords: true
};

// Function to validate password before sending to Supabase
export const validatePasswordBeforeAuth = (password: string): { isValid: boolean; error?: string } => {
  return validatePasswordStrength(password);
};

// Function to initialize auth with custom settings
export const initializeAuth = async () => {
  try {
    console.log('Initializing auth with custom password validation');
    
    return {
      success: true,
      message: 'Auth initialized with custom password validation'
    };
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Helper function to validate email format
export const validateEmailFormat = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
};

// Helper function to sanitize user input
export const sanitizeAuthInput = (input: string): string => {
  if (!input) return '';
  return input.trim();
};
