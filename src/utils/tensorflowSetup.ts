
import * as tf from '@tensorflow/tfjs';

export const setupTensorflow = async (): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const logToConsole = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLevel = isProduction ? 'PROD' : 'DEV';
    console.log(`[${timestamp}] ${logLevel}: ${message}`, data || '');
  };

  logToConsole('Setting up TensorFlow backend...');
  
  try {
    try {
      logToConsole('Attempting WebGL backend...');
      await tf.setBackend('webgl');
      await tf.ready();
      logToConsole('WebGL backend ready successfully');
    } catch (webglError) {
      logToConsole('WebGL failed, falling back to CPU backend', webglError);
      await tf.setBackend('cpu');
      await tf.ready();
      logToConsole('CPU backend ready');
    }
    
    const currentBackend = tf.getBackend();
    logToConsole('TensorFlow backend active:', currentBackend);
    
    if (!currentBackend) {
      throw new Error('No TensorFlow backend available');
    }
    
  } catch (error) {
    logToConsole('TensorFlow setup completely failed', error);
    throw new Error('AI backend initialization failed: ' + (error as Error).message);
  }
};
