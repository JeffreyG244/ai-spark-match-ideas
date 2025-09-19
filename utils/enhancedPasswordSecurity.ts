import { EnhancedSecurityService } from './enhancedSecurityService';
import { SECURITY_CONFIG } from './securityConfig';

export interface PasswordSecurityResult {
  isValid: boolean;
  isStrong: boolean;
  score: number;
  feedback: string[];
  isLeaked: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
}

export class EnhancedPasswordSecurity {
  // Comprehensive password validation
  static async validatePassword(password: string): Promise<PasswordSecurityResult> {
    // Basic client-side checks first
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[^A-Za-z0-9]/.test(password)
    };

    const basicValid = Object.values(requirements).every(req => req);

    // Enhanced validation using database function
    const dbValidation = await EnhancedSecurityService.validatePasswordStrength(password);

    // Check against common patterns
    const commonPatterns = [
      /^password/i,
      /123456/,
      /qwerty/i,
      /admin/i,
      /user/i,
      /^(.)\1+$/, // Repeated characters
      /^012345|56789|abcdef/i, // Sequential patterns
    ];

    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
    
    // Calculate final score
    let finalScore = dbValidation.score;
    
    if (hasCommonPattern) {
      finalScore = Math.max(0, finalScore - 2);
    }

    // Additional entropy check for very long passwords
    if (password.length >= 12) {
      finalScore += 1;
    }

    const isStrong = finalScore >= SECURITY_CONFIG.PASSWORD_MIN_SCORE && 
                    !dbValidation.isLeaked && 
                    !hasCommonPattern;

    let feedback = [...dbValidation.feedback];
    
    if (hasCommonPattern) {
      feedback.push('Avoid common patterns like "password123" or sequential characters');
    }
    
    if (!basicValid) {
      if (!requirements.minLength) feedback.push('Password must be at least 8 characters long');
      if (!requirements.hasUppercase) feedback.push('Include uppercase letters (A-Z)');
      if (!requirements.hasLowercase) feedback.push('Include lowercase letters (a-z)');
      if (!requirements.hasNumbers) feedback.push('Include numbers (0-9)');
      if (!requirements.hasSpecialChars) feedback.push('Include special characters (!@#$%^&*)');
    }

    return {
      isValid: basicValid && !dbValidation.isLeaked,
      isStrong,
      score: finalScore,
      feedback: Array.from(new Set(feedback)), // Remove duplicates
      isLeaked: dbValidation.isLeaked,
      requirements
    };
  }

  // Generate secure password suggestion
  static generateSecurePassword(length = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Check if password meets minimum security requirements
  static meetsMinimumSecurity(password: string): boolean {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[^A-Za-z0-9]/.test(password);
  }

  // Get password strength color for UI
  static getStrengthColor(score: number): string {
    if (score >= 5) return 'hsl(var(--success))';
    if (score >= 3) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  }

  // Get password strength text for UI
  static getStrengthText(score: number): string {
    if (score >= 5) return 'Very Strong';
    if (score >= 4) return 'Strong';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Fair';
    if (score >= 1) return 'Weak';
    return 'Very Weak';
  }
}