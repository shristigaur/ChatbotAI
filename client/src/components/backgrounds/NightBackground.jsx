'use client';
import { motion } from 'framer-motion';

export default function NightBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Moon */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-12 right-20 text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]"
      >
        🌕
      </motion.div>
      
      {/* Twinkling Stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div 
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 3 + 2, 
            delay: Math.random() * 2 
          }}
          className="absolute bg-white rounded-full w-1 h-1"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
          }}
        />
      ))}

      {/* Occasional Shooting Star */}
      <motion.div 
        animate={{ x: [0, -1000], y: [0, 500], opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeOut", delay: 5 }}
        className="absolute top-10 right-10 w-32 h-1 bg-gradient-to-r from-transparent to-white rotate-45"
      />
    </div>
  );
}
