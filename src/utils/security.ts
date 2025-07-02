
// Simplified and more reasonable security validation
export const LIMITS = {
  BIO_MAX_LENGTH: 500,
  MIN_BIO_LENGTH: 50,
  VALUES_MAX_LENGTH: 300,
  GOALS_MAX_LENGTH: 300,
  GREEN_FLAGS_MAX_LENGTH: 300,
};

export const containsInappropriateContent = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false;
  
  // Only flag truly inappropriate content - be much more permissive
  const reallyBadPatterns = [
    /\b(fuck|shit|damn|hell|ass|bitch|dick|cock|pussy|cunt)\b/gi,
    /\b(xxx|porn|sex for money|escort|prostitute)\b/gi,
    /\b(buy drugs|selling drugs|cocaine|heroin|meth)\b/gi,
  ];

  return reallyBadPatterns.some(pattern => pattern.test(content));
};

export const validateProfileContent = (content: string, maxLength: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!content) {
    return { isValid: true, errors: [] };
  }

  if (content.length > maxLength) {
    errors.push(`Content exceeds maximum length of ${maxLength} characters`);
  }

  if (containsInappropriateContent(content)) {
    errors.push('Content contains inappropriate language');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const logSecurityEvent = (eventType: string, details: string, severity: string) => {
  // Simple logging - don't block user actions
  console.log(`Security Event: ${eventType}`, { details, severity });
};
