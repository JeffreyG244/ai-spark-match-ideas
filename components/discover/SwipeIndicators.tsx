import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface SwipeIndicatorsProps {
  dragX: number;
  isVisible: boolean;
}

const SwipeIndicators = ({ dragX, isVisible }: SwipeIndicatorsProps) => {
  const likeOpacity = Math.max(0, Math.min(1, dragX / 100));
  const passOpacity = Math.max(0, Math.min(1, -dragX / 100));

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Like Indicator */}
      <motion.div
        className="absolute top-20 right-6 bg-emerald-500 text-white rounded-full p-4 shadow-2xl"
        style={{ opacity: likeOpacity }}
        animate={{ 
          scale: likeOpacity > 0.3 ? 1.2 : 1,
          rotate: likeOpacity > 0.5 ? 15 : 0
        }}
      >
        <Heart className="h-8 w-8 fill-current" />
      </motion.div>

      {/* Pass Indicator */}
      <motion.div
        className="absolute top-20 left-6 bg-red-500 text-white rounded-full p-4 shadow-2xl"
        style={{ opacity: passOpacity }}
        animate={{ 
          scale: passOpacity > 0.3 ? 1.2 : 1,
          rotate: passOpacity > 0.5 ? -15 : 0
        }}
      >
        <X className="h-8 w-8" />
      </motion.div>

      {/* Swipe Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
          {dragX > 50 ? '💚 Like' : dragX < -50 ? '💔 Pass' : 'Swipe Left/Right'}
        </div>
      </div>
    </div>
  );
};

export default SwipeIndicators;