
import { validatePasswordWithDatabase, getPasswordStrengthText, type DatabasePasswordValidationResult } from './databasePasswordValidation';

// Re-export database-backed validation functions
export const validatePasswordStrengthEnhanced = validatePasswordWithDatabase;
export { getPasswordStrengthText };
export type { DatabasePasswordValidationResult as PasswordValidationResult };

// Legacy compatibility wrapper
export const validatePasswordSecurity = async (password: string) => {
  const result = await validatePasswordWithDatabase(password);
  return {
    isValid: result.isValid,
    errors: result.errors,
    securityScore: result.score,
    suggestions: result.errors.map(error => `Fix: ${error}`)
  };
};
