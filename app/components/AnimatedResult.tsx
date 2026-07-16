'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { SessionData } from '../types/quiz';

export default function AnimatedResult({ 
  session, 
  onPlayAgain 
}: { 
  session: SessionData; 
  onPlayAgain: () => void;
}) {
  const score = session.score;
  const total = session.questions.length;
  const userAnswers = session.userAnswers || [];
  
  // Ticking score animation
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < score) {
        current += 1;
        setDisplayScore(current);
      } else {
        clearInterval(interval);
      }
    }, 150); // Tick every 150ms
    return () => clearInterval(interval);
  }, [score]);

  useEffect(() => {
    // Fire confetti on high score! (e.g. 4 or 5)
    if (score >= 4) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }
  }, [score]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center py-10 p-4 selection:bg-[#F4D068] selection:text-[#5C4033] overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute top-10 right-10 w-[40rem] h-[40rem] bg-[#D4A373] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-[30rem] h-[30rem] bg-[#996515] rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="max-w-xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-[#F4D068] p-8 text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-[#8B5A2B] mb-2">สรุปคะแนน</h1>
        <p className="text-[#996515] mb-8">วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร</p>

        <motion.div 
          className="w-32 h-32 bg-gradient-to-br from-[#F4D068] to-[#D4A373] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-[#8B5A2B]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
        >
          <motion.span 
            className="text-4xl font-black text-white drop-shadow-md"
            key={displayScore}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {displayScore}/{total}
          </motion.span>
        </motion.div>

        <motion.p 
          className="text-lg mb-8 text-[#5C4033] font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score === total ? 'ยอดเยี่ยม! คุณเก่งภาษาไทยมาก 🏆' :
           score >= 3 ? 'ทำได้ดี! เกือบสมบูรณ์แบบแล้ว 👍' :
           'พยายามอีกนิด! ภาษาไทยไม่ยากอย่างที่คิด ✌️'}
        </motion.p>

        <form action={onPlayAgain} className="w-full">
          <motion.button
            type="submit"
            className="inline-block w-full bg-gradient-to-r from-[#996515] to-[#8B5A2B] hover:from-[#8B5A2B] hover:to-[#6E4823] text-white font-bold py-4 px-8 rounded-full text-xl shadow-[0_8px_20px_rgba(139,90,43,0.3)] transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            เล่นอีกครั้ง
          </motion.button>
        </form>
      </motion.div>

      <div className="max-w-xl w-full space-y-6 relative z-10">
        <motion.h2 
          className="text-2xl font-bold text-[#8B5A2B] mb-4 text-center border-b-2 border-[#E8DCC4] pb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ทบทวนคำตอบและคำอธิบาย
        </motion.h2>
        
        {session.questions.map((q, i) => {
          const userAnswer = userAnswers[i];
          const isCorrect = userAnswer === q.correct;
          
          return (
            <motion.div 
              key={q.id} 
              className={`p-6 rounded-2xl border-2 shadow-sm relative overflow-hidden ${isCorrect ? 'bg-[#F0FDF4]/90 border-[#86EFAC]' : 'bg-[#FEF2F2]/90 border-[#FECACA]'}`}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, type: "spring", bounce: 0.3 }}
            >
              {/* Decorative side bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${isCorrect ? 'bg-[#65B741]' : 'bg-[#E55B5B]'}`} />
              
              <div className="flex items-center justify-between mb-4 pl-2">
                <p className="font-bold text-xl text-[#5C4033]">
                  ข้อ {i + 1}. <span className={`text-2xl ml-2 ${isCorrect ? 'text-[#65B741]' : 'text-[#8B5A2B]'}`}>{q.correct}</span>
                </p>
                {isCorrect ? (
                  <span className="bg-[#65B741] text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">ถูกต้อง</span>
                ) : (
                  <span className="bg-[#E55B5B] text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">ผิด</span>
                )}
              </div>
              
              {!isCorrect && userAnswer && (
                <p className="text-sm text-[#E55B5B] mb-4 bg-white/60 p-3 rounded-xl inline-block border border-[#FECACA] font-medium shadow-inner ml-2">
                  คุณตอบ: <span className="font-bold line-through">{userAnswer}</span>
                </p>
              )}
              
              <div className="bg-white/80 rounded-xl p-4 text-[#5C4033] text-sm md:text-base border border-[#E8DCC4] shadow-inner mb-4 ml-2">
                <strong className="text-[#8B5A2B] block mb-2 text-base">ความหมาย/คำอธิบาย:</strong>
                <p className="leading-relaxed">{q.explanation}</p>
              </div>

              <a 
                href="https://dictionary.orst.go.th/index.php" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2D9596] hover:text-[#1E6B6C] text-xs md:text-sm font-semibold underline underline-offset-4 flex items-center gap-1.5 ml-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                พจนานุกรม ฉบับราชบัณฑิตยสถาน
              </a>
            </motion.div>
          );
        })}

        <motion.div 
          className="mt-8 text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-[#D4A373] shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-[#F4D068] opacity-10 pointer-events-none"></div>
          <h3 className="text-lg font-bold text-[#8B5A2B] mb-3 relative z-10">ค้นหาคำศัพท์อื่นๆ เพิ่มเติมได้ที่</h3>
          <motion.a 
            href="https://dictionary.orst.go.th/index.php" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#2D9596] hover:bg-[#1E6B6C] text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            พจนานุกรม ฉบับราชบัณฑิตยสถาน ออนไลน์
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
