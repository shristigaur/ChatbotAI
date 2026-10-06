'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { themes } from '@/data/themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState('day');

  useEffect(() => {
    // Attempt to load the user's theme choice from their profile
    const loadTheme = async () => {
      try {
        const profile = await api.getProfile();
        if (profile?.theme && themes[profile.theme]) {
          setThemeId(profile.theme);
        }
      } catch (err) {
        // Safe to ignore, user might not be logged in yet
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (newThemeId) => {
    if (!themes[newThemeId]) return;
    
    // Optimistic UI update
    setThemeId(newThemeId);
    
    // Save to backend
    try {
      await api.updateProfile({ theme: newThemeId });
    } catch (err) {
      console.error('Failed to save theme to backend', err);
    }
  };

  const theme = themes[themeId];

  return (
    <ThemeContext.Provider value={{ themeId, theme, changeTheme }}>
      <div className={`relative min-h-screen w-full transition-colors duration-1000 bg-gradient-to-br ${theme.colors.bg} overflow-hidden`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
