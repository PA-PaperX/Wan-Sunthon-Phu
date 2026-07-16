'use client';
import { useEffect, useRef } from 'react';

export default function TransparentVideo({ 
  src, 
  onEnded, 
  stopAt, 
  playbackRate = 1 
}: { 
  src: string, 
  onEnded?: () => void, 
  stopAt?: number, 
  playbackRate?: number 
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const onEndedRef = useRef(onEnded);
  const stopAtRef = useRef(stopAt);
  const playbackRateRef = useRef(playbackRate);

  useEffect(() => {
    onEndedRef.current = onEnded;
    stopAtRef.current = stopAt;
    playbackRateRef.current = playbackRate;
  }, [onEnded, stopAt, playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    video.playbackRate = playbackRateRef.current;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;
    let endedTriggered = false;

    const renderFrame = () => {
      if (video.paused || video.ended) {
        // Keep rendering the last frame if paused, so it freezes!
        // But don't keep looping endlessly if it's completely stopped and we don't need updates.
        // Actually, if we just stop requestAnimationFrame, the canvas holds the last drawn image.
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

    const handleTimeUpdate = () => {
      const stop = stopAtRef.current;
      if (stop && video.currentTime >= stop && !endedTriggered) {
        if (!video.paused) {
          video.pause();
          endedTriggered = true;
          if (onEndedRef.current) onEndedRef.current();
        }
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.play().catch(e => console.error("Video play failed", e));

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
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
        onEnded={() => {
          if (onEndedRef.current) onEndedRef.current();
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
}
