'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Check, FolderPlus, X } from 'lucide-react';
import { SoundEffect } from '@/types/sfx';
import { useAudio } from '@/lib/audio/player-context';
import { useLanguage } from '@/lib/i18n/language-context';

interface AddToCollectionPopoverProps {
  soundEffect: SoundEffect;
}

export const AddToCollectionPopover: React.FC<AddToCollectionPopoverProps> = ({ soundEffect }) => {
  const { language } = useLanguage();
  const {
    collections,
    addToCollection,
    removeFromCollection,
    createCollection,
    isSoundInAnyCollection,
  } = useAudio();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  const isInAny = isSoundInAnyCollection(soundEffect.id);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCreateAndAdd = () => {
    const clean = newColName.trim();
    if (!clean) return;
    createCollection(clean, soundEffect.id);
    setNewColName('');
    setIsCreating(false);
  };

  const filteredCollections = collections.filter((c) =>
    searchQuery ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="relative" ref={popoverRef}>
      {/* Add To Collection Button (Sleek dark neutral button with plus sign) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-200 active:scale-95 border cursor-pointer ${
          isInAny
            ? 'bg-neutral-800 text-white border-neutral-600 shadow-sm hover:bg-neutral-700'
            : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700'
        }`}
        title={language === 'vi' ? 'Thêm vào bộ sưu tập' : 'Add to collection'}
        aria-label={language === 'vi' ? 'Thêm vào bộ sưu tập' : 'Add to collection'}
      >
        <Plus className="w-4 h-4 stroke-[2]" />
      </button>

      {/* Popover Dropdown (Harmonized Dark Theme Gray) */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2.5 w-72 sm:w-80 bg-[#161616] border border-[#2b2b2b] rounded-2xl shadow-2xl p-4 z-50 text-xs select-none animate-in fade-in zoom-in-95 duration-150">
          {/* Search collections input */}
          <div className="relative mb-3.5">
            <input
              type="text"
              placeholder={language === 'vi' ? 'Tìm bộ sưu tập...' : 'Search collections'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1f1f1f] border border-[#333333] rounded-xl pl-3.5 pr-8 py-2 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Section Heading */}
          <div className="text-[11px] font-semibold text-neutral-400 mb-2">
            {language === 'vi' ? 'Thêm vào bộ sưu tập' : 'Add to collection'}
          </div>

          {/* Collections List */}
          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {filteredCollections.length === 0 ? (
              <div className="py-4 text-center text-neutral-500 text-xs">
                {language === 'vi' ? 'Không có bộ sưu tập nào' : 'No collections found'}
              </div>
            ) : (
              filteredCollections.map((col) => {
                const inThisCol = col.itemIds.includes(soundEffect.id);
                return (
                  <div
                    key={col.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-neutral-800/60 transition-colors"
                  >
                    <span
                      className="text-neutral-200 font-medium text-xs truncate max-w-[170px]"
                      title={col.name}
                    >
                      {col.name}
                    </span>

                    {inThisCol ? (
                      <button
                        type="button"
                        onClick={() => removeFromCollection(col.id, soundEffect.id)}
                        className="text-neutral-400 hover:text-red-400 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        {language === 'vi' ? 'Xóa' : 'Remove'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCollection(col.id, soundEffect.id)}
                        className="text-neutral-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        {language === 'vi' ? 'Thêm' : 'Add'}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* + New Collection Button or Inline Form */}
          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full mt-3 py-2.5 rounded-xl bg-[#1e1e1e] hover:bg-[#262626] border border-[#303030] text-neutral-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Tạo bộ sưu tập mới' : 'New Collection'}</span>
            </button>
          ) : (
            <div className="mt-3 pt-2.5 border-t border-neutral-800 animate-in fade-in duration-150">
              <input
                type="text"
                placeholder={language === 'vi' ? 'Tên bộ sưu tập...' : 'Collection name...'}
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateAndAdd();
                }}
                autoFocus
                className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors mb-2"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewColName('');
                  }}
                  className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleCreateAndAdd}
                  disabled={!newColName.trim()}
                  className="px-3.5 py-1 bg-neutral-200 hover:bg-white text-black font-semibold text-xs rounded-lg disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  {language === 'vi' ? 'Tạo' : 'Create'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
