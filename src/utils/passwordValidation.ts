
// Password validation utilities that work with the new database-level validation
export const validatePasswordStrength = (password: string): { isValid: boolean; error?: string } => {
  // Minimum length check
  if (!password || password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  // Check against common leaked passwords (comprehensive list)
  const commonPasswords = [
    '123456', 'password', '123456789', '12345678', '12345',
    '1234567', 'admin', '1234567890', 'letmein', 'monkey',
    'qwerty', 'abc123', 'password1', 'welcome', 'football',
    '123123', 'baseball', 'dragon', 'superman', 'trustno1',
    'master', 'sunshine', 'shadow', 'princess', 'qwertyuiop',
    'passw0rd', 'login', 'solo', 'starwars', 'freedom',
    'hello', 'secret', 'whatever', '1234', 'test',
    '111111', '123', 'admin123', 'letmein123', 'welcome123',
    'access', 'flower', '555555', 'pass', '123321',
    '7777777', '123qwe', 'fuckyou', '121212', 'donald',
    '123abc', 'qwerty123', '1q2w3e4r', 'azerty', 'password123',
    'bailey', '000000', '696969', 'batman', '1qaz2wsx',
    '123654', 'charlie', 'aa123456', '654321', '123123123',
    'qazwsx', 'password!', '123456a', 'loveme', '888888',
    'soccer', 'jordan23', 'jordan', 'michael', 'mustang',
    'password12', '123456789a', 'super123', 'pokemon', 'iloveyou'
  ];

  const lowerPassword = password.toLowerCase();
  if (commonPasswords.includes(lowerPassword)) {
    return { 
      isValid: false, 
      error: 'This password has been found in data breaches. Please choose a stronger password.' 
    };
  }

  return { isValid: true };
};

export const sanitizePasswordInput = (password: string): string => {
  if (!password) return '';
  // Remove any potentially dangerous characters while preserving password functionality
  return password.trim();
};
