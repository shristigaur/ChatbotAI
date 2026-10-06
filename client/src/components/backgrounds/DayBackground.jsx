'use client';
import { motion } from 'framer-motion';

export default function DayBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Sun */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full shadow-[0_0_60px_rgba(253,224,71,0.8)]"
      />
      
      {/* Drifting Clouds */}
      <motion.div 
        animate={{ x: ['-100%', '100vw'] }}
        transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
        className="absolute top-20 left-0 text-9xl opacity-60 mix-blend-overlay"
      >
        ☁️
      </motion.div>
      <motion.div 
        animate={{ x: ['100vw', '-100%'] }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute top-40 right-0 text-8xl opacity-40 mix-blend-overlay"
      >
        ☁️
      </motion.div>

      {/* Butterflies */}
      <motion.div 
        animate={{ y: [0, -20, 0], x: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute bottom-40 left-32 text-4xl"
      >
        🦋
      </motion.div>
    </div>
  );
}
