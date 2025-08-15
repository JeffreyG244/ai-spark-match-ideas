export const validateFaceDetection = (faces, detectionAttempts) => {
    console.log(`👥 Detection result: ${faces.length} faces found`);
    if (faces.length > 0) {
        const face = faces[0];
        console.log('😊 Face detected with keypoints:', face.keypoints?.length || 0);
        if (face.keypoints && face.keypoints.length >= 5) {
            if (face.box) {
                const faceSize = Math.min(face.box.width, face.box.height);
                console.log('📏 Face size:', faceSize);
                if (faceSize > 80) {
                    return {
                        faceDetected: true,
                        instruction: '✅ Perfect! Face detected clearly. Ready to capture.',
                        shouldResetAttempts: true
                    };
                }
                else {
                    return {
                        faceDetected: false,
                        instruction: '📏 Face too small - move closer to the camera',
                        shouldResetAttempts: false
                    };
                }
            }
            else {
                return {
                    faceDetected: true,
                    instruction: '✅ Face detected! Ready to capture.',
                    shouldResetAttempts: true
                };
            }
        }
        else {
            return {
                faceDetected: false,
                instruction: '👤 Face partially detected - adjust position',
                shouldResetAttempts: false
            };
        }
    }
    else {
        if (detectionAttempts > 15) {
            return {
                faceDetected: false,
                instruction: '🔄 Having trouble detecting face - try better lighting or restart camera',
                shouldResetAttempts: false
            };
        }
        else {
            return {
                faceDetected: false,
                instruction: '👁️ No face detected - look directly at the camera',
                shouldResetAttempts: false
            };
        }
    }
};
export const performFaceDetection = async (detector, video) => {
    try {
        // Use the correct API for the loaded model
        const faces = await detector.estimateFaces(video, {
            flipHorizontal: false,
            staticImageMode: false
        });
        return faces;
    }
    catch (error) {
        console.error('❌ Face detection error:', error);
        throw error;
    }
};
