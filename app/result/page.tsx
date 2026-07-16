import { redirect } from 'next/navigation';
import { getSession, clearSession } from '../lib/session';
import AnimatedResult from '../components/AnimatedResult';

export default async function ResultPage() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  async function handlePlayAgain() {
    'use server';
    await clearSession();
    redirect('/');
  }

  return <AnimatedResult session={session} onPlayAgain={handlePlayAgain} />;
}
