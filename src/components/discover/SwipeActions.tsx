
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface SwipeActionsProps {
  onLike: () => void;
  onPass: () => void;
}

const SwipeActions = ({ onLike, onPass }: SwipeActionsProps) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onPass}
        className="w-14 h-14 bg-white border-2 border-red-300 rounded-full flex items-center justify-center shadow-lg hover:border-red-400 transition-colors"
      >
        <X className="h-6 w-6 text-red-500" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
      >
        <Heart className="h-6 w-6 text-white" />
      </motion.button>
    </div>
  );
};

export default SwipeActions;
