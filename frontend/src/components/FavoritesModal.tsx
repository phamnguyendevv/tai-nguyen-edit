'use client';

import React from 'react';
import { X, Bookmark, Trash2 } from 'lucide-react';
import { SoundEffect } from '@/types/sfx';
import { useAudio } from '@/lib/audio/player-context';
import { SoundEffectCard } from './SoundEffectCard';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSoundEffects: SoundEffect[];
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  allSoundEffects,
}) => {
  const { favorites } = useAudio();

  if (!isOpen) return null;

  const favoriteItems = allSoundEffects.filter((item) =>
    favorites.includes(item.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#111111] border border-neutral-800 rounded-xl shadow-2xl p-6 z-10 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-white fill-white" />
            <h2 className="text-lg font-bold text-white">
              My Saved Sound Effects ({favoriteItems.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {favoriteItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
              <Bookmark className="w-12 h-12 stroke-[1.2] mb-3 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-300">
                You haven&apos;t saved any sound effects yet.
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                Click the bookmark icon on any sound effect card to save it for quick access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {favoriteItems.map((item) => (
                <SoundEffectCard key={item.id} soundEffect={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
