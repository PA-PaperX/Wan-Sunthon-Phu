'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { startSession } from '../lib/session';

export default function AnimatedHome() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const floatingChars = ['ก', 'ข', 'ค', 'ฆ', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ญ', 'ฎ', 'ฏ'];
  
  const [randomPositions, setRandomPositions] = useState<{x: number, y: number, r: number, s: number}[]>([]);
  
  useEffect(() => {
    setRandomPositions(floatingChars.map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 360,
      s: Math.random() * 0.5 + 0.5
    })));
    setMounted(true);
  }, []);

  const handleStart = () => {
    startSession();
    router.push('/quiz');
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden min-h-screen bg-[#FDFBF7] p-4">
      {/* Floating Background Characters */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
          {randomPositions.map((pos, index) => (
            <motion.div
              key={index}
              className="absolute text-8xl font-bold text-[#8B5A2B]"
              initial={{ 
                x: pos.x + 'vw', 
                y: pos.y + 'vh',
                rotate: pos.r,
                scale: pos.s
              }}
              animate={{
                y: [null, Math.random() * -200 - 100],
                x: [null, Math.random() * 100 - 50],
                rotate: [null, pos.r + 360]
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear'
              }}
            >
              {floatingChars[index]}
            </motion.div>
          ))}
        </div>
      )}

      <motion.div 
        className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-[#F4D068] relative z-10"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
      >
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#FDFBF7]">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full relative"
          >
            <Image
              src="/first.png"
              alt="วันภาษาไทยแห่งชาติ"
              fill
              className="object-contain p-4"
              priority
            />
          </motion.div>
        </div>
        
        <div className="p-8 flex justify-center bg-gradient-to-b from-[#FDFBF7] to-[#F3ECE1]">
          <motion.button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-[#996515] to-[#8B5A2B] hover:from-[#8B5A2B] hover:to-[#6E4823] text-white font-black tracking-wider py-5 px-8 rounded-full text-2xl shadow-[0_8px_20px_rgba(139,90,43,0.3)] transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: ['0px 8px 20px rgba(139,90,43,0.3)', '0px 12px 30px rgba(139,90,43,0.6)', '0px 8px 20px rgba(139,90,43,0.3)']
            }}
            transition={{
              boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            เริ่มเกม
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
