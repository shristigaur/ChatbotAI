'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { characters } from '@/data/characters';
import { api } from '@/lib/api';
import confetti from 'canvas-confetti';

export default function WelcomeWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [favoriteType, setFavoriteType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep(s => s + 1);

  const handleFinish = async (charId) => {
    setIsSubmitting(true);
    
    try {
      const { token } = await api.createProfile({
        name,
        age: parseInt(age, 10),
        favoriteType,
        favoriteCharacter: charId
      });
      
      // Save token and redirect
      localStorage.setItem('funny_token', token);
      
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F1C', '#A05195']
      });

      setTimeout(() => {
        router.push('/chat');
      }, 2000);
    } catch (err) {
      alert("Oops! Something went wrong. Let's try again.");
      setIsSubmitting(false);
    }
  };

  // Slide animation variants for framer-motion
  const slideVariants = {
    initial: { x: 300, opacity: 0 },
    in: { x: 0, opacity: 1 },
    out: { x: -300, opacity: 0 }
  };

  const slideTransition = {
    type: 'spring',
    stiffness: 260,
    damping: 20
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-sky-100 flex flex-col items-center justify-center font-sans">
      
      {/* Top Progress Bar */}
      <div className="absolute top-8 w-64 h-4 bg-sky-200 rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-yellow-400 transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Name Input */}
        {step === 1 && (
          <motion.div 
            key="step1"
            variants={slideVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={slideTransition}
            className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl shadow-2xl w-11/12 max-w-md border-4 border-sky-100"
          >
            <h1 className="text-4xl font-bold text-center text-sky-500 mb-2">Hi! What's your name?</h1>
            <input 
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Type here..."
              className="text-3xl text-center p-4 w-full border-4 border-sky-200 rounded-2xl focus:outline-none focus:border-sky-400 font-bold text-gray-700 placeholder-sky-200 shadow-inner transition-colors"
              autoFocus
            />
            <button 
              onClick={nextStep}
              disabled={!name.trim()}
              className="w-full py-4 mt-2 text-3xl font-bold text-white bg-green-400 hover:bg-green-500 disabled:bg-gray-300 disabled:shadow-none rounded-2xl transition-all shadow-lg shadow-green-200 active:scale-95"
            >
              Next ➔
            </button>
          </motion.div>
        )}

        {/* STEP 2: Age Selection */}
        {step === 2 && (
          <motion.div 
            key="step2"
            variants={slideVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={slideTransition}
            className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl shadow-2xl w-11/12 max-w-xl border-4 border-purple-100"
          >
            <h1 className="text-4xl font-bold text-center text-purple-500 mb-2">How old are you?</h1>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({length: 13}, (_, i) => i + 3).map(num => (
                <button
                  key={num}
                  onClick={() => {
                    setAge(num);
                    nextStep();
                  }}
                  className="w-20 h-20 text-3xl font-bold text-white bg-purple-400 hover:bg-purple-500 hover:scale-110 active:scale-95 rounded-2xl transition-all shadow-lg shadow-purple-200 flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Favorite Type */}
        {step === 3 && (
          <motion.div 
            key="step3"
            variants={slideVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={slideTransition}
            className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl shadow-2xl w-11/12 max-w-2xl border-4 border-orange-100"
          >
            <h1 className="text-4xl font-bold text-center text-orange-500 mb-2">What do you love most?</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {[
                { type: 'animal', label: 'Animals', emoji: '🐶', color: 'bg-amber-400', shadow: 'shadow-amber-200' },
                { type: 'bird', label: 'Birds', emoji: '🦜', color: 'bg-green-400', shadow: 'shadow-green-200' },
                { type: 'dinosaur', label: 'Dinosaurs', emoji: '🦖', color: 'bg-lime-500', shadow: 'shadow-lime-200' },
                { type: 'cartoon', label: 'Cartoons', emoji: '🧚', color: 'bg-pink-400', shadow: 'shadow-pink-200' }
              ].map(opt => (
                <button
                  key={opt.type}
                  onClick={() => {
                    setFavoriteType(opt.type);
                    nextStep();
                  }}
                  className={`flex flex-col items-center justify-center p-6 ${opt.color} hover:brightness-110 hover:-translate-y-2 active:translate-y-0 rounded-3xl transition-all shadow-lg ${opt.shadow} text-white`}
                >
                  <span className="text-7xl mb-4 drop-shadow-md">{opt.emoji}</span>
                  <span className="text-2xl font-bold">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Character Grid */}
        {step === 4 && (
          <motion.div 
            key="step4"
            variants={slideVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={slideTransition}
            className="flex flex-col items-center gap-6 p-8 bg-white rounded-3xl shadow-2xl w-11/12 max-w-4xl border-4 border-rose-100"
          >
            <h1 className="text-4xl font-bold text-center text-rose-500 mb-2">Pick your favorite!</h1>
            
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center my-16">
                <div className="text-3xl font-bold text-rose-400 animate-bounce tracking-wide mb-4">
                  Getting ready... ✨
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                {characters.filter(c => c.type === favoriteType).map(char => (
                  <button
                    key={char.id}
                    onClick={() => handleFinish(char.id)}
                    className="group relative flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-white hover:scale-105 active:scale-95 rounded-3xl transition-all shadow-md hover:shadow-xl border-4"
                    style={{ borderColor: char.mainColor }}
                  >
                    <span className="text-7xl mb-4 transition-transform group-hover:scale-110 drop-shadow-sm">{char.emoji}</span>
                    <span className="text-2xl font-bold" style={{ color: char.mainColor }}>{char.label}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
