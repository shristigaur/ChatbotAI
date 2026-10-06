'use client';
import { motion } from 'framer-motion';

export default function SunsetBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Setting Sun */}
      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500 rounded-full blur-xl opacity-60"
      />
      
      {/* Flying Birds */}
      <motion.div 
        animate={{ x: ['100vw', '-20vw'], y: [100, 50] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="absolute top-32 right-0 text-4xl opacity-70 flex gap-4"
      >
        <span className="mt-4">🦅</span>
        <span>🦅</span>
      </motion.div>
    </div>
  );
}
