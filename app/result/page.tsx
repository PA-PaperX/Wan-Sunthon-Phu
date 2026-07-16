import { redirect } from 'next/navigation';
import { getSession, clearSession } from '../lib/session';

export default async function ResultPage() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  const score = session.score;
  const total = session.questions.length;
  const userAnswers = session.userAnswers || [];

  async function handlePlayAgain() {
    'use server';
    await clearSession();
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center py-10 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-[#F4D068] p-8 text-center mb-6">
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

      <div className="max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold text-[#8B5A2B] mb-4 text-center">เฉลยคำตอบ</h2>
        {session.questions.map((q, i) => {
          const userAnswer = userAnswers[i];
          const isCorrect = userAnswer === q.correct;
          return (
            <div key={q.id} className={`p-4 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="font-bold text-lg mb-2">
                {i + 1}. คำที่ถูกคือ: <span className="text-green-700">{q.correct}</span>
              </p>
              {!isCorrect && userAnswer && (
                <p className="text-sm text-red-600 mb-2">คุณตอบ: {userAnswer}</p>
              )}
              <p className="text-sm text-gray-700">{q.explanation}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
