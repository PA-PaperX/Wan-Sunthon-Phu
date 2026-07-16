import { redirect } from 'next/navigation';
import { getSession, clearSession } from '../lib/session';

export default async function ResultPage() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  const score = session.score;
  const total = session.questions.length;

  async function handlePlayAgain() {
    'use server';
    await clearSession();
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-[#F4D068] p-8 text-center">
        <h1 className="text-3xl font-bold text-[#8B5A2B] mb-2">สรุปคะแนน</h1>
        <p className="text-[#996515] mb-8">วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร</p>

        <div className="w-32 h-32 bg-[#F4D068] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-[#8B5A2B]">
          <span className="text-4xl font-black text-[#8B5A2B]">{score}/{total}</span>
        </div>

        <p className="text-lg mb-8 text-gray-700">
          {score === total ? 'ยอดเยี่ยม! คุณเก่งภาษาไทยมาก' :
           score >= 3 ? 'ทำได้ดี! เกือบสมบูรณ์แบบแล้ว' :
           'พยายามอีกนิด! ภาษาไทยไม่ยากอย่างที่คิด'}
        </p>

        <form action={handlePlayAgain} className="w-full">
          <button
            type="submit"
            className="inline-block w-full bg-[#996515] hover:bg-[#8B5A2B] text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-transform active:scale-95"
          >
            เล่นอีกครั้ง
          </button>
        </form>
      </div>
    </main>
  );
}
