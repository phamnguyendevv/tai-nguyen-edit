'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { BottomPlayer } from '@/components/BottomPlayer';
import { SoundEffectCard } from '@/components/SoundEffectCard';
import { SOUND_EFFECTS_DATA } from '@/lib/data/sound-effects';
import { useAudio } from '@/lib/audio/player-context';
import { useAuth } from '@/lib/auth/auth-context';
import { SoundEffect } from '@/types/sfx';
import { Download, Trash2, ArrowLeft, Search, Music, Crown, Sparkles } from 'lucide-react';

export default function DownloadsPage() {
  const { isPro } = useAuth();
  const { downloads, clearDownloads, isDownloadLimitReached, openLimitModal } = useAudio();
  const [filterQuery, setFilterQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Map download history in chronological order (most recent first)
  const downloadedSoundEffects: SoundEffect[] = downloads
    .map((id) => SOUND_EFFECTS_DATA.find((s) => s.id === id))
    .filter(Boolean) as SoundEffect[];

  const filteredItems = downloadedSoundEffects.filter((sfx) =>
    filterQuery
      ? sfx.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        sfx.tags.some((t) => t.toLowerCase().includes(filterQuery.toLowerCase()))
      : true
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
          <Link href="/" className="hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sound Effects Library</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">My Downloads</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              My Downloads
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              {downloadedSoundEffects.length} sound effect
              {downloadedSoundEffects.length === 1 ? '' : 's'} downloaded
            </p>
          </div>

          <div className="flex items-center gap-3">
            {downloadedSoundEffects.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-400 hover:text-red-400 bg-neutral-900 border border-neutral-800 hover:border-red-900/60 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Download History</span>
              </button>
            )}
            <Link
              href="/"
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 hover:text-white transition-all"
            >
              Browse Library
            </Link>
          </div>
        </div>

        {/* Free Plan Quota Notification Banner */}
        {!isPro && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#171717] to-[#111111] border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">Hạn mức tải gói miễn phí</span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isDownloadLimitReached
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {downloads.length} / 5 bài ({Math.min(100, Math.round((downloads.length / 5) * 100))}%)
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-1">
                  {isDownloadLimitReached
                    ? 'Bạn đã đạt giới hạn 5 lượt tải miễn phí. Hãy đăng ký gói thành viên để tải không giới hạn.'
                    : `Bạn còn ${Math.max(0, 5 - downloads.length)} lượt tải miễn phí nữa trước khi cần nâng cấp.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openLimitModal}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nâng cấp Pro không giới hạn</span>
            </button>
          </div>
        )}

        {/* Search filter if there are items */}
        {downloadedSoundEffects.length > 4 && (
          <div className="mb-6 relative max-w-md">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search downloaded sounds..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-[#141414] border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        )}

        {/* Downloads Grid */}
        {downloadedSoundEffects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-[#141414]/60 border border-[#242424]">
            <Download className="w-12 h-12 text-neutral-600 mb-3" />
            <h3 className="text-base font-semibold text-white">No download history yet</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
              Any sound effects you download will appear here so you can easily review, replay, and re-download them.
            </p>
            <Link
              href="/"
              className="mt-5 px-5 py-2 rounded-full text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              Explore Sound Effects
            </Link>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400 text-xs">
            No downloads match &quot;{filterQuery}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
            {filteredItems.map((sfx) => (
              <SoundEffectCard key={sfx.id} soundEffect={sfx} />
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Modal to Clear History */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-[#181818] border border-neutral-700 rounded-2xl shadow-2xl p-6 z-10 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h2 className="text-base font-bold text-white mb-1">Clear Download History?</h2>
            <p className="text-xs text-neutral-400 mb-5">
              This will remove all tracks from your download history list.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearDownloads();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA Banner */}
      <BottomPlayer />
    </div>
  );
}
