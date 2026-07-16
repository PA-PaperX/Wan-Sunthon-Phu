'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '../lib/session';
import AnimatedResult from '../components/AnimatedResult';
import { SessionData } from '../types/quiz';

export default function ResultPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push('/');
    } else {
      setSession(s);
      setLoading(false);
    }
  }, [router]);

  const handlePlayAgain = () => {
    clearSession();
    router.push('/');
  };

  if (loading || !session) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-[#8B5A2B]">กำลังโหลด...</div>;
  }

  return <AnimatedResult session={session} onPlayAgain={handlePlayAgain} />;
}
