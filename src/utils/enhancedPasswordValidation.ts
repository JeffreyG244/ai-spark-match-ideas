
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
  suggestions: string[];
}

const LEAKED_PASSWORDS = [
  '12345678', 'password123', 'admin123', 'welcome123', 'letmein123',
  'password1', 'qwerty123', '123456789', 'password!', 'Password1',
  'password@123', 'admin@123', 'welcome@123', 'test@123', 'user@123'
];

const COMMON_PATTERNS = [
  /^(.)\1+$/, // All same character
  /^(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/, // Sequential numbers
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Sequential letters
  /^(qwer|asdf|zxcv|qwerty|asdfgh|zxcvbn)/i, // Keyboard patterns
];

export const validatePasswordStrengthEnhanced = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Minimum length check (8 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 10;
  }

  // Maximum length check
  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters long');
  }

  // Character complexity checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
    suggestions.push('Add lowercase letters (a-z)');
  } else {
    score += 10;
  }

  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
    suggestions.push('Add uppercase letters (A-Z)');
  } else {
    score += 10;
  }

  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
    suggestions.push('Add numbers (0-9)');
  } else {
    score += 10;
  }

  if (!hasSpecialChars) {
    errors.push('Password must contain at least one special character');
    suggestions.push('Add special characters (!@#$%^&*(),.?":{}|<>)');
  } else {
    score += 15;
  }

  // Length bonus
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;

  // Check against leaked passwords
  const lowerPassword = password.toLowerCase();
  if (LEAKED_PASSWORDS.includes(lowerPassword)) {
    errors.push('This password has been found in data breaches. Please choose a different password.');
    score = Math.max(0, score - 50);
  }

  // Check for common patterns
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      errors.push('Password contains common patterns that are easy to guess');
      suggestions.push('Avoid keyboard patterns, sequences, and repetitive characters');
      score = Math.max(0, score - 20);
      break;
    }
  }

  // Check for personal information patterns
  const personalPatterns = [
    /admin/i, /user/i, /test/i, /demo/i, /guest/i,
    /password/i, /login/i, /welcome/i, /hello/i
  ];

  for (const pattern of personalPatterns) {
    if (pattern.test(password)) {
      errors.push('Password should not contain common words or personal information');
      suggestions.push('Use a mix of random words or a passphrase');
      score = Math.max(0, score - 15);
      break;
    }
  }

  // Character diversity bonus
  const uniqueChars = new Set(password.toLowerCase()).size;
  if (uniqueChars >= password.length * 0.7) {
    score += 10;
  }

  // Final score adjustment
  score = Math.min(100, Math.max(0, score));

  return {
    isValid: errors.length === 0 && score >= 50,
    errors,
    score,
    suggestions
  };
};

export const getPasswordStrengthText = (score: number): { text: string; color: string } => {
  if (score >= 80) return { text: 'Very Strong', color: 'text-green-600' };
  if (score >= 60) return { text: 'Strong', color: 'text-blue-600' };
  if (score >= 40) return { text: 'Moderate', color: 'text-yellow-600' };
  if (score >= 20) return { text: 'Weak', color: 'text-orange-600' };
  return { text: 'Very Weak', color: 'text-red-600' };
};
