export const requestCameraPermission = async () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const logToConsole = (message, data) => {
        const timestamp = new Date().toISOString();
        const logLevel = isProduction ? 'PROD' : 'DEV';
        console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
    };
    logToConsole('🧪 SIMPLE: Requesting camera...');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        logToConsole('✅ SIMPLE: Camera stream OK');
        return stream;
    }
    catch (error) {
        logToConsole('❌ SIMPLE: Camera permission failed', error);
        throw error;
    }
};
export const setupVideo = async (stream, videoRef) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const logToConsole = (message, data) => {
        const timestamp = new Date().toISOString();
        const logLevel = isProduction ? 'PROD' : 'DEV';
        console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
    };
    logToConsole('🧪 SIMPLE: Setting up video...');
    return new Promise((resolve, reject) => {
        if (videoRef.current) {
            const video = videoRef.current;
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                logToConsole('✅ SIMPLE: Video metadata loaded');
                logToConsole('📐 SIMPLE: Video dimensions:', `${video.videoWidth}x${video.videoHeight}`);
                video.play().then(() => {
                    resolve();
                }).catch((playError) => {
                    logToConsole('❌ SIMPLE: Video play failed', playError);
                    reject(new Error('Video play failed: ' + playError.message));
                });
            };
            video.onerror = (error) => {
                logToConsole('❌ SIMPLE: Video error', error);
                reject(new Error('Video playback failed'));
            };
        }
        else {
            reject(new Error('Video element not available'));
        }
    });
};
