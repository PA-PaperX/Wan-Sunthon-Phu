'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../lib/session';
import QuizClient from './QuizClient';
import { SessionData } from '../types/quiz';

export default function QuizPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.push('/');
    } else if (s.completed) {
      router.push('/result');
    } else {
      setSession(s);
      setLoading(false);
    }
  }, [router]);

  if (loading || !session) {
    return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-[#8B5A2B]">กำลังโหลด...</div>;
  }

  return <QuizClient session={session} />;
}
