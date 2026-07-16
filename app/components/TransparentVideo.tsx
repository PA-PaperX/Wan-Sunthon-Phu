'use client';
import { useEffect, useRef } from 'react';

export default function TransparentVideo({ src, onEnded }: { src: string, onEnded?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;

    const renderFrame = () => {
      if (video.paused || video.ended) {
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameId = requestAnimationFrame(renderFrame);
        return;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 1. Remove Green Screen
        if (g > 90 && g > r * 1.3 && g > b * 1.3) {
          data[i + 3] = 0;
        }
        // 2. Remove White Background
        else if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(frame, 0, 0);

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    const handlePlay = () => {
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    video.addEventListener('play', handlePlay);
    video.play().catch(e => console.error("Video play failed", e));

    return () => {
      video.removeEventListener('play', handlePlay);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      <video
        ref={videoRef}
        src={src}
        className="hidden"
        playsInline
        muted
        onEnded={onEnded}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
}
