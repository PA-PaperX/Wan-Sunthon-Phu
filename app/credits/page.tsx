'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CreditsPage() {
  const router = useRouter();

  const creators = [
    "ธนพล พ่ออามาตย์",
    "เทพทัต โนรี",
    "ตรีทศเทพ อินพรหมมา",
    "ชนะชัย ดีดวงพันธ์",
    "ปัญญาวุฒิ ศรีแจ่ม"
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 selection:bg-[#F4D068] selection:text-[#5C4033] relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute top-10 right-10 w-[40rem] h-[40rem] bg-[#D4A373] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-[30rem] h-[30rem] bg-[#996515] rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="max-w-xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-[#F4D068] p-8 text-center relative z-10"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-[#8B5A2B] mb-2">ผู้จัดทำ</h1>
        <p className="text-[#996515] mb-8 border-b-2 border-[#E8DCC4] pb-4">วิทยาลัยเทคนิคนวมินทราชินีมุกดาหาร</p>

        <div className="space-y-4 mb-8">
          {creators.map((name, index) => (
            <motion.div
              key={index}
              className="p-4 rounded-xl bg-gradient-to-r from-[#FDFBF7] to-white border border-[#E8DCC4] shadow-sm flex items-center gap-4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (index * 0.1), type: "spring", bounce: 0.4 }}
              whileHover={{ scale: 1.02, borderColor: '#D4A373' }}
            >
              <div className="w-10 h-10 rounded-full bg-[#F4D068] flex items-center justify-center text-[#5C4033] font-bold text-lg shadow-inner">
                {index + 1}
              </div>
              <span className="text-xl font-medium text-[#5C4033]">{name}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={() => router.back()}
          className="inline-block w-full bg-gradient-to-r from-[#996515] to-[#8B5A2B] hover:from-[#8B5A2B] hover:to-[#6E4823] text-white font-bold py-4 px-8 rounded-full text-xl shadow-[0_8px_20px_rgba(139,90,43,0.3)] transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ย้อนกลับ
        </motion.button>
      </motion.div>
    </div>
  );
}
