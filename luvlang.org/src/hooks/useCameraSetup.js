import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { checkCameraSupport } from '@/utils/cameraValidation';
import { requestCameraPermission, setupVideo } from '@/utils/cameraPermissions';
import { setupTensorflow } from '@/utils/tensorflowSetup';
import { loadFaceModel, testModelWithVideo } from '@/utils/faceModelLoader';
export const useCameraSetup = () => {
    const videoRef = useRef(null);
    const [state, setState] = useState({
        status: 'Click Start Camera to begin',
        model: null,
        stream: null,
        error: null,
        retryCount: 0
    });
    const isProduction = process.env.NODE_ENV === 'production';
    const maxRetries = 3;
    const logToConsole = (message, data) => {
        const timestamp = new Date().toISOString();
        const logLevel = isProduction ? 'PROD' : 'DEV';
        console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
    };
    const performCameraSetup = useCallback(async (attemptNumber) => {
        logToConsole(`=== Starting camera setup process (Attempt ${attemptNumber}/${maxRetries}) ===`);
        if (!checkCameraSupport()) {
            throw new Error('Camera not supported in this browser');
        }
        try {
            setState(prev => ({
                ...prev,
                error: null,
                retryCount: attemptNumber,
                status: `Step 1/5: Requesting camera access... (Attempt ${attemptNumber}/${maxRetries})`
            }));
            logToConsole('=== STEP 1: Requesting camera permission ===');
            const stream = await requestCameraPermission();
            setState(prev => ({
                ...prev,
                stream,
                status: 'Step 2/5: Setting up video display...'
            }));
            logToConsole('=== STEP 2: Setting up video element ===');
            await setupVideo(stream, videoRef);
            setState(prev => ({
                ...prev,
                status: 'Step 3/5: Initializing AI backend...'
            }));
            logToConsole('=== STEP 3: Setting up TensorFlow ===');
            await setupTensorflow();
            setState(prev => ({
                ...prev,
                status: 'Step 4/5: Loading face detection model...'
            }));
            logToConsole('=== STEP 4: Loading face detection model ===');
            const model = await loadFaceModel();
            setState(prev => ({
                ...prev,
                model,
                status: 'Step 5/5: Testing face detection...'
            }));
            logToConsole('=== STEP 5: Testing face detection ===');
            await testModelWithVideo(model, videoRef);
            setState(prev => ({
                ...prev,
                status: '✅ Camera ready! Face detection active',
                retryCount: 0
            }));
            logToConsole('=== CAMERA SETUP COMPLETE ===');
            toast({
                title: 'Camera Ready',
                description: 'Face detection is now active. Position your face in the camera.',
            });
        }
        catch (error) {
            const errorMessage = error.message || 'Unknown camera error';
            logToConsole(`Camera setup failed on attempt ${attemptNumber}:`, error);
            throw new Error(errorMessage);
        }
    }, [videoRef, maxRetries, isProduction]);
    const startCamera = useCallback(async () => {
        const currentRetry = state.retryCount + 1;
        try {
            await performCameraSetup(currentRetry);
        }
        catch (error) {
            const errorMessage = error.message || 'Unknown camera error';
            setState(prev => ({ ...prev, error: errorMessage }));
            if (currentRetry < maxRetries) {
                const retryDelay = currentRetry * 1000;
                setState(prev => ({
                    ...prev,
                    status: `❌ ${errorMessage}. Retrying in ${retryDelay / 1000} seconds...`
                }));
                logToConsole(`Will retry in ${retryDelay}ms`);
                setTimeout(() => {
                    startCamera();
                }, retryDelay);
            }
            else {
                setState(prev => ({
                    ...prev,
                    status: `❌ Camera failed after ${maxRetries} attempts: ${errorMessage}`,
                    retryCount: 0
                }));
                toast({
                    title: 'Camera Error',
                    description: errorMessage,
                    variant: 'destructive'
                });
            }
        }
    }, [state.retryCount, performCameraSetup, maxRetries]);
    const stopCamera = useCallback(() => {
        logToConsole('Stopping camera...');
        if (state.stream) {
            state.stream.getTracks().forEach(track => {
                track.stop();
                logToConsole('Track stopped', { kind: track.kind, label: track.label });
            });
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setState({
            status: 'Camera stopped',
            model: null,
            stream: null,
            error: null,
            retryCount: 0
        });
        logToConsole('Camera stopped successfully');
    }, [state.stream]);
    useEffect(() => {
        return () => {
            if (state.stream) {
                state.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [state.stream]);
    return {
        videoRef,
        status: state.status,
        model: state.model,
        stream: state.stream,
        error: state.error,
        isRetrying: state.retryCount > 0,
        startCamera,
        stopCamera
    };
};
