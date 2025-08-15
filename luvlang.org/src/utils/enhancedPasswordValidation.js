import { validatePasswordWithDatabase, getPasswordStrengthText } from './databasePasswordValidation';
// Re-export database-backed validation functions
export const validatePasswordStrengthEnhanced = validatePasswordWithDatabase;
export { getPasswordStrengthText };
// Legacy compatibility wrapper
export const validatePasswordSecurity = async (password) => {
    const result = await validatePasswordWithDatabase(password);
    return {
        isValid: result.isValid,
        errors: result.errors,
        score: result.score,
        securityScore: result.score,
        suggestions: result.errors.map(error => `Fix: ${error}`)
    };
};
