import React from 'react';
import { motion } from 'framer-motion';
import AuthFormContainer from '@/components/auth/AuthFormContainer';

const Auth = () => {
  return (
    <div className="min-h-screen bg-love-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <AuthFormContainer />
      </motion.div>
    </div>
  );
};

export default Auth;