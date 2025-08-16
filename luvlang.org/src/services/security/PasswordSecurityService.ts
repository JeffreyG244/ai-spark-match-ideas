import { supabase } from '@/integrations/supabase/client';

export interface PasswordSecurityResult {
  isSecure: boolean;
  score: number;
  vulnerabilities: string[];
  recommendations: string[];
}

export class PasswordSecurityService {
  private static readonly COMMON_PASSWORDS = new Set([
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password1', '12345678', '111111', '1234567', 'admin'
  ]);

  private static readonly VULNERABLE_PATTERNS = [
    /(.)\1{2,}/, // repeated characters
    /^[a-z]+$/, // only lowercase
    /^[A-Z]+$/, // only uppercase  
    /^[0-9]+$/, // only numbers
    /^(123|abc|qwe)/i, // sequential patterns
  ];

  static async validatePasswordSecurity(password: string): Promise<PasswordSecurityResult> {
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      vulnerabilities.push('Password too short');
      recommendations.push('Use at least 8 characters');
    } else if (password.length >= 12) {
      score += 20;
    } else {
      score += 10;
    }

    // Character variety checks
    if (!/[a-z]/.test(password)) {
      vulnerabilities.push('Missing lowercase letters');
      recommendations.push('Include lowercase letters');
    } else {
      score += 15;
    }

    if (!/[A-Z]/.test(password)) {
      vulnerabilities.push('Missing uppercase letters');
      recommendations.push('Include uppercase letters');
    } else {
      score += 15;
    }

    if (!/[0-9]/.test(password)) {
      vulnerabilities.push('Missing numbers');
      recommendations.push('Include numbers');
    } else {
      score += 15;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      vulnerabilities.push('Missing special characters');
      recommendations.push('Include special characters (!@#$%^&*)');
    } else {
      score += 15;
    }

    // Common password check
    if (this.COMMON_PASSWORDS.has(password.toLowerCase())) {
      vulnerabilities.push('Common password detected');
      recommendations.push('Use a unique password');
      score = Math.max(0, score - 40);
    }

    // Pattern vulnerability checks
    for (const pattern of this.VULNERABLE_PATTERNS) {
      if (pattern.test(password)) {
        vulnerabilities.push('Vulnerable pattern detected');
        recommendations.push('Avoid repetitive or sequential patterns');
        score = Math.max(0, score - 20);
        break;
      }
    }

    // Dictionary word check (simplified)
    const commonWords = ['password', 'admin', 'user', 'login', 'welcome'];
    if (commonWords.some(word => password.toLowerCase().includes(word))) {
      vulnerabilities.push('Contains common words');
      recommendations.push('Avoid dictionary words');
      score = Math.max(0, score - 15);
    }

    // Additional security checks
    try {
      // Check if password appears to be leaked (basic pattern matching)
      const suspiciousPatterns = [
        /password\d+/i,
        /admin\d+/i,
        /user\d+/i,
        /^[a-z]+\d+$/i
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(password))) {
        vulnerabilities.push('Password follows common leak patterns');
        recommendations.push('Use a more unique password structure');
        score = Math.max(0, score - 20);
      }
    } catch (error) {
      console.warn('Advanced password validation unavailable:', error);
    }

    // Final score calculation
    score = Math.min(100, Math.max(0, score));

    return {
      isSecure: vulnerabilities.length === 0 && score >= 70,
      score,
      vulnerabilities,
      recommendations
    };
  }

  static getStrengthText(score: number): { text: string; color: string } {
    if (score >= 80) return { text: 'Very Strong', color: 'text-green-600' };
    if (score >= 60) return { text: 'Strong', color: 'text-blue-600' };
    if (score >= 40) return { text: 'Moderate', color: 'text-yellow-600' };
    if (score >= 20) return { text: 'Weak', color: 'text-orange-600' };
    return { text: 'Very Weak', color: 'text-red-600' };
  }
}