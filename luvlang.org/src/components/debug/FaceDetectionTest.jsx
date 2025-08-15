import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const FaceDetectionTest = () => {
    const videoRef = useRef(null);
    const [status, setStatus] = useState('Click Start Test to begin');
    const [model, setModel] = useState(null);
    const [stream, setStream] = useState(null);
    const runTest = async () => {
        try {
            setStatus('Step 1: Requesting camera...');
            console.log('🧪 TEST: Requesting camera...');
            const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
            console.log('✅ TEST: Camera stream OK');
            setStream(testStream);
            if (videoRef.current) {
                videoRef.current.srcObject = testStream;
                await videoRef.current.play();
                setStatus('Step 2: Camera active, setting up AI...');
                await new Promise((resolve) => {
                    if (videoRef.current) {
                        videoRef.current.onloadedmetadata = () => {
                            console.log('✅ TEST: Video metadata loaded');
                            console.log('📐 TEST: Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
                            resolve();
                        };
                    }
                });
            }
            setStatus('Step 3: Setting TFJS backend...');
            console.log('🧪 TEST: Setting TFJS backend to WebGL...');
            try {
                await tf.setBackend('webgl');
                await tf.ready();
                console.log('✅ TEST: WebGL backend ready');
            }
            catch (webglError) {
                console.warn('⚠️ TEST: WebGL failed, using CPU:', webglError);
                await tf.setBackend('cpu');
                await tf.ready();
            }
            console.log('🔍 TEST: Current backend:', tf.getBackend());
            setStatus('Step 4: Loading face detection model...');
            console.log('🧪 TEST: Loading FaceMesh model...');
            const loadedModel = await faceLandmarksDetection.createDetector(faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh, {
                runtime: 'tfjs',
                refineLandmarks: false,
                maxFaces: 1
            });
            setModel(loadedModel);
            console.log('✅ TEST: Model loaded successfully');
            setStatus('Step 5: Testing face detection...');
            setTimeout(async () => {
                if (videoRef.current && loadedModel) {
                    try {
                        const faces = await loadedModel.estimateFaces(videoRef.current, {
                            flipHorizontal: false,
                            staticImageMode: false
                        });
                        console.log('🧪 TEST: Face detection result:', faces);
                        setStatus(`✅ Test complete! Found ${faces.length} face(s)`);
                    }
                    catch (detectionError) {
                        console.error('❌ TEST: Face detection failed:', detectionError);
                        setStatus('❌ Face detection test failed');
                    }
                }
            }, 2000);
        }
        catch (error) {
            console.error('❌ TEST: Error:', error);
            setStatus(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    const stopTest = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setModel(null);
        setStatus('Test stopped');
    };
    useEffect(() => {
        return () => stopTest();
    }, [stream]);
    return (<Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Face Detection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <video ref={videoRef} autoPlay playsInline muted className="w-full rounded border" style={{ transform: 'scaleX(-1)' }}/>
        
        <div className="text-sm font-medium p-2 bg-gray-100 rounded">
          Status: {status}
        </div>
        
        <div className="flex gap-2">
          <Button onClick={runTest} disabled={!!stream}>
            Start Test
          </Button>
          <Button onClick={stopTest} variant="outline">
            Stop Test
          </Button>
        </div>
        
        <div className="text-xs text-gray-600">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>);
};
export default FaceDetectionTest;
