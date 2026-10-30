'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Loader2 } from 'lucide-react';
import { SoundEffect } from '@/types/sfx';
import { useAudio } from '@/lib/audio/player-context';
import { WaveformScrubber } from './WaveformScrubber';
import { AddToCollectionPopover } from './AddToCollectionPopover';

interface SoundEffectCardProps {
  soundEffect: SoundEffect;
}

export const SoundEffectCard: React.FC<SoundEffectCardProps> = ({ soundEffect }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    togglePlay,
    seekTrack,
    downloadTrack,
  } = useAudio();

  const [optimisticSeek, setOptimisticSeek] = useState<number | null>(null);

  const isCurrent = currentTrack?.id === soundEffect.id;
  const isThisPlaying = isCurrent && isPlaying;
  const isThisLoading = isCurrent && isLoading;

  // Format time as m:ss
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentDuration = isCurrent && duration > 0 ? duration : soundEffect.duration;
  const currentElapsed = isCurrent ? currentTime : 0;
  const progressPercent = currentDuration > 0 ? currentElapsed / currentDuration : 0;

  // Clear optimistic seek once real progress aligns or track changes
  useEffect(() => {
    if (optimisticSeek !== null) {
      if (!isCurrent) {
        setOptimisticSeek(null);
      } else if (Math.abs(progressPercent - optimisticSeek) < 0.04) {
        setOptimisticSeek(null);
      } else {
        const timer = setTimeout(() => {
          setOptimisticSeek(null);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [optimisticSeek, isCurrent, progressPercent]);

  const activeProgress = optimisticSeek !== null ? optimisticSeek : progressPercent;
  const activeElapsed = optimisticSeek !== null ? optimisticSeek * currentDuration : currentElapsed;

  const handleSeek = (percent: number) => {
    setOptimisticSeek(percent);
    seekTrack(soundEffect, percent);
  };

  return (
    <div
      className={`relative group flex items-center justify-between gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 sm:py-3 rounded-lg border transition-all duration-300 ease-out ${
        isCurrent
          ? 'bg-[#181818] border-neutral-600/90 shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(255,255,255,0.06)] ring-1 ring-white/10'
          : 'bg-[#121212] border-[#1e1e1e] hover:bg-[#161616] hover:border-neutral-700/80 hover:shadow-lg'
      }`}
    >
      {/* Left: Play/Pause button with smooth micro-interactions */}
      <button
        type="button"
        onClick={() => togglePlay(soundEffect)}
        className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-300 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer hover:scale-105"
        aria-label={isThisPlaying ? `Pause ${soundEffect.title}` : `Play ${soundEffect.title}`}
      >
        {isThisLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-neutral-300" />
        ) : isThisPlaying ? (
          <Pause className="w-4 h-4 fill-white stroke-white" />
        ) : (
          <Play className="w-4 h-4 text-neutral-300 fill-transparent stroke-neutral-300 hover:stroke-white ml-0.5 stroke-[2]" />
        )}
      </button>

      {/* Title & Duration & Mini Audio Bars */}
      <div
        onClick={() => togglePlay(soundEffect)}
        className="flex flex-col min-w-[80px] sm:min-w-[130px] max-w-[110px] sm:max-w-[175px] truncate cursor-pointer select-none"
        title={isThisPlaying ? `Pause ${soundEffect.title}` : `Play ${soundEffect.title}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span
            className={`text-xs sm:text-sm font-medium truncate transition-colors duration-200 ${
              isThisPlaying ? 'text-white font-semibold' : 'text-neutral-200 group-hover:text-white'
            }`}
            title={soundEffect.title}
          >
            {soundEffect.title}
          </span>
          {/* Animated mini equalizer when playing */}
          {isThisPlaying && (
            <span className="flex items-end gap-[1.5px] h-3 w-3 flex-shrink-0">
              <span className="w-[2px] bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-full" />
              <span className="w-[2px] bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s] h-2/3" />
              <span className="w-[2px] bg-white rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.4s] h-4/5" />
            </span>
          )}
        </div>
        <span className="text-[10px] sm:text-[11px] text-neutral-400 font-mono tracking-tight mt-0.5">
          {formatTime(activeElapsed)} / {formatTime(currentDuration)}
        </span>
      </div>

      {/* Center: Waveform scrubber */}
      <div className="flex-1 min-w-[70px] sm:min-w-[100px] px-0.5 sm:px-1">
        <WaveformScrubber
          waveform={soundEffect.waveform}
          progress={activeProgress}
          isPlaying={isThisPlaying}
          onSeek={handleSeek}
        />
      </div>

      {/* Right: Actions with smooth transitions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Add To Collection Popover Button (with + icon) */}
        <AddToCollectionPopover soundEffect={soundEffect} />

        {/* Download button */}
        <button
          type="button"
          onClick={() => downloadTrack(soundEffect)}
          className="p-1 sm:p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-white/5 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          title={`Download ${soundEffect.title} (WAV)`}
          aria-label={`Download ${soundEffect.title}`}
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
