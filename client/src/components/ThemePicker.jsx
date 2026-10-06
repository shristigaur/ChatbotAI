'use client';
import { useTheme } from './ThemeProvider';
import { themes } from '@/data/themes';
import { motion } from 'framer-motion';

export default function ThemePicker() {
  const { themeId, changeTheme } = useTheme();

  return (
    <div className="flex gap-4 p-4 overflow-x-auto items-center justify-center bg-black/5 rounded-full backdrop-blur-sm max-w-fit mx-auto">
      {Object.values(themes).map(theme => {
        const isSelected = theme.id === themeId;
        return (
          <motion.button
            key={theme.id}
            onClick={() => changeTheme(theme.id)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className={`shrink-0 flex items-center justify-center w-16 h-16 rounded-full text-3xl shadow-lg border-4 transition-all ${
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
