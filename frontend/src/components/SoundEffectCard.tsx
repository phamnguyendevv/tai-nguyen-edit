'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, Download, Heart, Loader2 } from 'lucide-react';
import { SoundEffect } from '@/types/sfx';
import { useAudio } from '@/lib/audio/player-context';
import { useLanguage } from '@/lib/i18n/language-context';
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
    downloads,
    isDownloadLimitReached,
    remainingDownloads,
    openLimitModal,
    toggleFavorite,
    isFavorite,
  } = useAudio();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [optimisticSeek, setOptimisticSeek] = useState<number | null>(null);

  const isFav = isFavorite(soundEffect.id);
  const baseFavorites =
    typeof soundEffect.favoritesCount === 'number'
      ? soundEffect.favoritesCount
      : Math.max(12, Math.round(soundEffect.downloadsCount * 0.18));
  const currentFavoritesCount = baseFavorites + (isFav ? 1 : 0);

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
      onContextMenu={(e) => e.preventDefault()}
      className={`relative group flex items-center justify-between gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 sm:py-3 rounded-lg border transition-colors duration-200 select-none ${
        isCurrent
          ? 'bg-[#181818] border-neutral-600'
          : 'bg-[#121212] border-[#1e1e1e] hover:bg-[#161616] hover:border-neutral-700/80'
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
        className="w-[125px] sm:w-[190px] md:w-[220px] lg:w-[240px] flex-shrink-0 flex flex-col justify-center min-w-0 pr-1 sm:pr-2 select-none"
      >
        <div className="flex items-center gap-1.5 w-full min-w-0 overflow-hidden">
          <Link
            href={`/sound-effects/${soundEffect.slug || soundEffect.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs sm:text-sm font-medium truncate block transition-colors duration-200 hover:underline hover:text-white cursor-pointer ${
              isThisPlaying ? 'text-white font-semibold' : 'text-neutral-200 group-hover:text-white'
            }`}
            title={soundEffect.title}
          >
            {soundEffect.title}
          </Link>
          {/* Animated mini equalizer when playing */}
          {isThisPlaying && (
            <span className="flex items-end gap-[1.5px] h-3 w-3 flex-shrink-0">
              <span className="w-[2px] bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-full" />
              <span className="w-[2px] bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s] h-2/3" />
              <span className="w-[2px] bg-white rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.4s] h-4/5" />
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => togglePlay(soundEffect)}
          className="text-[10px] sm:text-[11px] text-neutral-400 hover:text-neutral-300 font-mono tracking-tight mt-0.5 truncate block text-left cursor-pointer transition-colors"
          title={isThisPlaying ? `Pause ${soundEffect.title}` : `Play ${soundEffect.title}`}
        >
          {formatTime(activeElapsed)} / {formatTime(currentDuration)}
        </button>
      </div>

      {/* Center: Waveform scrubber */}
      <div className="flex-1 min-w-0 px-1 sm:px-3">
        <WaveformScrubber
          waveform={soundEffect.waveform}
          progress={activeProgress}
          isPlaying={isThisPlaying}
          onSeek={handleSeek}
        />
      </div>

      {/* Right: Actions with smooth transitions */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Add To Collection Popover Button (with + icon) */}
        <AddToCollectionPopover soundEffect={soundEffect} />

        {/* Favorite Button (Heart shape) with count */}
        <button
          type="button"
          onClick={() => toggleFavorite(soundEffect.id)}
          className={`flex items-center gap-1.5 px-2 py-1 sm:py-1.5 rounded-md transition-all duration-200 hover:bg-white/5 active:scale-95 cursor-pointer group/fav ${
            isFav ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-400'
          }`}
          title={
            isFav
              ? isVi
                ? `Bỏ thích ${soundEffect.title} (${currentFavoritesCount})`
                : `Unlike ${soundEffect.title} (${currentFavoritesCount})`
              : isVi
              ? `Yêu thích ${soundEffect.title} (${currentFavoritesCount})`
              : `Favorite ${soundEffect.title} (${currentFavoritesCount})`
          }
          aria-label={isVi ? `Yêu thích ${soundEffect.title}` : `Favorite ${soundEffect.title}`}
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 group-hover/fav:scale-110 ${
              isFav ? 'fill-rose-500 text-rose-500 scale-105' : ''
            }`}
          />
          <span
            className={`text-xs font-mono font-medium tabular-nums min-w-[24px] text-left leading-none ${
              isFav ? 'text-rose-400 font-semibold' : 'text-neutral-400 group-hover/fav:text-neutral-200'
            }`}
          >
            {currentFavoritesCount}
          </span>
        </button>

        {/* Download button */}
        <button
          type="button"
          onClick={() => {
            if (isDownloadLimitReached) {
              openLimitModal();
              return;
            }
            downloadTrack(soundEffect);
          }}
          className={`p-1 sm:p-1.5 rounded-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
            isDownloadLimitReached
              ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
              : 'text-red-400 hover:text-red-300 hover:bg-white/5'
          }`}
          title={
            isDownloadLimitReached
              ? isVi
                ? 'Đã đạt giới hạn 5 lượt tải hôm nay - Bấm để nâng cấp Pro'
                : 'Daily limit of 5 downloads reached - Click to upgrade Pro'
              : remainingDownloads !== Infinity
              ? isVi
                ? `Tải ${soundEffect.title} (Còn ${remainingDownloads}/5 lượt hôm nay)`
                : `Download ${soundEffect.title} (${remainingDownloads}/5 left today)`
              : isVi
              ? `Tải ${soundEffect.title} (WAV)`
              : `Download ${soundEffect.title} (WAV)`
          }
          aria-label={isVi ? `Tải ${soundEffect.title}` : `Download ${soundEffect.title}`}
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
