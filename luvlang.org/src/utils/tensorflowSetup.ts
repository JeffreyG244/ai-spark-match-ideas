
import * as tf from '@tensorflow/tfjs';

export const setupTensorflow = async (): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

  logToConsole('🧪 SIMPLE: Setting TFJS backend to WebGL...');
  
  try {
    await tf.setBackend('webgl');
    await tf.ready();
    logToConsole('✅ SIMPLE: WebGL backend ready');
  } catch (webglError) {
    logToConsole('⚠️ SIMPLE: WebGL failed, using CPU:', webglError);
    await tf.setBackend('cpu');
    await tf.ready();
  }
  
  logToConsole('🔍 SIMPLE: Current backend:', tf.getBackend());
  
  if (!tf.getBackend()) {
    throw new Error('No TensorFlow backend available');
  }
};
