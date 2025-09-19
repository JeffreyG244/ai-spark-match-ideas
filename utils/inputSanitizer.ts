
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false
  });
};

export const sanitizeForDisplay = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false
  });
};

export const validateAndSanitize = (
  input: string,
  maxLength: number = 1000
): { isValid: boolean; sanitized: string; error?: string } => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '', error: 'Invalid input' };
  }

  if (input.length > maxLength) {
    return { 
      isValid: false, 
      sanitized: input.substring(0, maxLength), 
      error: `Input too long (max ${maxLength} characters)` 
    };
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /[<>]/g
  ];

  if (dangerousPatterns.some(pattern => pattern.test(input))) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: 'Input contains potentially dangerous content' 
    };
  }

  const sanitized = sanitizeInput(input);
  return { isValid: true, sanitized };
};
