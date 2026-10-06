'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { characters } from '@/data/characters';

export default function Character({ 
  characterId, 
  outfit = 'day', 
  mood = 'idle', 
  size = 120 
}) {
  const prefersReducedMotion = useReducedMotion();
  
  // Find character data or fallback
  const character = characters.find(c => c.id === characterId) || characters[0];
  
  // --- Animation Variants ---
  
  // Main body container animations based on mood
  const bodyVariants = {
    idle: {
      y: prefersReducedMotion ? 0 : [0, -10, 0],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
    },
    thinking: {
      rotate: prefersReducedMotion ? 0 : [0, 5, -5, 0],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
    },
    happy: {
      y: prefersReducedMotion ? 0 : [0, -30, 0],
      transition: { repeat: Infinity, duration: 0.6, ease: "easeOut" }
    },
    talking: {
      y: prefersReducedMotion ? 0 : [0, -5, 0],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
    }
  };

  // Eyes blink animation (runs independently of mood)
  const eyesVariants = {
    blink: {
      scaleY: [1, 1, 0.1, 1, 1],
      transition: {
        repeat: Infinity,
        duration: 4,
        times: [0, 0.95, 0.97, 1, 1],
        ease: "linear"
      }
    }
  };

  // Mouth talking animation
  const mouthVariants = {
    talking: {
      scaleY: [1, 1.8, 1],
      transition: { repeat: Infinity, duration: 0.4, ease: "easeInOut" }
    },
    idle: { scaleY: 1 },
    thinking: { scaleY: 0.8 },
    happy: { scaleY: 1.2 }
  };

  // --- Outfit mapping ---
  // Rendered as a separate layer on top so it can be swapped independently
  const getOutfitAccessory = () => {
    switch(outfit) {
      case 'night': return '💤'; // Sleepy/pajamas proxy
      case 'beach': return '🕶️'; // Sunglasses
      case 'winter': return '🧣'; // Scarf
      case 'party': return '🥳'; // Party hat
      case 'day':
      default: return '👕'; // T-shirt proxy
    }
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-end" 
      style={{ 
        width: `${size}px`, 
        height: `${size + 40}px`,
      }}
    >
      {/* "Thinking" Bubble Layer */}
      {mood === 'thinking' && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -top-8 -right-4 bg-white border-2 border-gray-200 rounded-3xl rounded-bl-none p-3 shadow-md z-20 flex gap-1"
        >
          <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} />
          <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
          <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} />
        </motion.div>
      )}

      {/* Main Character Body Layer */}
      <motion.div
        variants={bodyVariants}
        animate={mood}
        className="relative z-10 flex flex-col items-center justify-center w-full h-full"
      >
        {/* Outfit Layer */}
        <div className="absolute -top-4 right-0 z-20 text-4xl drop-shadow-md pointer-events-none" style={{ transform: 'rotate(15deg)' }}>
          {getOutfitAccessory()}
        </div>
        
        {/* Base Character Art (Emoji Placeholder for now) */}
        <div 
          className="relative z-10 flex items-center justify-center"
          style={{ 
            fontSize: `${size * 0.7}px`,
            lineHeight: 1,
            textShadow: `0 8px 24px ${character.mainColor}50` 
          }}
        >
          {character.emoji}
        </div>
        
        {/* Animated Face Features Overlay (Eyes/Mouth)
            In the future, when replacing with SVG, these motions apply to specific <path> IDs */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
          
          {/* Eyes */}
          <motion.div 
            variants={prefersReducedMotion ? {} : eyesVariants} 
            animate="blink"
            className="flex gap-6 -mt-4 opacity-90 mix-blend-multiply"
          >
            <div className="w-4 h-4 bg-gray-800 rounded-full shadow-inner"></div>
            <div className="w-4 h-4 bg-gray-800 rounded-full shadow-inner"></div>
          </motion.div>
          
          {/* Mouth */}
          <motion.div 
            variants={prefersReducedMotion ? {} : mouthVariants}
            animate={mood}
            className="mt-4 w-6 h-3 bg-rose-400 rounded-full opacity-90 shadow-inner"
          ></motion.div>

        </div>
      </motion.div>
      
      {/* Floor Shadow Animation */}
      <motion.div 
        animate={{ 
          scale: mood === 'happy' ? (prefersReducedMotion ? 1 : 0.6) : 1,
          opacity: mood === 'happy' ? (prefersReducedMotion ? 0.6 : 0.2) : 0.6
        }}
        className="w-3/4 h-6 bg-black/10 rounded-[50%] blur-md absolute bottom-0 z-0"
      />
    </div>
  );
}
