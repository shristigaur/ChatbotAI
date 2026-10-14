'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import ThemePicker from '@/components/ThemePicker';
import Character from '@/components/Character';
import { api } from '@/lib/api';
import { useSpeech } from '@/hooks/useSpeech';
import { useVoiceInput } from '@/hooks/useVoiceInput';

import DayBackground from '@/components/backgrounds/DayBackground';
import NightBackground from '@/components/backgrounds/NightBackground';
import SunsetBackground from '@/components/backgrounds/SunsetBackground';
import OceanBackground from '@/components/backgrounds/OceanBackground';
import ForestBackground from '@/components/backgrounds/ForestBackground';
import CandyBackground from '@/components/backgrounds/CandyBackground';

const Backgrounds = {
  DayBackground,
  NightBackground,
  SunsetBackground,
  OceanBackground,
  ForestBackground,
  CandyBackground
};

const SUGGESTIONS = [
  "Tell me a joke! 😂",
  "Tell me a short story 📖",
  "Why is the sky blue? 🌤️"
];

export default function ChatPage() {
  const router = useRouter();
  const { theme, changeTheme } = useTheme();
  
  // UI State
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isSfxOn, setIsSfxOn] = useState(true);
  
  // Modals
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, targetId: null, isAll: false });
  const [showNightPrompt, setShowNightPrompt] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  
  // Data State
  const [profile, setProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Interaction State
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [characterMood, setCharacterMood] = useState('idle');
  const [error, setError] = useState(null);
  
  // Typewriter Effect State
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [typingIndex, setTypingIndex] = useState(0);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  // Sound Effects Refs
  const sendSound = useRef(null);
  const receiveSound = useRef(null);

  // APIs
  const childAge = profile?.age || 8;
  const { speak, stop: stopSpeech, supported: speechSupported, isSpeaking } = useSpeech(childAge, setCharacterMood);
  const { 
    start: startListening, 
    stop: stopListening, 
    isListening, 
    transcript, 
    supported: voiceSupported,
    error: voiceError,
    setError: setVoiceError,
  } = useVoiceInput();

  // Load Initial Data & Sounds
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      sendSound.current = new Audio('/sounds/send.mp3');
      receiveSound.current = new Audio('/sounds/receive.mp3');
    }

    const loadData = async () => {
      try {
        const [prof, convos] = await Promise.all([
          api.getProfile(),
          api.getConversations()
        ]);
        setProfile(prof);
        setChats(convos);
      } catch (err) {
        console.error("Failed to load initial data", err);
        // If profile fetch fails, likely unauthorized. Kick to welcome.
        router.push('/welcome');
      } finally {
        setIsInitializing(false);
      }
    };
    loadData();

    const savedSpeaker = localStorage.getItem('funny_speaker_on');
    if (savedSpeaker !== null) setIsSpeakerOn(savedSpeaker === 'true');
    
    const savedSfx = localStorage.getItem('funny_sfx_on');
    if (savedSfx !== null) setIsSfxOn(savedSfx === 'true');
  }, [router]);

  const toggleSpeaker = () => {
    const newVal = !isSpeakerOn;
    setIsSpeakerOn(newVal);
    localStorage.setItem('funny_speaker_on', String(newVal));
    if (!newVal) stopSpeech();
  };
  
  const toggleSfx = () => {
    const newVal = !isSfxOn;
    setIsSfxOn(newVal);
    localStorage.setItem('funny_sfx_on', String(newVal));
  };

  const playSfx = (type) => {
    if (!isSfxOn) return;
    try {
      if (type === 'send') sendSound.current?.play().catch(()=>{});
      if (type === 'receive') receiveSound.current?.play().catch(()=>{});
    } catch(e) {}
  };

  // Night Theme Suggestion
  useEffect(() => {
    if (theme && theme.id !== 'night') {
      const hour = new Date().getHours();
      if (hour >= 19 || hour < 6) {
        setShowNightPrompt(true);
      } else {
        setShowNightPrompt(false);
      }
    } else {
      setShowNightPrompt(false);
    }
  }, [theme]);

  // Voice Error Sync
  useEffect(() => {
    if (voiceError) {
      setError(voiceError);
      setVoiceError(null);
    }
  }, [voiceError, setVoiceError]);

  // Auto-stop listening if Funny talks
  useEffect(() => {
    if (isSpeaking && isListening) stopListening();
  }, [isSpeaking, isListening, stopListening]);

  const silenceTimer = useRef(null);
  useEffect(() => {
    if (isListening && transcript) {
      setInputText(transcript); 
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        stopListening();
        if (!isSending) handleSend(null, transcript);
      }, 1500);
    }
    return () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isListening]);

  // Handle Typewriter Effect
  useEffect(() => {
    if (typingMessageId) {
      const msg = messages.find(m => m._id === typingMessageId);
      if (msg && typingIndex === 0) {
        playSfx('receive');
      }
      if (msg && typingIndex < msg.text.length) {
        const timer = setTimeout(() => {
          setTypingIndex(prev => prev + 1);
          scrollToBottom();
        }, 30);
        return () => clearTimeout(timer);
      } else if (msg && typingIndex >= msg.text.length) {
        setCharacterMood('happy');
        const timeout = setTimeout(() => {
          setCharacterMood(prev => prev === 'happy' ? 'idle' : prev);
          setTypingMessageId(null);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typingMessageId, typingIndex, messages]);

  const loadChat = async (chatId) => {
    stopSpeech();
    if (isListening) stopListening();
    setActiveChatId(chatId);
    setIsSidebarOpen(false);
    setError(null);
    try {
      const data = await api.getConversation(chatId);
      setMessages(data.messages);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to load chat", err);
    }
  };

  const handleNewChat = async () => {
    stopSpeech();
    if (isListening) stopListening();
    try {
      const newChat = await api.createConversation();
      setChats([newChat, ...chats]);
      setActiveChatId(newChat._id);
      setMessages([]);
      setIsSidebarOpen(false);
      setError(null);
    } catch (err) {
      console.error("Failed to create chat", err);
    }
  };

  const confirmDelete = (e, chatId) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, targetId: chatId, isAll: false });
  };

  const confirmDeleteAll = () => {
    setDeleteConfirm({ isOpen: true, targetId: null, isAll: true });
  };

  const executeDelete = async () => {
    try {
      if (deleteConfirm.isAll) {
        await api.deleteAllConversations();
        setChats([]);
        setActiveChatId(null);
        setMessages([]);
        stopSpeech();
        if (isListening) stopListening();
      } else {
        await api.deleteConversation(deleteConfirm.targetId);
        setChats(prev => prev.filter(c => c._id !== deleteConfirm.targetId));
        if (activeChatId === deleteConfirm.targetId) {
          await handleNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete", err);
    } finally {
      setDeleteConfirm({ isOpen: false, targetId: null, isAll: false });
    }
  };

  const handleWipeData = async () => {
    if (!window.confirm("WARNING: This will permanently delete your child's profile and all chat history. This cannot be undone. Proceed?")) return;
    try {
      await api.deleteProfile();
      localStorage.removeItem('funny_token');
      window.location.href = '/welcome';
    } catch (err) {
      console.error("Failed to wipe data", err);
      alert("Failed to delete account. Please try again later.");
    }
  };

  const handleSend = async (e, forceText = null) => {
    if (e) e.preventDefault();
    const textToSend = (forceText !== null ? forceText : inputText).trim();
    if (!textToSend || isSending) return;

    stopSpeech();
    if (isListening) stopListening();
    
    let targetChatId = activeChatId;
    setError(null);

    if (!targetChatId) {
      try {
        const newChat = await api.createConversation();
        setChats([newChat, ...chats]);
        setActiveChatId(newChat._id);
        targetChatId = newChat._id;
      } catch (err) {
        setError("Oops! We couldn't start the chat. Try again!");
        return;
      }
    }

    setInputText('');
    setIsSending(true);
    setCharacterMood('thinking');
    playSfx('send');

    const tempUserMsg = { _id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, tempUserMsg]);
    setTimeout(scrollToBottom, 100);

    try {
      const result = await api.sendMessage(targetChatId, textToSend);
      
      setChats(prev => prev.map(c => {
        if (c._id === targetChatId && c.title === 'New Chat') {
          return { ...c, title: textToSend.substring(0, 30) };
        }
        return c;
      }));
      
      setMessages(prev => {
        const filtered = prev.filter(m => m._id !== tempUserMsg._id);
        return [...filtered, result.userMessage, result.assistantMessage];
      });
      
      setTypingMessageId(result.assistantMessage._id);
      setTypingIndex(0);
      
      if (isSpeakerOn) {
        speak(result.assistantMessage.text);
      } else {
        setCharacterMood('talking');
      }

    } catch (err) {
      console.error("Send error", err);
      setError("Uh oh! Funny didn't hear that. Can you try again?");
      setCharacterMood('idle');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    if (isListening) stopListening();
    setInputText(e.target.value);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-sky-100">
        <motion.div 
          animate={{ y: [0, -20, 0] }} 
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </div>
    );
  }

  if (!theme || !profile) return null;

  const CurrentBackground = Backgrounds[theme.Background];
  const hasMessages = messages.length > 0;
  const characterId = profile?.favoriteCharacter || 'lion';
  const profileName = profile?.name || 'Friend';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groupedChats = { today: [], yesterday: [], earlier: [] };
  chats.forEach(chat => {
    const chatDate = new Date(chat.updatedAt);
    if (chatDate >= today) groupedChats.today.push(chat);
    else if (chatDate >= yesterday) groupedChats.yesterday.push(chat);
    else groupedChats.earlier.push(chat);
  });

  const renderChat = (chat) => {
    const isActive = activeChatId === chat._id;
    return (
      <div 
        key={chat._id} 
        onClick={() => loadChat(chat._id)}
        className={`group flex items-center justify-between p-3 min-h-11 rounded-xl cursor-pointer transition-colors mb-1 shadow-sm ${
          isActive ? 'bg-white/40 border-2 border-white/50' : 'bg-black/5 hover:bg-black/10 border-2 border-transparent'
        }`}
      >
        <span className="font-semibold truncate mr-2" style={{ color: isActive ? 'inherit' : '' }}>{chat.title}</span>
        <button 
          onClick={(e) => confirmDelete(e, chat._id)}
          className={`text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:scale-110 transition-all p-2 text-xl drop-shadow-sm min-h-11 min-w-11 flex items-center justify-center ${isActive ? 'opacity-100' : ''}`}
        >
          🗑️
        </button>
      </div>
    );
  };

  return (
    <div className="relative flex h-dvh w-full overflow-hidden overscroll-none">
      {CurrentBackground && <CurrentBackground />}
      
      {/* Parent Information Modal */}
      <AnimatePresence>
        {showParentModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowParentModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl border-4 border-gray-200 bg-white p-5 shadow-2xl sm:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">For Parents</h2>
                <button onClick={() => setShowParentModal(false)} className="text-2xl p-2 min-h-11 min-w-11 bg-gray-100 hover:bg-gray-200 rounded-full">✕</button>
              </div>
              <div className="space-y-4 text-gray-600 text-lg">
                <p><strong>Privacy First:</strong> Funny is built with child safety in mind. All conversations are strictly isolated to this specific profile.</p>
                <p><strong>Safety Filters:</strong> The backend automatically filters out bad words, addresses, emails, and phone numbers before they ever reach the AI.</p>
                <p><strong>Data Storage:</strong> We only store the child's chosen first name, age, selected theme/character, and chat history.</p>
                <div className="pt-6 border-t mt-6">
                  <p className="mb-4 text-rose-600 font-bold">Need to wipe the slate clean?</p>
                  <button 
                    onClick={handleWipeData}
                    className="w-full py-4 min-h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-xl shadow-md transition-colors"
                  >
                    Delete Profile & All Data
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNightPrompt && !hasMessages && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-28 left-3 right-3 z-40 max-w-sm rounded-3xl rounded-br-none border-4 border-indigo-400 bg-indigo-900 p-4 text-white shadow-2xl sm:bottom-32 sm:left-auto sm:right-6 sm:p-6 md:right-12"
          >
            <div className="text-xl font-bold mb-4 drop-shadow-sm">
              It's night time! 🌙 Want to put on your pajamas?
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowNightPrompt(false); changeTheme('night'); }}
                className="flex-1 py-3 px-4 min-h-11 bg-indigo-500 hover:bg-indigo-400 rounded-2xl font-bold text-lg shadow-sm transition-colors"
              >
                Yes!
              </button>
              <button 
                onClick={() => setShowNightPrompt(false)}
                className="flex-1 py-3 px-4 min-h-11 bg-indigo-950 hover:bg-black/50 rounded-2xl font-bold text-lg shadow-sm transition-colors"
              >
                No thanks
              </button>
            </div>
            <div className="absolute -bottom-6 right-8 text-indigo-400 text-4xl">▼</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-100 flex flex-col items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setDeleteConfirm({ isOpen: false, targetId: null, isAll: false })}
            />
            <motion.div 
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center border-4 border-rose-300">
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-4xl text-rose-300">▼</div>
                <div className="text-3xl mb-8 font-bold text-gray-700">
                  {deleteConfirm.isAll ? "Delete ALL chats?" : "Delete this chat?"}
                </div>
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setDeleteConfirm({ isOpen: false, targetId: null, isAll: false })}
                    className="flex-1 py-4 min-h-11 rounded-2xl text-2xl font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                  >
                    No
                  </button>
                  <button 
                    onClick={executeDelete}
                    className="flex-1 py-4 min-h-11 rounded-2xl text-2xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200 transition-colors"
                  >
                    Yes
                  </button>
                </div>
              </div>
              <div className="mt-8 relative z-20">
                <Character characterId={characterId} outfit={theme.outfit} mood="thinking" size={160} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(20rem,88vw)] transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:w-80 flex h-full flex-col p-3 shadow-2xl backdrop-blur-md transition-transform duration-300 sm:p-4 ${theme.colors.sidebar}`}
      >
        <button 
          onClick={handleNewChat}
          className={`w-full py-4 min-h-11 text-xl font-bold rounded-2xl shadow-sm mb-4 ${theme.colors.button} text-white hover:scale-105 transition-transform active:scale-95`}
        >
          + New Chat
        </button>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
          {chats.length === 0 ? (
             <div className="text-center opacity-60 mt-10 font-bold px-4">
               No past chats yet. Start talking to Funny!
             </div>
          ) : (
            <>
              {groupedChats.today.length > 0 && (
                <div>
                  <div className="text-sm font-bold opacity-60 uppercase mb-2 px-2 tracking-wider">Today</div>
                  {groupedChats.today.map(renderChat)}
                </div>
              )}
              {groupedChats.yesterday.length > 0 && (
                <div>
                  <div className="text-sm font-bold opacity-60 uppercase mb-2 px-2 tracking-wider">Yesterday</div>
                  {groupedChats.yesterday.map(renderChat)}
                </div>
              )}
              {groupedChats.earlier.length > 0 && (
                <div>
                  <div className="text-sm font-bold opacity-60 uppercase mb-2 px-2 tracking-wider">Earlier</div>
                  {groupedChats.earlier.map(renderChat)}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="box-border mt-4 w-full max-w-full overflow-hidden overflow-x-hidden px-3 pt-4 border-t border-black/10 flex flex-col gap-3">
          <button 
            onClick={toggleSfx}
            className="flex items-center justify-center p-3 min-h-11 bg-black/5 hover:bg-black/10 rounded-xl transition-colors font-bold text-gray-800"
          >
            {isSfxOn ? '🎵 Sound Effects: ON' : '🔇 Sound Effects: OFF'}
          </button>
          
          <div className="flex w-full min-w-0 gap-2">
            <button 
              onClick={() => setShowParentModal(true)}
              className="flex-1 min-w-0 flex items-center justify-center truncate p-3 min-h-11 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl transition-colors font-bold text-sm"
            >
              <span className="truncate">ℹ️ Ask a Parent</span>
            </button>
            {chats.length > 0 && (
              <button 
                onClick={confirmDeleteAll}
                className="flex-1 min-w-0 flex items-center justify-center truncate p-3 min-h-11 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl transition-colors font-bold text-sm"
                title="Clear all chats"
              >
                <span className="truncate">🗑️ Clear All</span>
              </button>
            )}
          </div>
          
          <ThemePicker />
        </div>
      </aside>

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="z-30 flex shrink-0 items-center justify-between border-b border-white/40 bg-white/30 p-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md md:hidden sm:p-4">
          <button onClick={() => setIsSidebarOpen(true)} className="text-3xl p-2 min-h-11 min-w-11 bg-white/50 rounded-xl shadow-sm">
            ☰
          </button>
          <span className="font-bold text-xl drop-shadow-sm text-gray-800">Funny AI</span>
          <div className="w-12"></div>
        </div>

        {hasMessages && (
          <div className="shrink-0 px-4 md:px-8 py-2 md:py-4 flex items-center z-10 bg-white/10 backdrop-blur-sm border-b border-white/20">
            <Character characterId={characterId} outfit={theme.outfit} mood={characterMood} size={90} />
            <div className="ml-4 font-bold text-xl text-gray-800 opacity-60">Chatting with Funny! {theme.emoji}</div>
          </div>
        )}

        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-3 pb-3 custom-scrollbar sm:p-4 md:p-8">
          
          {!hasMessages ? (
            <div className="my-auto flex flex-col items-center justify-center py-4 sm:py-6">
              <motion.div 
                initial={{ scale: 0, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className={`relative mb-4 max-w-sm rounded-3xl rounded-br-none border-4 border-white/50 p-4 text-center text-xl font-bold shadow-xl sm:mb-8 sm:p-6 sm:text-2xl ${theme.colors.botBubble}`}
              >
                Hi {profileName}! I'm Funny, your friend. Ask me anything!
                <div className="absolute -bottom-5 right-8 text-3xl drop-shadow-md" style={{ color: 'inherit' }}>▼</div>
              </motion.div>
              <div className="max-w-full scale-90 sm:scale-100"><Character characterId={characterId} outfit={theme.outfit} mood={characterMood} size={220} /></div>
              
              {/* Suggestion Chips */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-5 flex max-w-2xl flex-wrap justify-center gap-2 sm:mt-10 sm:gap-3"
              >
                {SUGGESTIONS.map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleSend(null, s)}
                    className="min-h-11 rounded-full border-2 border-white/50 bg-white/70 px-4 py-2.5 text-sm font-bold text-gray-800 shadow-md transition-colors hover:bg-white/90 active:scale-95 sm:px-6 sm:py-4 sm:text-lg"
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-end gap-4 sm:gap-6">
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                const isTyping = msg._id === typingMessageId;
                const displayedText = isTyping ? msg.text.substring(0, typingIndex) : msg.text;

                return (
                  <motion.div 
                    key={msg._id} 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex min-w-0 max-w-[92%] flex-col sm:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`flex max-w-full items-center whitespace-pre-wrap wrap-break-words rounded-3xl border-2 border-white/30 p-3 text-base font-medium shadow-md sm:p-4 sm:px-6 sm:text-xl ${
                        isUser 
                          ? `${theme.colors.userBubble} rounded-br-none` 
                          : `${theme.colors.botBubble} rounded-bl-none`
                      }`}>
                        {displayedText}
                        {isTyping && <span className="animate-pulse font-bold text-2xl ml-1">|</span>}
                      </div>
                      
                      {!isUser && !isTyping && speechSupported && (
                        <button 
                          onClick={() => speak(msg.text)}
                          className="mt-1 ml-2 text-2xl opacity-0 group-hover:opacity-100 hover:scale-110 transition-all drop-shadow-sm p-2 min-h-11 min-w-11 flex items-center justify-center"
                          title="Read aloud"
                        >
                          🔊
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {error && (
                <div className="flex flex-col items-center mt-4">
                  <div className="bg-red-100 text-red-600 p-4 px-6 rounded-3xl font-bold shadow-md">
                    {error}
                  </div>
                  <button onClick={() => { setError(null); handleSend(); }} className="mt-4 min-h-11 bg-red-400 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-sm transition-colors">
                    Retry
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="z-30 w-full shrink-0 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 sm:pb-4 sm:pt-3 md:p-6">
          <form 
            onSubmit={(e) => handleSend(e)}
            className="relative mx-auto mb-0 flex w-full max-w-4xl items-center gap-1.5 rounded-3xl border-2 border-white/50 bg-white/90 p-1.5 pl-2.5 shadow-2xl backdrop-blur-xl sm:gap-2 sm:rounded-full sm:border-4 sm:p-2 sm:pl-4 md:gap-3"
          >
            <button 
              type="button"
              onClick={toggleSpeaker}
              className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 p-2 text-xl transition-transform hover:scale-110 sm:min-h-11 sm:min-w-11 sm:p-3 sm:text-2xl md:text-3xl"
              title={isSpeakerOn ? 'Mute Speech' : 'Unmute Speech'}
            >
              {isSpeakerOn ? '🔊' : '🔇'}
            </button>

            <button
              type="button"
              onClick={toggleSfx}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm transition-colors hover:bg-gray-200 md:hidden"
              title={isSfxOn ? 'Turn sound effects off' : 'Turn sound effects on'}
              aria-label={isSfxOn ? 'Turn sound effects off' : 'Turn sound effects on'}
            >
              {isSfxOn ? '🔊' : '🔇'}
            </button>
            
            <input 
              type="text" 
              value={inputText}
              onChange={handleInputChange}
              disabled={isSending}
              placeholder={isListening ? "I'm listening..." : isSending ? "Funny is thinking..." : "Type a message..."} 
              className="min-h-11 min-w-0 flex-1 bg-transparent p-1.5 text-base font-semibold text-gray-700 placeholder-gray-400 focus:outline-none disabled:opacity-50 sm:p-2 sm:text-xl md:text-2xl"
            />

            {voiceSupported ? (
              <button 
                type="button" 
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking || isSending}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-all md:h-11 md:w-11 md:p-2 md:text-2xl ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.7)]' 
                    : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-50'
                }`}
                title={isSpeaking ? "Funny is speaking..." : "Voice Input"}
              >
                🎤
              </button>
            ) : (
              <div className="group relative shrink-0">
                <button type="button" disabled className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-gray-100 text-sm opacity-50 md:h-11 md:w-11 md:p-2 md:text-2xl">
                  🎤
                </button>
                <div className="absolute bottom-full mb-2 right-0 w-48 bg-gray-800 text-white text-sm p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center font-bold z-50">
                  Voice works best in Chrome, Edge or Safari
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSending || !inputText.trim()}
              className={`flex min-h-11 shrink-0 items-center justify-center rounded-full px-4 py-2 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none sm:px-6 sm:py-3 sm:text-xl md:px-8 md:py-4 md:text-2xl ${theme.colors.button}`}
            >
              Send ➔
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
