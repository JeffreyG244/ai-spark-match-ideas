
import DOMPurify from 'dompurify';
import { SecurityAuditService } from './SecurityAuditService';

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
  violations?: string[];
}

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /data:application\/javascript/gi,
  /on\w+\s*=/gi,
  /@import/gi,
  /expression\s*\(/gi,
  /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b).*(\b(FROM|INTO|WHERE|SET|VALUES)\b)/gi,
  /['"];\s*(DROP|DELETE|INSERT|UPDATE|SELECT)/gi,
  /\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi,
  /\.\.\//g,
  /\.\.\\+/g,
  /[;&|`$(){}[\]]/g,
];

const SUSPICIOUS_KEYWORDS = [
  'eval', 'Function', 'setTimeout', 'setInterval', 'XMLHttpRequest',
  'fetch', 'import', 'require', 'process', 'global', 'window.location'
];

export class ContentValidationService {
  static async validateAndSanitizeInput(
    input: string,
    contentType: string = 'text',
    maxLength: number = 1000
  ): Promise<ValidationResult> {
    try {
      if (!input || typeof input !== 'string') {
        return {
          isValid: false,
          sanitized: '',
          error: 'Invalid input type'
        };
      }

      const violations: string[] = [];

      if (input.length > maxLength) {
        violations.push('content_too_long');
        return {
          isValid: false,
          sanitized: input.substring(0, maxLength),
          error: `Content exceeds maximum length of ${maxLength} characters`,
          violations
        };
      }

      for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.test(input)) {
          violations.push(`dangerous_pattern_${pattern.source.substring(0, 20)}`);
        }
      }

      const lowerInput = input.toLowerCase();
      for (const keyword of SUSPICIOUS_KEYWORDS) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          violations.push(`suspicious_keyword_${keyword}`);
        }
      }

      if (violations.length > 0) {
        await SecurityAuditService.logSecurityEvent(
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
        sanitized = input
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }

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
      await SecurityAuditService.logSecurityEvent(
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
  }

  static async enforceContentPolicy(
    content: string,
    contentType: string
  ): Promise<{ allowed: boolean; reason?: string; sanitized?: string }> {
    const validation = await this.validateAndSanitizeInput(content, contentType);
    
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
  }

  static detectSuspiciousPatterns(content: string): string[] {
    const patterns = [
      /contact.*me.*at/i,
      /instagram|snapchat|whatsapp|telegram/i,
      /money|bitcoin|crypto|investment/i,
      /cashapp|venmo|paypal/i,
      /click.*here|visit.*site/i,
      /urgent|emergency|asap/i
    ];
    
    const detectedPatterns: string[] = [];
    
    patterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        const patternNames = [
          'contact_info_sharing',
          'external_platform_reference',
          'financial_content',
          'payment_reference',
          'suspicious_links',
          'urgency_manipulation'
        ];
        detectedPatterns.push(patternNames[index]);
      }
    });
    
    return detectedPatterns;
  }
}
