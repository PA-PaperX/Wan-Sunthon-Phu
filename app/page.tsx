import { redirect } from 'next/navigation';
import { startSession } from './lib/session';
import AnimatedHome from './components/AnimatedHome';

export default function Home() {
  async function handleStart() {
    'use server';
    await startSession();
    redirect('/quiz');
  }

  return <AnimatedHome onStart={handleStart} />;
}
