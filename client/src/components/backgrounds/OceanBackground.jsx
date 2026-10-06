'use client';
import { motion } from 'framer-motion';

export default function OceanBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden flex flex-col justify-end">
      {/* Bubbles Rising */}
      {[...Array(15)].map((_, i) => (
        <motion.div 
          key={i}
          animate={{ y: ['100vh', '-10vh'], opacity: [0, 0.6, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 5 + 5, 
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute bg-white/30 rounded-full border border-white/40"
          style={{
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
            left: `${Math.random() * 100}%`,
            bottom: '-20px'
          }}
        />
      ))}

      {/* Swimming Fish */}
      <motion.div 
        animate={{ x: ['-20vw', '100vw'], y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        className="absolute top-1/2 left-0 text-6xl opacity-50"
      >
        🐠
      </motion.div>
      <motion.div 
        animate={{ x: ['100vw', '-20vw'], y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "easeInOut", delay: 5 }}
        className="absolute top-1/3 right-0 text-5xl opacity-40 -scale-x-100"
      >
        🐡
      </motion.div>
    </div>
  );
}
