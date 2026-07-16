import Image from 'next/image';
import { redirect } from 'next/navigation';
import { startSession } from './lib/session';

export default function Home() {
  async function handleStart() {
    'use server';
    await startSession();
    redirect('/quiz');
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-[#F4D068]">
        <div className="relative w-full aspect-[2/3]">
          <Image
            src="/first.png"
            alt="วันภาษาไทยแห่งชาติ"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="p-6 flex justify-center bg-[#FDFBF7]">
          <form action={handleStart} className="w-full">
            <button
              type="submit"
              className="w-full bg-[#996515] hover:bg-[#8B5A2B] text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transition-transform active:scale-95"
            >
              เริ่มเกม
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
