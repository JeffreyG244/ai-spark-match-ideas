import { useEffect } from 'react';
const SecurityHeaders = () => {
    useEffect(() => {
        // Set Content Security Policy
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.supabase.in; frame-ancestors 'none';";
        document.head.appendChild(meta);
        // Set X-Frame-Options
        const frameOptions = document.createElement('meta');
        frameOptions.httpEquiv = 'X-Frame-Options';
        frameOptions.content = 'DENY';
        document.head.appendChild(frameOptions);
        // Set X-Content-Type-Options
        const contentType = document.createElement('meta');
        contentType.httpEquiv = 'X-Content-Type-Options';
        contentType.content = 'nosniff';
        document.head.appendChild(contentType);
        return () => {
            document.head.removeChild(meta);
            document.head.removeChild(frameOptions);
            document.head.removeChild(contentType);
        };
    }, []);
    return null;
};
export default SecurityHeaders;
