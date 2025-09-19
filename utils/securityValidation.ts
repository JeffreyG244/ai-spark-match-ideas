
import { logSecurityEvent } from './security';

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateProfileData = (profileData: any): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!profileData.email || typeof profileData.email !== 'string') {
    errors.push('Valid email is required');
  }

  // Validate email format
  if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
    errors.push('Invalid email format');
  }

  // Validate bio length and content
  if (profileData.bio) {
    if (profileData.bio.length > 500) {
      errors.push('Bio must be 500 characters or less');
    }
    
    if (profileData.bio.length < 50) {
      warnings.push('Bio should be at least 50 characters for better matches');
    }

    // Check for suspicious content
    const suspiciousPatterns = [
      /contact.*me.*at/i,
      /my.*instagram/i,
      /snapchat/i,
      /telegram/i,
      /whatsapp/i,
      /\$\d+/,
      /bitcoin|crypto/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(profileData.bio))) {
      errors.push('Bio contains inappropriate content');
      logSecurityEvent('inappropriate_bio_content', `Suspicious bio content detected`, 'medium');
    }
  }

  // Validate photos
  if (profileData.photos && Array.isArray(profileData.photos)) {
    if (profileData.photos.length > 6) {
      errors.push('Maximum 6 photos allowed');
    }

    profileData.photos.forEach((photo: string, index: number) => {
      if (!photo || typeof photo !== 'string') {
        errors.push(`Photo ${index + 1} is invalid`);
      } else if (!photo.startsWith('https://')) {
        errors.push(`Photo ${index + 1} must use HTTPS`);
      }
    });
  }

  // Validate age (if provided)
  if (profileData.age !== undefined) {
    const age = Number(profileData.age);
    if (!Number.isInteger(age) || age < 18 || age > 100) {
      errors.push('Age must be between 18 and 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateMessageSecurity = (content: string, userId: string): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!content || content.trim().length === 0) {
    errors.push('Message cannot be empty');
    return { isValid: false, errors, warnings };
  }

  if (content.length > 1000) {
    errors.push('Message too long (max 1000 characters)');
  }

  // Security checks
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /[<>]/g
  ];

  if (dangerousPatterns.some(pattern => pattern.test(content))) {
    errors.push('Message contains potentially dangerous content');
    logSecurityEvent('dangerous_message_content', `User ${userId} attempted XSS`, 'high');
  }

  // Spam detection
  const spamPatterns = [
    /(.)\1{5,}/g, // Repeated characters
    /[A-Z]{15,}/g, // Excessive caps
    /https?:\/\//gi, // URLs
    /\b\d{10,}\b/g, // Long numbers (phone numbers)
    /@\w+\.(com|net|org)/gi, // Email addresses
  ];

  const spamCount = spamPatterns.reduce((count, pattern) => {
    return count + (pattern.test(content) ? 1 : 0);
  }, 0);

  if (spamCount >= 2) {
    errors.push('Message appears to be spam');
    logSecurityEvent('spam_message_detected', `User ${userId} sent spam-like message`, 'medium');
  }

  // Check for inappropriate content
  const inappropriatePatterns = [
    /\b(instagram|snapchat|whatsapp|telegram|kik)\b/i,
    /\b(cashapp|venmo|paypal|bank|account)\b/i,
    /\b(money|bitcoin|crypto|investment)\b/i,
  ];

  if (inappropriatePatterns.some(pattern => pattern.test(content))) {
    warnings.push('Message may contain inappropriate contact information');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateFileUpload = (file: File): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File too large. Maximum size is 5MB');
  }

  // Check filename for suspicious patterns
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|scr|pif|com)$/i,
    /[<>:"|?*]/,
    /\.\./
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('Suspicious filename detected');
    logSecurityEvent('suspicious_filename', `Suspicious file upload attempted: ${file.name}`, 'high');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
