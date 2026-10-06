'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      const token = localStorage.getItem('funny_token');
      if (!token) {
        // No token, must onboard
        router.push('/welcome');
        return;
      }
      
      try {
        await api.getProfile();
        // Token valid and profile exists, go straight to chat
        router.push('/chat');
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('funny_token');
        router.push('/welcome');
      }
    };
    
    checkProfile();
  }, [router]);

  // Show a simple colorful loading screen while checking token
  return (
    <div className="flex h-screen w-full items-center justify-center bg-sky-100">
      <div className="text-4xl font-bold text-sky-500 animate-pulse tracking-wide">
        Loading ✨
      </div>
    </div>
  );
}
