import { redirect } from 'next/navigation';
import { getSession, updateSession } from '../lib/session';
import QuizClient from './QuizClient';
import { SessionData } from '../types/quiz';

export default async function QuizPage() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  async function updateSessionAction(newSession: SessionData) {
    'use server';
    await updateSession(newSession);
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center p-4 pt-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-[#F4D068]">
        <div className="bg-[#F4D068] p-4 text-center">
          <h1 className="text-xl font-bold text-[#8B5A2B]">ตอบคำถามคำผิด - คำถูก</h1>
        </div>
        <QuizClient key={session.currentIndex} session={session} updateSessionAction={updateSessionAction} />
      </div>
    </main>
  );
}
