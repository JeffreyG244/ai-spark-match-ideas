export const escapeHTML = (str) => {
    let p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
};
export const stripHTML = (html) => {
    let div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
};
export const removeEmojis = (text) => {
    const regex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu;
    return text.replace(regex, '');
};
export const validateProfileContent = (content, maxLength) => {
    let isValid = true;
    const errors = [];
    if (!content) {
        isValid = false;
        errors.push('Content cannot be empty.');
    }
    if (content.length > maxLength) {
        isValid = false;
        errors.push(`Content exceeds the maximum length of ${maxLength} characters.`);
    }
    const escapedContent = escapeHTML(content);
    if (escapedContent !== content) {
        isValid = false;
        errors.push('Content contains HTML or script tags.');
    }
    const strippedContent = stripHTML(content);
    if (strippedContent !== content) {
        isValid = false;
        errors.push('Content contains disallowed HTML.');
    }
    const emojiFreeContent = removeEmojis(content);
    if (emojiFreeContent !== content) {
        isValid = false;
        errors.push('Content contains emojis.');
    }
    const badWords = ['badword1', 'badword2', 'inappropriateword'];
    if (badWords.some(word => content.toLowerCase().includes(word))) {
        isValid = false;
        errors.push('Content contains inappropriate language.');
    }
    return { isValid, errors };
};
export const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string')
        return '';
    return input.trim().replace(/[<>]/g, '');
};
export const sanitizeForDisplay = (text) => {
    if (!text || typeof text !== 'string')
        return '';
    return escapeHTML(text);
};
export const isProductionEnvironment = () => {
    return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};
export const validateMessageContent = (content) => {
    return validateProfileContent(content, LIMITS.MESSAGE_MAX_LENGTH);
};
export const sanitizeInputAsync = async (input) => {
    return sanitizeInput(input);
};
export const logSecurityEvent = (event, details, severity = 'low') => {
    console.log(`Security Event [${severity}]: ${event}`, details);
};
export const rateLimiter = {
    check: (action) => ({ allowed: true, remainingRequests: 100 }),
    isAllowed: (action) => true
};
export const LIMITS = {
    MIN_BIO_LENGTH: 50,
    BIO_MAX_LENGTH: 500,
    VALUES_MAX_LENGTH: 300,
    GOALS_MAX_LENGTH: 300,
    GREEN_FLAGS_MAX_LENGTH: 300,
    MIN_FIELD_LENGTH: 50,
    MESSAGE_MAX_LENGTH: 1000, // Added for messaging
};
