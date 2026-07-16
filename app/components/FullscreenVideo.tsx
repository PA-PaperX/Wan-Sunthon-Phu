'use client';
import { useEffect, useRef } from 'react';

export default function FullscreenVideo({ src, onEnded }: { src: string, onEnded?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Video play failed", e));
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-300">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        playsInline
        muted
        onEnded={onEnded}
      />
    </div>
  );
}
