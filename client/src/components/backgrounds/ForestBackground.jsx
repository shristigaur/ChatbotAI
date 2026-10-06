'use client';
import { motion } from 'framer-motion';

export default function ForestBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Falling Leaves */}
      {[...Array(12)].map((_, i) => (
        <motion.div 
          key={i}
          animate={{ 
            y: ['-10vh', '110vh'], 
            x: [0, Math.random() * 100 - 50, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 10 + 10, 
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute text-3xl opacity-60 mix-blend-multiply"
          style={{ left: `${Math.random() * 100}%`, top: '-50px' }}
        >
          {['🍂', '🍃', '🍁'][Math.floor(Math.random() * 3)]}
        </motion.div>
      ))}

      {/* Fireflies */}
      {[...Array(15)].map((_, i) => (
        <motion.div 
          key={`firefly-${i}`}
          animate={{ 
            y: [0, Math.random() * -40, 0], 
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 4 + 2, 
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
          className="absolute w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_15px_#fef08a]"
          style={{ 
            left: `${Math.random() * 100}%`, 
            bottom: `${Math.random() * 50}%` 
          }}
        />
      ))}
    </div>
  );
}
