
import DOMPurify from 'dompurify';
import { logSecurityEventToDB } from './enhancedSecurity';

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
  violations?: string[];
}

// Enhanced XSS prevention patterns
const DANGEROUS_PATTERNS = [
  // Script injection patterns
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /data:application\/javascript/gi,
  
  // Event handler patterns
  /on\w+\s*=/gi,
  /@import/gi,
  /expression\s*\(/gi,
  
  // SQL injection patterns
  /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b).*(\b(FROM|INTO|WHERE|SET|VALUES)\b)/gi,
  /['"];\s*(DROP|DELETE|INSERT|UPDATE|SELECT)/gi,
  /\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi,
  
  // Path traversal patterns
  /\.\.\//g,
  /\.\.\\+/g,
  
  // Command injection patterns
  /[;&|`$(){}[\]]/g,
];

const SUSPICIOUS_KEYWORDS = [
  'eval', 'Function', 'setTimeout', 'setInterval', 'XMLHttpRequest',
  'fetch', 'import', 'require', 'process', 'global', 'window.location'
];

export const validateAndSanitizeInput = async (
  input: string,
  contentType: string = 'text',
  maxLength: number = 1000
): Promise<ValidationResult> => {
  try {
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        sanitized: '',
        error: 'Invalid input type'
      };
    }

    const violations: string[] = [];

    // Length validation
    if (input.length > maxLength) {
      violations.push('content_too_long');
      return {
        isValid: false,
        sanitized: input.substring(0, maxLength),
        error: `Content exceeds maximum length of ${maxLength} characters`,
        violations
      };
    }

    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(input)) {
        violations.push(`dangerous_pattern_${pattern.source.substring(0, 20)}`);
      }
    }

    // Check for suspicious keywords
    const lowerInput = input.toLowerCase();
    for (const keyword of SUSPICIOUS_KEYWORDS) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        violations.push(`suspicious_keyword_${keyword}`);
      }
    }

    // Log security violations
    if (violations.length > 0) {
      await logSecurityEventToDB(
        'input_validation_violation',
        {
          content_type: contentType,
          violations,
          input_length: input.length,
          suspicious_content: input.substring(0, 200)
        },
        violations.some(v => v.includes('dangerous_pattern')) ? 'high' : 'medium'
      );

      return {
        isValid: false,
        sanitized: '',
        error: 'Content contains potentially dangerous patterns',
        violations
      };
    }

    // Enhanced HTML sanitization using DOMPurify
    let sanitized = input;
    
    if (contentType === 'html' || contentType === 'rich_text') {
      sanitized = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false
      });
    } else {
      // For plain text, escape HTML entities
      sanitized = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // Additional sanitization for URLs
    if (contentType === 'url') {
      try {
        const url = new URL(sanitized);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return {
            isValid: false,
            sanitized: '',
            error: 'Invalid URL protocol'
          };
        }
      } catch {
        return {
          isValid: false,
          sanitized: '',
          error: 'Invalid URL format'
        };
      }
    }

    return {
      isValid: true,
      sanitized,
      violations: []
    };

  } catch (error) {
    console.error('Input validation error:', error);
    await logSecurityEventToDB(
      'input_validation_error',
      `Validation failed: ${error}`,
      'medium'
    );

    return {
      isValid: false,
      sanitized: '',
      error: 'Validation failed'
    };
  }
};

export const enforceContentPolicy = async (
  content: string,
  contentType: string
): Promise<{ allowed: boolean; reason?: string; sanitized?: string }> => {
  const validation = await validateAndSanitizeInput(content, contentType);
  
  if (!validation.isValid) {
    return {
      allowed: false,
      reason: validation.error,
      sanitized: validation.sanitized
    };
  }

  return {
    allowed: true,
    sanitized: validation.sanitized
  };
};
