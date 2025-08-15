import { validatePasswordStrength } from './passwordValidation';
// Configuration for authentication - database now handles server-side validation
export const authConfig = {
    // Database handles server-side validation via trigger
    useServerValidation: true,
    // Client-side validation settings for UX
    minPasswordLength: 6,
    requireStrongPassword: true,
    checkLeakedPasswords: true
};
// Function to validate password before sending to Supabase (for better UX)
export const validatePasswordBeforeAuth = (password) => {
    return validatePasswordStrength(password);
};
// Function to initialize auth - no longer needed for custom validation
export const initializeAuth = async () => {
    try {
        console.log('Auth initialized with database-level password validation');
        return {
            success: true,
            message: 'Auth initialized with database-level password validation'
        };
    }
    catch (error) {
        console.error('Failed to initialize auth:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};
// Helper function to validate email format
export const validateEmailFormat = (email) => {
    if (!email)
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 320;
};
// Helper function to sanitize user input
export const sanitizeAuthInput = (input) => {
    if (!input)
        return '';
    return input.trim();
};
