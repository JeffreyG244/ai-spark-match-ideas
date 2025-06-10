
import { supabase } from '@/integrations/supabase/client';

// Comprehensive leaked password database (partial list for performance)
const LEAKED_PASSWORDS_DB = new Set([
  // Top 100 most common leaked passwords
  '123456', 'password', '123456789', '12345678', '12345',
  '1234567', 'admin', '1234567890', 'letmein', 'monkey',
  'qwerty', 'abc123', 'password1', 'welcome', 'football',
  '123123', 'baseball', 'dragon', 'superman', 'trustno1',
  'master', 'sunshine', 'shadow', 'princess', 'qwertyuiop',
  'passw0rd', 'login', 'solo', 'starwars', 'freedom',
  'hello', 'secret', 'whatever', '1234', 'test',
  '111111', '123qwe', 'fuckyou', '121212', 'donald',
  '123abc', 'qwerty123', '1q2w3e4r', 'azerty', 'password123',
  'bailey', '000000', '696969', 'batman', '1qaz2wsx',
  '123654', 'charlie', 'aa123456', '654321', '123123123',
  'qazwsx', 'password!', '123456a', 'loveme', '888888',
  'soccer', 'jordan23', 'jordan', 'michael', 'mustang',
  'password12', '123456789a', 'super123', 'pokemon', 'iloveyou',
  'admin123', 'welcome123', 'letmein123', 'test123', 'user123',
  'root123', 'guest123', 'demo123', 'temp123', 'pass123',
  'default', 'changeme', 'password@123', 'admin@123', 'welcome@123'
]);

// Additional pattern-based vulnerable passwords
const VULNERABLE_PATTERNS = [
  /^(.)\1{3,}$/, // Repeated characters (aaaa, 1111, etc.)
  /^(012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210){3,}/, // Sequential numbers
  /^(qwer|asdf|zxcv|qwerty|asdfgh|zxcvbn){2,}/i, // Keyboard patterns
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz){2,}/i, // Sequential letters
];

export interface CriticalPasswordValidation {
  isSecure: boolean;
  vulnerabilities: string[];
  securityScore: number;
  recommendations: string[];
}

export const validatePasswordAgainstLeaks = (password: string): CriticalPasswordValidation => {
  const vulnerabilities: string[] = [];
  const recommendations: string[] = [];
  let securityScore = 100;

  // Convert to lowercase for checking
  const lowerPassword = password.toLowerCase();

  // Check against leaked password database
  if (LEAKED_PASSWORDS_DB.has(lowerPassword)) {
    vulnerabilities.push('Password found in data breach databases');
    recommendations.push('Choose a completely different password');
    securityScore -= 60;
  }

  // Check for vulnerable patterns
  for (const pattern of VULNERABLE_PATTERNS) {
    if (pattern.test(password)) {
      vulnerabilities.push('Password contains predictable patterns');
      recommendations.push('Avoid keyboard patterns, repeated characters, or sequences');
      securityScore -= 30;
      break;
    }
  }

  // Check for common substitutions (like @ for a, 3 for e)
  const commonSubstitutions = lowerPassword
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't');

  if (LEAKED_PASSWORDS_DB.has(commonSubstitutions)) {
    vulnerabilities.push('Password is a simple variation of a common password');
    recommendations.push('Use completely unrelated words or a passphrase');
    securityScore -= 40;
  }

  // Check for personal information indicators
  const personalPatterns = [
    /admin/i, /user/i, /test/i, /demo/i, /guest/i,
    /password/i, /login/i, /welcome/i, /hello/i, /love/i,
    /dating/i, /romance/i, /heart/i
  ];

  for (const pattern of personalPatterns) {
    if (pattern.test(password)) {
      vulnerabilities.push('Password contains predictable words');
      recommendations.push('Avoid common words, especially related to the service');
      securityScore -= 20;
      break;
    }
  }

  // Length penalties
  if (password.length < 12) {
    vulnerabilities.push('Password is shorter than recommended 12 characters');
    recommendations.push('Use at least 12 characters for better security');
    securityScore -= 15;
  }

  // Character diversity check
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const characterTypes = [hasUpper, hasLower, hasNumbers, hasSpecial].filter(Boolean).length;
  
  if (characterTypes < 3) {
    vulnerabilities.push('Password lacks character diversity');
    recommendations.push('Include uppercase, lowercase, numbers, and special characters');
    securityScore -= 25;
  }

  securityScore = Math.max(0, securityScore);

  return {
    isSecure: vulnerabilities.length === 0 && securityScore >= 70,
    vulnerabilities,
    securityScore,
    recommendations
  };
};

// Secure function to log critical security events
export const logCriticalSecurityEvent = async (
  eventType: string,
  details: Record<string, any>,
  severity: 'critical' | 'high' | 'medium' | 'low' = 'high'
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use the existing security_logs table with enhanced details
    const { error } = await supabase
      .from('security_logs')
      .insert({
        user_id: user?.id || null,
        event_type: `critical_${eventType}`,
        severity,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
          session_id: user?.id ? `session_${user.id}_${Date.now()}` : null
        }
      });

    if (error) {
      console.error('Failed to log critical security event:', error);
      // Fallback to localStorage for critical events
      const fallbackLogs = JSON.parse(localStorage.getItem('critical_security_fallback') || '[]');
      fallbackLogs.push({
        eventType: `critical_${eventType}`,
        severity,
        details,
        timestamp: new Date().toISOString(),
        fallback_reason: error.message
      });
      localStorage.setItem('critical_security_fallback', JSON.stringify(fallbackLogs.slice(-50)));
    }
  } catch (error) {
    console.error('Critical security logging failed:', error);
  }
};

// Enhanced rate limiting with exponential backoff
export const criticalRateLimit = (() => {
  const attempts = new Map<string, { count: number; lastAttempt: number; blockUntil: number }>();

  return {
    checkAllowed: (key: string, maxAttempts: number = 5): { allowed: boolean; retryAfter?: number } => {
      const now = Date.now();
      const record = attempts.get(key);

      if (!record) {
        attempts.set(key, { count: 1, lastAttempt: now, blockUntil: 0 });
        return { allowed: true };
      }

      // Check if still blocked
      if (record.blockUntil > now) {
        return { 
          allowed: false, 
          retryAfter: Math.ceil((record.blockUntil - now) / 1000) 
        };
      }

      // Reset if enough time has passed (1 hour)
      if (now - record.lastAttempt > 3600000) {
        attempts.set(key, { count: 1, lastAttempt: now, blockUntil: 0 });
        return { allowed: true };
      }

      // Increment attempt count
      record.count++;
      record.lastAttempt = now;

      if (record.count > maxAttempts) {
        // Exponential backoff: 1min, 5min, 15min, 1hr, 24hr
        const penalties = [60000, 300000, 900000, 3600000, 86400000];
        const penaltyIndex = Math.min(record.count - maxAttempts - 1, penalties.length - 1);
        record.blockUntil = now + penalties[penaltyIndex];
        
        return { 
          allowed: false, 
          retryAfter: Math.ceil(penalties[penaltyIndex] / 1000) 
        };
      }

      return { allowed: true };
    },

    reset: (key: string) => {
      attempts.delete(key);
    }
  };
})();
