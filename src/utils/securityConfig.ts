
export const SECURITY_CONFIG = {
  // Rate limiting
  MESSAGE_RATE_LIMIT: 10, // messages per minute
  LOGIN_RATE_LIMIT: 5, // attempts per 5 minutes
  SIGNUP_RATE_LIMIT: 3, // attempts per hour
  
  // Session management - Enhanced security
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours in milliseconds (reduced from 24h)
  SESSION_REFRESH_THRESHOLD: 15 * 60 * 1000, // 15 minutes (reduced from 30m)
  
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
  
  // Security thresholds - Enhanced
  MAX_LOGIN_ATTEMPTS: 3, // Reduced from 5
  ACCOUNT_LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes (increased from 15m)
  SUSPICIOUS_ACTIVITY_THRESHOLD: 2, // Reduced from 3
  FAILED_ATTEMPTS_WINDOW: 15 * 60 * 1000, // 15 minutes window for tracking attempts
  
  // Device trust
  MAX_TRUSTED_DEVICES: 10,
  DEVICE_TRUST_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
  
  // Audit logging
  MAX_AUDIT_LOGS: 1000,
  SECURITY_LOG_RETENTION: 90 * 24 * 60 * 60 * 1000, // 90 days
  
  // Environment detection
  PRODUCTION_DOMAINS: ['yourdomain.com', 'app.yourdomain.com'],
  DEVELOPMENT_INDICATORS: ['localhost', '127.0.0.1', '.local', '.dev'],
  
  // Content filtering - Enhanced patterns
  SPAM_SCORE_THRESHOLD: 2,
  INAPPROPRIATE_CONTENT_PATTERNS: [
    'contact.*me.*at',
    'instagram|snapchat|whatsapp|telegram',
    'money|bitcoin|crypto|investment',
    'cashapp|venmo|paypal',
    'sugar.*daddy|sugar.*baby',
    'escort|prostitute',
    'nude|naked|sex.*chat',
    'onlyfans|cam.*girl'
  ],
  
  // Enhanced security settings
  PASSWORD_MIN_SCORE: 5,
  MAX_FAILED_LOGINS: 3,
  DEVICE_FINGERPRINT_REQUIRED: true,
  ENABLE_BREACH_DETECTION: true
} as const;

export type SecurityConfig = typeof SECURITY_CONFIG;
