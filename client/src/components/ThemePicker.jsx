'use client';
import { useTheme } from './ThemeProvider';
import { themes } from '@/data/themes';
import { motion } from 'framer-motion';

export default function ThemePicker() {
  const { themeId, changeTheme } = useTheme();

  return (
    <div className="box-border flex w-full max-w-full flex-wrap justify-center gap-2 overflow-x-hidden p-3 items-center bg-black/5 rounded-3xl backdrop-blur-sm">
      {Object.values(themes).map(theme => {
        const isSelected = theme.id === themeId;
        return (
          <motion.button
            key={theme.id}
            onClick={() => changeTheme(theme.id)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className={`shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-xl sm:text-2xl shadow-lg border-4 transition-all ${
              isSelected ? 'border-white bg-white/40' : 'border-transparent bg-white/20 hover:bg-white/30'
            }`}
            title={theme.label}
          >
            {theme.emoji}
          </motion.button>
        );
      })}
    </div>
  );
}
