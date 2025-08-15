// Enhanced password validation utilities that work with the database-level validation
export const validatePasswordStrength = (password) => {
    console.log('Validating password strength, length:', password?.length);
    // Check if password exists
    if (!password) {
        return { isValid: false, error: 'Password is required' };
    }
    // Minimum length check (must match database trigger requirement)
    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters long' };
    }
    // Maximum reasonable length check
    if (password.length > 128) {
        return { isValid: false, error: 'Password must be less than 128 characters long' };
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
    // Check for basic password patterns that are too simple
    if (/^(.)\1+$/.test(password)) {
        return {
            isValid: false,
            error: 'Password cannot be all the same character.'
        };
    }
    // Check for simple keyboard patterns
    const keyboardPatterns = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];
    for (const pattern of keyboardPatterns) {
        if (lowerPassword.includes(pattern) || lowerPassword.includes(pattern.split('').reverse().join(''))) {
            return {
                isValid: false,
                error: 'Password cannot contain keyboard patterns.'
            };
        }
    }
    console.log('Password validation passed');
    return { isValid: true };
};
export const sanitizePasswordInput = (password) => {
    if (!password)
        return '';
    // Remove any potentially dangerous characters while preserving password functionality
    // Trim whitespace but preserve internal spaces if any
    return password.trim();
};
