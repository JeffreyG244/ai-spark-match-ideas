import { motion } from 'framer-motion';

export default function Discover() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-8"
    >
      <motion.h1 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-4xl font-bold mb-6"
      >
        Discover Page
      </motion.h1>
      
      <motion.p
        initial={{ x: -50 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg"
      >
        Welcome to your animated discover page!
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
      >
        Click Me
      </motion.button>
    </motion.div>
  );
}
