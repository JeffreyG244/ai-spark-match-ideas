
import { useState, useCallback } from 'react';
import { validatePasswordWithDatabase, getPasswordStrengthText, type DatabasePasswordValidationResult } from '@/utils/databasePasswordValidation';

export const useDatabasePasswordValidation = () => {
  const [validationResult, setValidationResult] = useState<DatabasePasswordValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validatePassword = useCallback(async (password: string) => {
    if (!password) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await validatePasswordWithDatabase(password);
      setValidationResult(result);
    } catch (error) {
      console.error('Password validation error:', error);
      setValidationResult({
        isValid: false,
        errors: ['Validation failed. Please try again.'],
        score: 0
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

  const getStrengthText = useCallback(() => {
    if (!validationResult) return { text: '', color: '' };
    return getPasswordStrengthText(validationResult.score);
  }, [validationResult]);

  return {
    validationResult,
    isValidating,
    validatePassword,
    getStrengthText
  };
};
