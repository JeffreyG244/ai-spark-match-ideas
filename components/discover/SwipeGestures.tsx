import React from 'react';
import { motion } from 'framer-motion';

interface SwipeGesturesProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  swipeDirection: 'like' | 'pass' | null;
  cardIndex: number;
}

const SwipeGestures = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  swipeDirection, 
  cardIndex 
}: SwipeGesturesProps) => {
  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    const velocity = Math.abs(info.velocity.x);
    
    if (info.offset.x > threshold || (velocity > 500 && info.offset.x > 50)) {
      onSwipeRight();
    } else if (info.offset.x < -threshold || (velocity > 500 && info.offset.x < -50)) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      key={cardIndex}
      initial={{ 
        scale: 0.9, 
        opacity: 0, 
        rotateY: 15,
        y: 20
      }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        rotateY: 0,
        y: 0
      }}
      exit={{ 
        scale: 0.7, 
        opacity: 0,
        x: swipeDirection === 'like' ? 500 : swipeDirection === 'pass' ? -500 : 0,
        rotate: swipeDirection === 'like' ? 25 : swipeDirection === 'pass' ? -25 : 0,
        transition: { 
          duration: 0.5, 
          ease: "easeInOut",
          type: "spring",
          stiffness: 200
        }
      }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      drag="x"
      dragConstraints={{ left: -150, right: 150 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ 
        rotate: 12, 
        scale: 1.08,
        cursor: 'grabbing',
        zIndex: 20,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      style={{
        x: 0,
        rotate: 0
      }}
      className="absolute w-full cursor-grab active:cursor-grabbing"
    >
      {children}
    </motion.div>
  );
};

export default SwipeGestures;