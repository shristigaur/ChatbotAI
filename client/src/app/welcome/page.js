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
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-start overflow-x-hidden bg-sky-100 px-3 pb-6 pt-20 font-sans sm:justify-center sm:px-4 sm:py-16">
      
      {/* Top Progress Bar */}
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-1/2 h-3 w-[min(16rem,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-full bg-sky-200 shadow-inner sm:top-8 sm:h-4">
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
            className="flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border-4 border-sky-100 bg-white p-5 shadow-2xl sm:gap-6 sm:p-8"
          >
            <h1 className="mb-2 text-center text-3xl font-bold text-sky-500 sm:text-4xl">Hi! What's your name?</h1>
            <input 
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Type here..."
              className="min-h-14 w-full rounded-2xl border-4 border-sky-200 p-3 text-center text-2xl font-bold text-gray-700 shadow-inner transition-colors placeholder:text-sky-200 focus:border-sky-400 focus:outline-none sm:p-4 sm:text-3xl"
              autoFocus
            />
            <button 
              onClick={nextStep}
              disabled={!name.trim()}
              className="mt-2 min-h-14 w-full rounded-2xl bg-green-400 py-3 text-2xl font-bold text-white shadow-lg shadow-green-200 transition-all hover:bg-green-500 active:scale-95 disabled:bg-gray-300 disabled:shadow-none sm:py-4 sm:text-3xl"
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
            className="flex w-full max-w-xl flex-col items-center gap-4 rounded-3xl border-4 border-purple-100 bg-white p-5 shadow-2xl sm:gap-6 sm:p-8"
          >
            <h1 className="mb-2 text-center text-3xl font-bold text-purple-500 sm:text-4xl">How old are you?</h1>
            <div className="grid w-full grid-cols-4 justify-items-center gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
              {Array.from({length: 13}, (_, i) => i + 3).map(num => (
                <button
                  key={num}
                  onClick={() => {
                    setAge(num);
                    nextStep();
                  }}
                  className="h-14 w-14 rounded-2xl bg-purple-400 text-2xl font-bold text-white shadow-lg shadow-purple-200 transition-all hover:scale-110 hover:bg-purple-500 active:scale-95 sm:h-20 sm:w-20 sm:text-3xl"
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
            className="flex w-full max-w-2xl flex-col items-center gap-4 rounded-3xl border-4 border-orange-100 bg-white p-5 shadow-2xl sm:gap-6 sm:p-8"
          >
            <h1 className="mb-2 text-center text-3xl font-bold text-orange-500 sm:text-4xl">What do you love most?</h1>
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
                  className={`flex min-h-32 flex-col items-center justify-center rounded-3xl p-3 text-white shadow-lg transition-all hover:-translate-y-2 hover:brightness-110 active:translate-y-0 sm:min-h-44 sm:p-6 ${opt.color} ${opt.shadow}`}
                >
                  <span className="mb-2 text-5xl drop-shadow-md sm:mb-4 sm:text-7xl">{opt.emoji}</span>
                  <span className="text-lg font-bold sm:text-2xl">{opt.label}</span>
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
            className="flex w-full max-w-4xl flex-col items-center gap-4 rounded-3xl border-4 border-rose-100 bg-white p-4 shadow-2xl sm:gap-6 sm:p-8"
          >
            <h1 className="mb-2 text-center text-3xl font-bold text-rose-500 sm:text-4xl">Pick your favorite!</h1>
            
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center my-16">
                <div className="text-3xl font-bold text-rose-400 animate-bounce tracking-wide mb-4">
                  Getting ready... ✨
                </div>
              </div>
            ) : (
              <div className="grid w-full max-h-[62dvh] grid-cols-2 gap-3 overflow-y-auto p-2 custom-scrollbar sm:grid-cols-3 sm:gap-6 sm:p-4">
                {characters.filter(c => c.type === favoriteType).map(char => (
                  <button
                    key={char.id}
                    onClick={() => handleFinish(char.id)}
                    className="group relative flex min-h-28 flex-col items-center justify-center rounded-3xl border-4 bg-gray-50 p-3 shadow-md transition-all hover:scale-105 hover:bg-white hover:shadow-xl active:scale-95 sm:min-h-40 sm:p-6"
                    style={{ borderColor: char.mainColor }}
                  >
                    <span className="mb-2 text-5xl drop-shadow-sm transition-transform group-hover:scale-110 sm:mb-4 sm:text-7xl">{char.emoji}</span>
                    <span className="text-lg font-bold sm:text-2xl" style={{ color: char.mainColor }}>{char.label}</span>
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
