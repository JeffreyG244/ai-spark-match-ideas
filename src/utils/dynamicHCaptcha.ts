// Dynamic hCaptcha loader to reduce initial bundle size
let hCaptchaLoaded = false;
let hCaptchaPromise: Promise<void> | null = null;

export const loadHCaptcha = (): Promise<void> => {
  if (hCaptchaLoaded) {
    return Promise.resolve();
  }
  
  if (hCaptchaPromise) {
    return hCaptchaPromise;
  }
  
  hCaptchaPromise = new Promise((resolve, reject) => {
    // Check if hCaptcha is already loaded
    if ((window as any).hcaptcha) {
      hCaptchaLoaded = true;
      resolve();
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      hCaptchaLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load hCaptcha'));
    };
    
    // Add to head
    document.head.appendChild(script);
  });
  
  return hCaptchaPromise;
};