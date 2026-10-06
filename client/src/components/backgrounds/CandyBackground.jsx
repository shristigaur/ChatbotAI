'use client';
import { motion } from 'framer-motion';

export default function CandyBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Floating Candies */}
      {[...Array(8)].map((_, i) => (
        <motion.div 
          key={`candy-${i}`}
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 4 + 4, 
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
          className="absolute text-5xl opacity-40 mix-blend-overlay"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%` 
          }}
        >
          {['🍬', '🍭', '🧁'][Math.floor(Math.random() * 3)]}
        </motion.div>
      ))}

      {/* Rising Balloons */}
      {[...Array(5)].map((_, i) => (
        <motion.div 
          key={`balloon-${i}`}
          animate={{ 
            y: ['110vh', '-20vh'],
            x: [0, Math.random() * 60 - 30, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 15 + 15, 
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute text-7xl opacity-50"
          style={{ 
            left: `${Math.random() * 100}%`, 
            bottom: '-100px' 
          }}
        >
          🎈
        </motion.div>
      ))}
    </div>
  );
}
