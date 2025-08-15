
export const SECURITY_CONFIG = {
  // Rate limiting
  MESSAGE_RATE_LIMIT: 10, // messages per minute
  LOGIN_RATE_LIMIT: 5, // attempts per 5 minutes
  SIGNUP_RATE_LIMIT: 3, // attempts per hour
  
  // Session management
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  SESSION_REFRESH_THRESHOLD: 30 * 60 * 1000, // 30 minutes
  
  // File upload limits
  MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PHOTOS_PER_PROFILE: 6,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Content limits
  MAX_BIO_LENGTH: 500,
  MIN_BIO_LENGTH: 50,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_VALUES_LENGTH: 300,
  MAX_GOALS_LENGTH: 300,
  
  // Security thresholds
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
  
  // Device trust
  MAX_TRUSTED_DEVICES: 10,
  DEVICE_TRUST_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
  
  // Audit logging
  MAX_AUDIT_LOGS: 1000,
  SECURITY_LOG_RETENTION: 90 * 24 * 60 * 60 * 1000, // 90 days
  
  // Environment detection
  PRODUCTION_DOMAINS: ['yourdomain.com', 'app.yourdomain.com'],
  DEVELOPMENT_INDICATORS: ['localhost', '127.0.0.1', '.local', '.dev'],
  
  // Content filtering
  SPAM_SCORE_THRESHOLD: 2,
  INAPPROPRIATE_CONTENT_PATTERNS: [
    'contact.*me.*at',
    'instagram|snapchat|whatsapp|telegram',
    'money|bitcoin|crypto|investment',
    'cashapp|venmo|paypal'
  ]
} as const;

export type SecurityConfig = typeof SECURITY_CONFIG;
