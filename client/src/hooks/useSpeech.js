'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// Utility to remove emojis from text so the screen reader doesn't literally read them
const stripEmojis = (str) => {
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}]/gu, '');
};

export const useSpeech = (age, setMood) => {
  const [supported, setSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return;
        
        // Prefer a friendly English voice
        const englishVoice = 
          voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha'))) || 
          voices.find(v => v.lang.startsWith('en-')) || 
          voices[0];
          
        voiceRef.current = englishVoice;
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Cleanup on unmount (e.g. leaving the page)
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    // Don't forcefully set mood here, we leave mood control to the caller if needed,
    // otherwise rapid state changes might conflict.
  }, [supported]);

  const speak = useCallback((text) => {
    if (!supported || !text) return;
    
    stop(); // cancel any current speech

    const cleanText = stripEmojis(text);
    if (!cleanText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    
    // Slower rate for ages 3-7, normal for 8+
    utterance.rate = (age && age <= 7) ? 0.95 : 1.0;
    
    // Slightly higher pitch for a kid-friendly tone
    utterance.pitch = 1.15;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (setMood) setMood('talking');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Only return to idle if we were talking (don't overwrite "thinking" or "happy" if state changed)
      if (setMood) {
        setMood(prev => prev === 'talking' ? 'idle' : prev);
      }
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;

      console.error('Speech synthesis error', e.error);
      setIsSpeaking(false);
      if (setMood) {
        setMood(prev => prev === 'talking' ? 'idle' : prev);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [supported, age, setMood, stop]);

  return { speak, stop, isSpeaking, supported };
};
