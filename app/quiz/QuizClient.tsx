"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { SessionData } from "../types/quiz";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TransparentVideo from "../components/TransparentVideo";
import { updateSession } from "../lib/session";

const ChoiceIcon = ({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) => {
  const letters = ["ก", "ข", "ค", "ง"];
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={`w-10 h-10 sm:w-14 sm:h-14 opacity-90 drop-shadow-sm ${className}`}
      animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
      transition={{
        duration: 4 + (index % 2),
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <text
        x="12"
        y="12"
        fontSize="16"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
      >
        {letters[index % letters.length]}
      </text>
    </motion.svg>
  );
};

export default function QuizClient({ session }: { session: SessionData }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(session.currentIndex);
  const [answered, setAnswered] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [displayScore, setDisplayScore] = useState(session.score);
  const [showVideo, setShowVideo] = useState<"win" | "lose" | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8);

  const latestSessionRef = useRef(session);
  const question = session.questions[currentIndex];
  const isLastQuestion = currentIndex === session.questions.length - 1;

  const options = useMemo(() => {
    const wrongAnswers = Array.isArray(question.wrong)
      ? question.wrong
      : [question.wrong];
    const all = [question.correct, ...wrongAnswers];
    let seed = question.id + currentIndex * 100;
    for (let i = all.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [question, currentIndex]);

  const hintText = useMemo(() => {
    const baseText = question.hint;
    if (!baseText) return "";
    let text = baseText;
    const sortedOptions = [...options].sort((a, b) => b.length - a.length);
    sortedOptions.forEach((opt) => {
      text = text.split(opt).join("___");
    });
    return text;
  }, [question.hint, options]);

  const handleAnswer = async (word: string) => {
    if (answered) return;
    setSelectedWord(word);
    setAnswered(true);

    const isCorrect = word === question.correct;
    if (isCorrect) {
      setDisplayScore((s) => s + 1);
      setShowVideo("win");
    } else {
      setShowVideo("lose");
    }

    const newSession = {
      ...latestSessionRef.current,
      score: isCorrect
        ? latestSessionRef.current.score + 1
        : latestSessionRef.current.score,
      userAnswers: [...(latestSessionRef.current.userAnswers || []), word],
    };
    latestSessionRef.current = newSession;
    updateSession(newSession);
  };

  const handleVideoEnded = () => {
    setShowVideo(null);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalSession = { ...latestSessionRef.current, completed: true };
      updateSession(finalSession);
      router.push("/result");
    } else {
      const nextIndex = currentIndex + 1;
      const nextSession = {
        ...latestSessionRef.current,
        currentIndex: nextIndex,
      };
      latestSessionRef.current = nextSession;

      setCurrentIndex(nextIndex);
      setAnswered(false);
      setSelectedWord(null);
      setShowExplanation(false);
      setTimeLeft(8);

      updateSession(nextSession);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showExplanation && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showExplanation, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleNext();
    }
  }, [timeLeft]);

  const baseCardStyles = [
    "bg-[#E55B5B] shadow-[0_6px_0_#C23B3B]",
    "bg-[#2D9596] shadow-[0_6px_0_#1E6B6C]",
    "bg-[#F1C40F] shadow-[0_6px_0_#B8960B]",
    "bg-[#65B741] shadow-[0_6px_0_#458529]",
  ];

  const hoverActiveStyles = [
    "md:hover:bg-[#D44A4A] md:hover:shadow-[0_8px_0_#C23B3B] active:shadow-[0_0px_0_#C23B3B]",
    "md:hover:bg-[#258283] md:hover:shadow-[0_8px_0_#1E6B6C] active:shadow-[0_0px_0_#1E6B6C]",
    "md:hover:bg-[#D9B00D] md:hover:shadow-[0_8px_0_#B8960B] active:shadow-[0_0px_0_#B8960B]",
    "md:hover:bg-[#54A034] md:hover:shadow-[0_8px_0_#458529] active:shadow-[0_0px_0_#458529]",
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center p-4 sm:p-6 md:p-8 text-[#5C4033] font-sans selection:bg-[#F4D068] selection:text-[#5C4033] overflow-hidden">
      <motion.div
        className="w-full max-w-3xl flex flex-col h-full mt-2 md:mt-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E8DCC4] mb-8 md:mb-12 transition-all">
          <div className="flex justify-between items-end mb-2 font-bold text-[#8B5A2B]">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm uppercase tracking-wider opacity-70">
                ความคืบหน้า
              </span>
              <span className="text-lg sm:text-xl">
                ข้อที่ {currentIndex + 1} / {session.questions.length}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs sm:text-sm uppercase tracking-wider opacity-70">
                คะแนน
              </span>
              <span className="text-xl sm:text-2xl text-[#D4A373] drop-shadow-sm flex items-center gap-1">
                <motion.span
                  animate={
                    answered && selectedWord === question.correct
                      ? {
                          scale: [1, 1.5, 1],
                          color: ["#D4A373", "#65B741", "#D4A373"],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  {displayScore}
                </motion.span>
              </span>
            </div>
          </div>
          <div className="w-full bg-[#F3ECE1] h-3 sm:h-4 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-[#F4D068] to-[#D4A373] h-full rounded-full"
              initial={{
                width: `${(currentIndex / session.questions.length) * 100}%`,
              }}
              animate={{
                width: `${((currentIndex + 1) / session.questions.length) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <motion.div
          className="flex-1 flex flex-col justify-center items-center mb-10 md:mb-16 min-h-[120px]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        >
          {question.imageUrl && (
            <motion.div
              className="mb-6 relative w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-xl border-4 border-white"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <img
                src={question.imageUrl}
                alt="Hint"
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-center text-[#5C4033] leading-[1.8] pt-4 pb-2 drop-shadow-sm tracking-wide mb-4">
            คำไหนเขียนถูก?
          </h2>

          {hintText && (
            <motion.div
              className="bg-white/80 backdrop-blur-sm border border-[#F4D068] shadow-inner rounded-2xl p-4 sm:p-6 max-w-2xl text-center mx-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-[#8B5A2B] text-base sm:text-lg md:text-xl font-medium leading-relaxed">
                <span className="font-bold text-[#996515] mr-2">
                  คำใบ้ความหมาย:
                </span>
                {hintText}
              </p>
            </motion.div>
          )}
        </motion.div>

        <div
          className={`grid gap-4 sm:gap-6 w-full ${options.length > 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 md:grid-cols-2"}`}
        >
          {options.map((word, index) => {
            let cardStateClasses = `${baseCardStyles[index]} ${hoverActiveStyles[index]} text-white`;
            let iconStateClasses = "text-white/20";

            if (answered) {
              const isCorrect = word === question.correct;
              const isSelected = word === selectedWord;

              if (isCorrect) {
                cardStateClasses =
                  "bg-[#65B741] shadow-[0_8px_0_#458529] z-10 text-white ring-4 ring-[#65B741]/50";
                iconStateClasses = "text-white/30 animate-pulse";
              } else if (isSelected) {
                cardStateClasses =
                  "bg-[#E55B5B] shadow-[0_4px_0_#C23B3B] opacity-95 text-white";
                iconStateClasses = "text-white/20";
              } else {
                cardStateClasses =
                  "bg-gray-300 shadow-[0_4px_0_gray-400] opacity-50 grayscale text-gray-100";
                iconStateClasses = "text-black/10";
              }
            }

            return (
              <motion.button
                key={word}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale:
                    answered && word === question.correct
                      ? 1.05
                      : answered && word === selectedWord
                        ? 0.9
                        : answered
                          ? 0.95
                          : 1,
                }}
                transition={{
                  duration: answered ? 0.4 : 0.5,
                  delay: answered ? 0 : index * 0.1,
                  type: "spring",
                }}
                whileHover={
                  !answered ? { scale: 1.02, rotateX: 2, rotateY: 2 } : {}
                }
                whileTap={!answered ? { scale: 0.95, y: 4 } : {}}
                onClick={() => handleAnswer(word)}
                disabled={answered}
                className={`
                  relative overflow-hidden flex items-center p-5 sm:p-8 rounded-3xl min-h-[100px] sm:min-h-[140px]
                  focus:outline-none focus:ring-4 focus:ring-white/50
                  ${cardStateClasses}
                  ${!answered ? "cursor-pointer" : "cursor-default"}
                `}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={`absolute -right-4 -bottom-4 sm:-right-6 sm:-bottom-6 transition-colors duration-300 ${iconStateClasses}`}
                >
                  <ChoiceIcon
                    index={index}
                    className="w-32 h-32 sm:w-48 sm:h-48 transform -rotate-12"
                  />
                </div>

                <div
                  className="relative z-10 flex items-center w-full gap-4 sm:gap-6 pointer-events-none"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <div className="flex-shrink-0 bg-white/20 rounded-xl p-3 shadow-inner backdrop-blur-sm">
                    <ChoiceIcon
                      index={index}
                      className="text-white drop-shadow-md"
                    />
                  </div>
                  <span className="inline-block text-2xl sm:text-3xl md:text-4xl font-black leading-normal">
                    {word}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FDFBF7] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl flex flex-col items-center relative animate-in zoom-in-95 duration-300">
            <h3 className="text-[#8B5A2B] text-xl sm:text-2xl font-bold mb-2">
              เฉลย:
            </h3>
            <h2 className="text-4xl sm:text-5xl font-black text-[#65B741] mb-6 drop-shadow-sm">
              {question.correct}
            </h2>

            <div className="bg-[#F3ECE1] w-full rounded-2xl p-4 sm:p-6 mb-6 text-[#5C4033] text-lg sm:text-xl leading-relaxed border border-[#E8DCC4]">
              {question.explanation}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 text-sm sm:text-base font-semibold w-full justify-center">
              <a
                href="https://dictionary.orst.go.th/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2D9596] hover:text-[#1E6B6C] underline underline-offset-4 flex items-center justify-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                พจนานุกรม
              </a>
              <a
                href="https://royalsociety.go.th/%E0%B8%A8%E0%B8%B1%E0%B8%9E%E0%B8%97%E0%B9%8C%E0%B8%9A%E0%B8%B1%E0%B8%8D%E0%B8%8D%E0%B8%B1%E0%B8%95%E0%B8%B4%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%AA%E0%B8%B3%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B8%87%E0%B8%B2/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2D9596] hover:text-[#1E6B6C] underline underline-offset-4 flex items-center justify-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                ศัพท์บัญญัติ
              </a>
              {question.hasWiki && (
                <a
                  href={`https://th.wikipedia.org/wiki/${encodeURIComponent(question.correct)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2D9596] hover:text-[#1E6B6C] underline underline-offset-4 flex items-center justify-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  วิกิพีเดีย
                </a>
              )}
            </div>

            <div className="w-full flex items-center justify-between gap-4">
              <span className="text-[#8B5A2B] opacity-70 text-sm font-medium">
                ไปข้อถัดไปใน {timeLeft} วินาที...
              </span>
              <button
                onClick={handleNext}
                className="bg-[#D4A373] hover:bg-[#C3905D] text-white px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-1 active:shadow-sm"
              >
                ไปข้อถัดไปทันที
              </button>
            </div>

            {/* Modal Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#E8DCC4] rounded-b-3xl overflow-hidden">
              <div
                className="bg-[#D4A373] h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Background Decor (Subtle Thai vibe) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#996515] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -right-20 w-[30rem] h-[30rem] bg-[#D4A373] rounded-full blur-3xl"></div>
      </div>

      {/* Videos with higher z-index to overlay nicely when they appear */}
      <div className="fixed inset-0 z-[120] pointer-events-none flex items-center justify-center">
        {showVideo === "win" && (
          <TransparentVideo
            src="/videos/win_normal.mp4"
            onEnded={handleVideoEnded}
            stopAt={2}
          />
        )}
        {showVideo === "lose" && (
          <TransparentVideo
            src="/videos/lose_normal.mp4"
            onEnded={handleVideoEnded}
            playbackRate={2}
          />
        )}
      </div>

      {/* Answer Feedback Overlay (Needs to be at root to be above video) */}
      <AnimatePresence>
        {answered && !showExplanation && (
          <motion.div
            key="feedback-overlay"
            className="fixed inset-0 z-[130] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.2, y: 50, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            transition={{ type: "spring", bounce: 0.7, duration: 0.8 }}
          >
            <h1
              className={`text-6xl sm:text-8xl md:text-9xl font-sans font-black leading-[1.6] pt-4 pb-2 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] ${
                selectedWord === question.correct
                  ? "text-[#65B741]"
                  : "text-[#EF4040]"
              } [text-shadow:_4px_4px_0_#FFF,_-4px_-4px_0_#FFF,_4px_-4px_0_#FFF,_-4px_4px_0_#FFF,_0_4px_0_#FFF,_4px_0_0_#FFF,_-4px_0_0_#FFF,_0_-4px_0_#FFF]`}
            >
              {selectedWord === question.correct ? "ถูกต้อง!" : "ผิด!"}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
