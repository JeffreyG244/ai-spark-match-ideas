
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface SwipeActionsProps {
  onLike: () => void;
  onPass: () => void;
  disabled?: boolean;
}

const SwipeActions = ({ onLike, onPass, disabled = false }: SwipeActionsProps) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        onClick={onPass}
        disabled={disabled}
        className={`w-14 h-14 bg-white border-2 border-red-400/60 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-red-500 cursor-pointer hover:scale-110'
        }`}
      >
        <X className="h-6 w-6 text-red-500" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        onClick={onLike}
        disabled={disabled}
        className={`w-14 h-14 bg-gradient-to-r from-love-primary to-love-secondary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:from-love-primary/90 hover:to-love-secondary/90 cursor-pointer hover:scale-110'
        }`}
      >
        <Heart className="h-6 w-6 text-white" />
      </motion.button>
    </div>
  );
};

export default SwipeActions;
