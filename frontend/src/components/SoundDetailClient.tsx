'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  Download,
  Heart,
  ChevronRight,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Music,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { BottomPlayer } from '@/components/BottomPlayer';
import { WaveformScrubber } from '@/components/WaveformScrubber';
import { SoundEffectCard } from '@/components/SoundEffectCard';
import { SOUND_EFFECTS_DATA } from '@/lib/data/sound-effects';
import { CATEGORIES_DATA } from '@/lib/data/categories';
import { useAudio } from '@/lib/audio/player-context';
import { useLanguage } from '@/lib/i18n/language-context';
import { SoundEffect } from '@/types/sfx';

interface SoundDetailClientProps {
  soundId: string;
}

export function SoundDetailClient({ soundId }: SoundDetailClientProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const isVi = language === 'vi';
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    togglePlay,
    seekTrack,
    downloadTrack,
    isDownloadLimitReached,
    openLimitModal,
    toggleFavorite,
    isFavorite,
  } = useAudio();

  // Find the target sound effect by id or slug
  const soundEffect = useMemo(() => {
    const cleanId = decodeURIComponent(soundId).toLowerCase();
    return (
      SOUND_EFFECTS_DATA.find(
        (s) =>
          s.id.toLowerCase() === cleanId ||
          s.slug.toLowerCase() === cleanId ||
          s.id.replace(/^sfx-/, '').toLowerCase() === cleanId
      ) || null
    );
  }, [soundId]);

  // Find category and subcategory meta
  const categoryObj = useMemo(() => {
    if (!soundEffect) return null;
    return (
      CATEGORIES_DATA.find(
        (c) => c.slug.toLowerCase() === soundEffect.category.toLowerCase()
      ) || null
    );
  }, [soundEffect]);

  const subcategoryObj = useMemo(() => {
    if (!categoryObj || !soundEffect) return null;
    return (
      categoryObj.subcategories?.find(
        (s) => s.slug.toLowerCase() === soundEffect.subcategory.toLowerCase()
      ) || null
    );
  }, [categoryObj, soundEffect]);

  // Similar sounds: items from same subcategory/category, excluding current sound
  const similarSounds = useMemo(() => {
    if (!soundEffect) return [];
    const others = SOUND_EFFECTS_DATA.filter((s) => s.id !== soundEffect.id);

    const sameSub = others.filter(
      (s) =>
        s.category.toLowerCase() === soundEffect.category.toLowerCase() &&
        s.subcategory.toLowerCase() === soundEffect.subcategory.toLowerCase()
    );
    const sameCat = others.filter(
      (s) =>
        s.category.toLowerCase() === soundEffect.category.toLowerCase() &&
        s.subcategory.toLowerCase() !== soundEffect.subcategory.toLowerCase()
    );
    const rest = others.filter(
      (s) => s.category.toLowerCase() !== soundEffect.category.toLowerCase()
    );

    return [...sameSub, ...sameCat, ...rest].slice(0, 6);
  }, [soundEffect]);

  // Playback state of featured track
  const isCurrent = currentTrack?.id === soundEffect?.id;
  const isThisPlaying = isCurrent && isPlaying;
  const isThisLoading = isCurrent && isLoading;

  const currentDuration =
    isCurrent && duration > 0 ? duration : soundEffect?.duration || 0;
  const currentElapsed = isCurrent ? currentTime : 0;
  const progressPercent =
    currentDuration > 0 ? currentElapsed / currentDuration : 0;

  // Format time as m:ss
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (percent: number) => {
    if (soundEffect) {
      seekTrack(soundEffect, percent);
    }
  };

  const isFav = soundEffect ? isFavorite(soundEffect.id) : false;
  const baseFavorites = soundEffect
    ? typeof soundEffect.favoritesCount === 'number'
      ? soundEffect.favoritesCount
      : Math.max(12, Math.round(soundEffect.downloadsCount * 0.18))
    : 0;
  const currentFavoritesCount = baseFavorites + (isFav ? 1 : 0);

  if (!soundEffect) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
        <Header onToggleSidebar={() => setIsSidebarOpenMobile(true)} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Music className="w-16 h-16 text-neutral-600 mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {isVi ? 'Không tìm thấy âm thanh' : 'Sound Effect Not Found'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-6">
            {isVi
              ? 'Âm thanh bạn tìm kiếm có thể đã được đổi tên hoặc chuyển sang danh mục khác.'
              : 'The sound effect you are looking for might have been moved or removed.'}
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isVi ? 'Quay lại thư viện âm thanh' : 'Back to Sound Effects Library'}</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* Top Navbar */}
      <Header onToggleSidebar={() => setIsSidebarOpenMobile(true)} />

      {/* Main Container */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6 flex gap-4 lg:gap-8 pb-16">
        {/* Left Categories Sidebar (identical to homepage) */}
        <Sidebar
          categories={CATEGORIES_DATA}
          currentCategory={soundEffect.category}
          currentSubcategory={soundEffect.subcategory}
          onSelectCategory={(catSlug, subSlug) => {
            const params = new URLSearchParams();
            if (catSlug && catSlug !== 'all') params.set('category', catSlug);
            if (subSlug) params.set('subcategory', subSlug);
            router.push(`/?${params.toString()}`);
          }}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Center / Right Detail Content Area */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Breadcrumb Navigation Bar */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4 font-medium flex-wrap">
            <Link
              href="/"
              className="hover:text-white transition-colors py-1 flex items-center gap-1"
            >
              <span>{t('stockSoundEffects') || 'Stock sound effects'}</span>
            </Link>

            {categoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                <Link
                  href={`/?category=${categoryObj.slug}`}
                  className="hover:text-white transition-colors flex items-center gap-1 py-1"
                >
                  <span>{categoryObj.name}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-500" />
                </Link>
              </>
            )}

            {subcategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                <Link
                  href={`/?category=${soundEffect.category}&subcategory=${subcategoryObj.slug}`}
                  className="hover:text-white transition-colors flex items-center gap-1 py-1"
                >
                  <span>{subcategoryObj.name}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-500" />
                </Link>
              </>
            )}

            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
            <span className="text-white font-semibold truncate">
              {soundEffect.title}
            </span>
          </div>

          {/* Sound Title Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white capitalize">
              {soundEffect.title}
            </h1>
          </div>

          {/* Featured Sound Player Card (matches screenshot) */}
          <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-4 sm:p-5 md:p-6 mb-8 sm:mb-10 shadow-2xl flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 md:gap-6">
            {/* Play Button & Time tracker */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => togglePlay(soundEffect)}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-neutral-700/60 transition-all cursor-pointer shadow-md flex-shrink-0"
                aria-label={
                  isThisPlaying
                    ? `Pause ${soundEffect.title}`
                    : `Play ${soundEffect.title}`
                }
              >
                {isThisLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : isThisPlaying ? (
                  <Pause className="w-5 h-5 fill-white stroke-white" />
                ) : (
                  <Play className="w-5 h-5 text-white fill-transparent stroke-white ml-0.5 stroke-[2.2]" />
                )}
              </button>

              <span className="text-xs sm:text-sm font-mono text-neutral-300 min-w-[75px]">
                {formatTime(currentElapsed)} / {formatTime(currentDuration)}
              </span>
            </div>

            {/* Central Waveform Scrubber */}
            <div className="flex-1 w-full min-w-0 px-0 sm:px-2 overflow-hidden">
              <WaveformScrubber
                waveform={soundEffect.waveform}
                progress={progressPercent}
                isPlaying={isThisPlaying}
                onSeek={handleSeek}
                height={34}
              />
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 flex-shrink-0 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80">
              {/* Download Button (prominent white pill matching screenshot) */}
              <button
                type="button"
                onClick={() => {
                  if (isDownloadLimitReached) {
                    openLimitModal();
                    return;
                  }
                  downloadTrack(soundEffect);
                }}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-black bg-white hover:bg-neutral-200 active:scale-95 transition-all shadow-md cursor-pointer flex-shrink-0"
              >
                <Download className="w-4 h-4 text-black stroke-[2.2]" />
                <span>{isVi ? 'Tải về' : 'Download'}</span>
              </button>

              {/* Heart Favorite Button */}
              <button
                type="button"
                onClick={() => toggleFavorite(soundEffect.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 flex-shrink-0 ${
                  isFav
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                    : 'border-neutral-700/80 bg-neutral-900 text-neutral-400 hover:text-rose-400 hover:border-neutral-600'
                }`}
                title={
                  isFav
                    ? isVi
                      ? `Bỏ thích (${currentFavoritesCount})`
                      : `Unlike (${currentFavoritesCount})`
                    : isVi
                    ? `Yêu thích (${currentFavoritesCount})`
                    : `Favorite (${currentFavoritesCount})`
                }
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFav ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
                <span className="text-xs font-mono font-medium leading-none tabular-nums pr-1">
                  {currentFavoritesCount}
                </span>
              </button>
            </div>
          </div>

          {/* Similar Sounds Section (2 columns grid matching screenshot) */}
          <div className="pt-2">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>{isVi ? 'Âm thanh tương tự' : 'Similar Sounds'}</span>
            </h2>

            {similarSounds.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6">
                {isVi ? 'Không có âm thanh tương tự.' : 'No similar sounds found.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 sm:gap-3.5">
                {similarSounds.map((item) => (
                  <SoundEffectCard key={item.id} soundEffect={item} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomPlayer />
    </div>
  );
}
