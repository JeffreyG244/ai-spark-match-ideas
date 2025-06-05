
// Custom bypass password checks function for development/testing
export const bypass_password_checks = () => {
  // This function bypasses Supabase's built-in password validation
  // Only use this for development or when you have custom validation
  return true;
};

export const validatePasswordStrength = (password: string): { isValid: boolean; error?: string } => {
  // Minimum length check
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  // Check against common leaked passwords (simplified list)
  const commonPasswords = [
    '123456', 'password', '123456789', '12345678', '12345',
    '1234567', 'admin', '1234567890', 'letmein', 'monkey',
    'qwerty', 'abc123', 'password1', 'welcome', 'football'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return { 
      isValid: false, 
      error: 'This password has been found in data breaches. Please choose a stronger password.' 
    };
  }

  return { isValid: true };
};

export const sanitizePasswordInput = (password: string): string => {
  // Remove any potentially dangerous characters
  return password.trim().replace(/[<>'"&]/g, '');
};
