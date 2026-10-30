'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface WaveformScrubberProps {
  waveform: number[];
  progress: number; // 0 to 1
  isPlaying: boolean;
  onSeek: (percent: number) => void;
  height?: number;
}

export const WaveformScrubber: React.FC<WaveformScrubberProps> = ({
  waveform,
  progress,
  isPlaying,
  onSeek,
  height = 28,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculatePercent = useCallback((clientX: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const offsetX = clientX - rect.left;
    return Math.max(0, Math.min(1, offsetX / rect.width));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0) return; // Primary click only

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if setPointerCapture not supported
    }

    setIsDragging(true);
    const pct = calculatePercent(e.clientX);
    setHoverPercent(pct);
    onSeek(pct);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pct = calculatePercent(e.clientX);
    setHoverPercent(pct);

    if (isDragging) {
      e.stopPropagation();
      e.preventDefault();
      onSeek(pct);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
      setIsDragging(false);
      const pct = calculatePercent(e.clientX);
      onSeek(pct);
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverPercent(null);
    }
  };

  // Window pointerup safety listener in case pointer leaves window while dragging
  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalUp = () => {
      setIsDragging(false);
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
    };
  }, [isDragging]);

  const barCount = waveform.length || 64;
  const effectiveProgress = isDragging && hoverPercent !== null ? hoverPercent : progress;
  // Exact clamp of playhead between 0% and 100%
  const playheadPercent = Math.max(0, Math.min(1, effectiveProgress));

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className="relative flex items-center justify-between gap-[1.5px] sm:gap-[2px] w-full h-[28px] cursor-pointer group px-0 py-1 select-none touch-none"
      title="Click or drag to seek anywhere in the sound"
    >
      {waveform.map((bar, index) => {
        // Center position of this bar bucket
        const barCenter = (index + 0.5) / barCount;
        const isPassed = effectiveProgress > 0 && barCenter <= effectiveProgress;
        const distanceToPlayhead = Math.abs(barCenter - playheadPercent);
        const isNearPlayhead = isPlaying && distanceToPlayhead <= (1.2 / barCount);
        const isHovered = hoverPercent !== null && barCenter <= hoverPercent;

        // When amplitude is quiet/silence, render as a clean delicate 2px center dot
        const isQuiet = bar <= 0.05;
        const barHeight = isQuiet
          ? 2
          : Math.max(3, Math.min(height - 2, Math.round(bar * (height - 2))));

        return (
          <div
            key={index}
            className="flex-1 flex items-center justify-center h-full pointer-events-none"
          >
            <div
              style={{ height: `${barHeight}px` }}
              className={`w-[1.5px] rounded-full transition-all duration-75 ease-out ${
                isPassed
                  ? isNearPlayhead
                    ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,1)] scale-y-115'
                    : 'bg-white shadow-[0_0_2px_rgba(255,255,255,0.7)]'
                  : isHovered
                  ? 'bg-neutral-200'
                  : isQuiet
                  ? 'bg-neutral-500/70 group-hover:bg-neutral-400'
                  : 'bg-neutral-400 group-hover:bg-neutral-300'
              }`}
            />
          </div>
        );
      })}

      {/* Always-visible sleek DAW-style vertical playhead line cursor */}
      <div
        className="absolute top-0 bottom-0 w-[1.5px] bg-white pointer-events-none rounded-full -translate-x-1/2 z-10 transition-none"
        style={{
          left: `${playheadPercent * 100}%`,
          boxShadow: isPlaying
            ? '0 0 8px rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,1)'
            : '0 0 3px rgba(255,255,255,0.4)',
        }}
      />

      {/* Hover preview indicator line */}
      {hoverPercent !== null && !isDragging && (
        <div
          className="absolute top-0 bottom-0 w-[1px] bg-white/40 pointer-events-none -translate-x-1/2 z-0"
          style={{ left: `${hoverPercent * 100}%` }}
        />
      )}
    </div>
  );
};
