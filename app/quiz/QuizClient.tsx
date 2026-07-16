'use client';

import { useState } from 'react';
import { SessionData } from '../types/quiz';
import { useRouter } from 'next/navigation';

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
    const newSession = {
      ...session,
      score: isCorrect ? session.score + 1 : session.score
    };

    await updateSessionAction(newSession);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      router.push('/result');
    } else {
      const newSession = {
        ...session,
        currentIndex: session.currentIndex + 1
      };
      await updateSessionAction(newSession);

      // Reset state for next question
      setAnswered(false);
      setSelectedWord(null);
      // Force reload to get new randomized options
      window.location.reload();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center text-[#996515] font-bold">
        <span>ข้อที่ {session.currentIndex + 1} / {session.questions.length}</span>
        <span>คะแนน: {session.score}</span>
      </div>

      <h2 className="text-2xl text-center font-bold mb-8 text-[#8B5A2B]">คำไหนเขียนถูก?</h2>

      <div className="flex flex-col gap-4">
        {options.map((word, idx) => {
          let btnClass = "bg-white border-2 border-[#F4D068] text-[#8B5A2B]";
          if (answered) {
            if (word === question.correct) btnClass = "bg-green-500 border-green-600 text-white";
            else if (word === selectedWord) btnClass = "bg-red-500 border-red-600 text-white";
            else btnClass = "bg-gray-200 border-gray-300 text-gray-500";
          }

          return (
            <button
              key={idx}
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
        <div className="mt-8 animate-fade-in">
          <div className={`p-4 rounded-lg mb-6 ${selectedWord === question.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-bold mb-2">
              {selectedWord === question.correct ? '🎉 ถูกต้อง!' : '❌ ผิดครับ/ค่ะ'}
            </p>
            <p className="text-sm">{question.explanation}</p>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-[#996515] text-white font-bold py-4 rounded-full text-lg shadow-lg hover:bg-[#8B5A2B]"
          >
            {isLastQuestion ? 'ดูผลคะแนน' : 'ข้อถัดไป'}
          </button>
        </div>
      )}
    </div>
  );
}
