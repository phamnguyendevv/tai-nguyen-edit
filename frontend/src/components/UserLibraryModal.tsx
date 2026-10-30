'use client';

import React, { useState, useEffect } from 'react';
import { X, Bookmark, Download, Trash2, FolderHeart, Music, Sparkles } from 'lucide-react';
import { SoundEffect } from '@/types/sfx';
import { useAudio } from '@/lib/audio/player-context';
import { useLanguage } from '@/lib/i18n/language-context';
import { SoundEffectCard } from './SoundEffectCard';

interface UserLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'collections' | 'downloads';
  allSoundEffects: SoundEffect[];
}

export const UserLibraryModal: React.FC<UserLibraryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'collections',
  allSoundEffects,
}) => {
  const { language, t } = useLanguage();
  const { favorites, downloads, clearDownloads } = useAudio();
  const [activeTab, setActiveTab] = useState<'collections' | 'downloads'>(initialTab);
  const [filterQuery, setFilterQuery] = useState('');

  // Sync tab when opened with a specific initial tab
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Filter collections
  const collectionItems = allSoundEffects
    .filter((item) => favorites.includes(item.id))
    .filter((item) =>
      filterQuery
        ? item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          item.tags.some((t) => t.toLowerCase().includes(filterQuery.toLowerCase()))
        : true
    );

  // Filter downloads (ordered chronologically by most recently downloaded first)
  const downloadItems = downloads
    .map((id) => allSoundEffects.find((item) => item.id === id))
    .filter((item): item is SoundEffect => Boolean(item))
    .filter((item) =>
      filterQuery
        ? item.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
          item.tags.some((t) => t.toLowerCase().includes(filterQuery.toLowerCase()))
        : true
    );

  const currentItems = activeTab === 'collections' ? collectionItems : downloadItems;
  const totalCount = activeTab === 'collections' ? favorites.length : downloads.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#111111] border border-neutral-800 rounded-2xl shadow-2xl p-4 sm:p-6 z-10 max-h-[92vh] sm:max-h-[85vh] flex flex-col">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-800/80 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
            {/* Tab: My Collections */}
            <button
              type="button"
              onClick={() => setActiveTab('collections')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'collections'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'collections' ? 'fill-white text-white' : ''}`} />
              <span>{t('myCollections')}</span>
              <span
                className={`ml-0.5 sm:ml-1 px-1.5 py-0.2 rounded-full text-[10px] sm:text-[11px] font-bold ${
                  activeTab === 'collections'
                    ? 'bg-white text-black'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {favorites.length}
              </span>
            </button>

            {/* Tab: My Downloads */}
            <button
              type="button"
              onClick={() => setActiveTab('downloads')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'downloads'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('myDownloads')}</span>
              <span
                className={`ml-0.5 sm:ml-1 px-1.5 py-0.2 rounded-full text-[10px] sm:text-[11px] font-bold ${
                  activeTab === 'downloads'
                    ? 'bg-white text-black'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {downloads.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Clear Downloads history button if on downloads tab */}
            {activeTab === 'downloads' && downloads.length > 0 && (
              <button
                type="button"
                onClick={clearDownloads}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-all border border-transparent hover:border-red-900/50"
                title={language === 'vi' ? 'Xóa lịch sử tải về' : 'Clear download history'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {language === 'vi' ? 'Xóa lịch sử' : 'Clear history'}
                </span>
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter input bar if there are items */}
        {totalCount > 4 && (
          <div className="pt-3 pb-1">
            <input
              type="text"
              placeholder={
                language === 'vi'
                  ? `Tìm kiếm trong ${activeTab === 'collections' ? 'bộ sưu tập' : 'lịch sử tải về'}...`
                  : `Search in ${activeTab === 'collections' ? 'collections' : 'downloads'}...`
              }
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-[#181818] border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
              {activeTab === 'collections' ? (
                <>
                  <Bookmark className="w-12 h-12 stroke-[1.2] mb-3 text-neutral-600" />
                  <p className="text-sm font-semibold text-neutral-300">
                    {language === 'vi' ? 'Bộ sưu tập của bạn đang trống' : 'Your collection is currently empty'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                    {language === 'vi'
                      ? 'Nhấn biểu tượng đánh dấu trên bất kỳ âm thanh nào để lưu vào bộ sưu tập.'
                      : 'Click the bookmark icon on any sound effect card to save your favorite sounds here for quick access anytime.'}
                  </p>
                </>
              ) : (
                <>
                  <Download className="w-12 h-12 stroke-[1.2] mb-3 text-neutral-600" />
                  <p className="text-sm font-semibold text-neutral-300">
                    {language === 'vi' ? 'Chưa có lịch sử tải về' : 'No download history yet'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                    {language === 'vi'
                      ? 'Các âm thanh bạn tải về sẽ xuất hiện ở đây để bạn dễ dàng nghe lại hoặc tải lại.'
                      : 'Sound effects you download will appear here so you can easily review, replay, or re-download them.'}
                  </p>
                </>
              )}
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-500">
              <p className="text-sm text-neutral-400">
                {language === 'vi'
                  ? `Không tìm thấy âm thanh phù hợp cho "${filterQuery}"`
                  : `No matching sounds found for "${filterQuery}"`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentItems.map((item) => (
                <SoundEffectCard key={item.id} soundEffect={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
