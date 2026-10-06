'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceInput = () => {
  const [supported, setSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSupported(false);
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true; // Provides results while speaking
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setError("Oops! We need microphone access to hear you.");
        } else if (event.error === 'no-speech') {
          // ignore no-speech, it happens if it's quiet
        } else {
          setError("Uh oh, something went wrong with the microphone.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const start = useCallback(() => {
    if (!supported || !recognitionRef.current || isListening) return;
    setTranscript('');
    setError(null);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
    }
  }, [supported, isListening]);

  const stop = useCallback(() => {
    if (!supported || !recognitionRef.current || !isListening) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error(e);
    }
    setIsListening(false);
  }, [supported, isListening]);

  return { 
    start, 
    stop, 
    isListening, 
    transcript, 
    supported, 
    error,
    setError,
    setTranscript 
  };
};
