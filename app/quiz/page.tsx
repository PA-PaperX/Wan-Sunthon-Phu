import { redirect } from 'next/navigation';
import { getSession, updateSession } from '../lib/session';
import QuizClient from './QuizClient';
import { SessionData } from '../types/quiz';

export default async function QuizPage() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  if (session.completed) redirect('/result');

  async function updateSessionAction(newSession: SessionData) {
    'use server';
    await updateSession(newSession);
  }
  return <QuizClient session={session} updateSessionAction={updateSessionAction} />;
}
