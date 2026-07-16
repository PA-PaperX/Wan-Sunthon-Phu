'use client';

import { useState } from 'react';
import { SessionData } from '../types/quiz';
import { useRouter } from 'next/navigation';
import TransparentVideo from '../components/TransparentVideo';

export default function QuizClient({
  session,
  updateSessionAction
}: {
  session: SessionData;
  updateSessionAction: (newSession: SessionData) => Promise<void>;
}) {
  const router = useRouter();
  const [answered, setAnswered] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [displayScore, setDisplayScore] = useState(session.score);
  const [showVideo, setShowVideo] = useState<'win' | 'lose' | null>(null);

  const question = session.questions[session.currentIndex];
  const isLastQuestion = session.currentIndex === session.questions.length - 1;

  // Randomize button order once per question
  const [options] = useState(() => {
    return [question.correct, question.wrong].sort(() => Math.random() - 0.5);
  });

  const handleAnswer = async (word: string) => {
    if (answered) return;

    setSelectedWord(word);
    setAnswered(true);

    const isCorrect = word === question.correct;
    if (isCorrect) {
      setDisplayScore(s => s + 1);
      setShowVideo('win');
    } else {
      setShowVideo('lose');
    }

    const newSession = {
      ...session,
      score: isCorrect ? session.score + 1 : session.score
    };

    await updateSessionAction(newSession);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      await updateSessionAction({ ...session, score: displayScore, completed: true });
      router.push('/result');
    } else {
      const newSession = {
        ...session,
        currentIndex: session.currentIndex + 1
      };
      await updateSessionAction(newSession);

      router.refresh();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center text-[#996515] font-bold">
        <span>ข้อที่ {session.currentIndex + 1} / {session.questions.length}</span>
        <span>คะแนน: {displayScore}</span>
      </div>

      <h2 className="text-2xl text-center font-bold mb-8 text-[#8B5A2B]">คำไหนเขียนถูก?</h2>

      <div className="flex flex-col gap-4">
        {options.map((word) => {
          let btnClass = "bg-white border-2 border-[#F4D068] text-[#8B5A2B]";
          if (answered) {
            if (word === question.correct) btnClass = "bg-green-500 border-green-600 text-white";
            else if (word === selectedWord) btnClass = "bg-red-500 border-red-600 text-white";
            else btnClass = "bg-gray-200 border-gray-300 text-gray-500";
          }

          return (
            <button
              key={word}
              onClick={() => handleAnswer(word)}
              disabled={answered}
              className={`py-4 px-6 rounded-xl text-xl font-bold transition-all shadow-md ${btnClass}`}
            >
              {word}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center pb-8 p-4 pointer-events-none animate-in slide-in-from-bottom-8 duration-500">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border-4 backdrop-blur-xl pointer-events-auto ${selectedWord === question.correct ? 'bg-green-50/95 border-green-500 text-green-900' : 'bg-red-50/95 border-red-500 text-red-900'}`}>
            <p className="text-2xl font-black mb-3">
              {selectedWord === question.correct ? '🎉 ถูกต้อง!' : '❌ ผิดครับ/ค่ะ'}
            </p>
            <p className="text-lg font-medium leading-relaxed mb-6">{question.explanation}</p>

            <button
              onClick={handleNext}
              className="w-full bg-[#996515] text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-[#8B5A2B] transition-transform active:scale-95"
            >
              {isLastQuestion ? 'ดูผลคะแนน' : 'ข้ามไปข้อถัดไป'}
            </button>
          </div>
        </div>
      )}

      {showVideo === 'win' && <TransparentVideo src="/videos/win_normal.mp4" onEnded={handleNext} />}
      {showVideo === 'lose' && <TransparentVideo src="/videos/lose_normal.mp4" onEnded={handleNext} />}
    </div>
  );
}
