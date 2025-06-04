import { logSecurityEventToDB } from './enhancedSecurity';

export const logSecurityEvent = async (
  eventType: string,
  details: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): Promise<void> => {
  // Use the new centralized logging system
  await logSecurityEventToDB(eventType, details, severity);
  
  // Keep fallback to localStorage for compatibility
  try {
    const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    const newLog = {
      type: eventType,
      details,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    existingLogs.push(newLog);
    
    // Keep only last 100 entries in localStorage as fallback
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('security_logs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Fallback security logging failed:', error);
  }
};

export const isProductionEnvironment = (): boolean => {
  try {
    const host = window.location.hostname;
    return host !== 'localhost' && 
           !host.includes('127.0.0.1') && 
           !host.includes('.local') &&
           !host.includes('192.168.') &&
           !host.includes('10.') &&
           !host.endsWith('.dev');
  } catch (e) {
    return true;
  }
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
};

export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const detectSuspiciousPatterns = (content: string): string[] => {
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
};

export const enforceContentPolicy = async (content: string, contentType: string): Promise<{ allowed: boolean; reason?: string }> => {
  const suspiciousPatterns = detectSuspiciousPatterns(content);
  
  if (suspiciousPatterns.length > 0) {
    await logSecurityEvent(
      'content_policy_violation',
      `Suspicious patterns detected in ${contentType}: ${suspiciousPatterns.join(', ')}`,
      'medium'
    );
    
    return {
      allowed: false,
      reason: `Content contains prohibited patterns: ${suspiciousPatterns.join(', ')}`
    };
  }
  
  if (content.length > 2000) {
    await logSecurityEvent(
      'content_length_violation',
      `Content exceeds maximum length for ${contentType}`,
      'low'
    );
    
    return {
      allowed: false,
      reason: 'Content exceeds maximum allowed length'
    };
  }
  
  return { allowed: true };
};
