'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { BottomPlayer } from '@/components/BottomPlayer';
import { SoundEffectCard } from '@/components/SoundEffectCard';
import { SOUND_EFFECTS_DATA } from '@/lib/data/sound-effects';
import { useAudio } from '@/lib/audio/player-context';
import { SoundEffect } from '@/types/sfx';
import {
  Plus,
  Link2,
  MoreVertical,
  ArrowLeft,
  Trash2,
  Edit2,
  FolderPlus,
  Check,
  Music,
} from 'lucide-react';

interface CollectionItem {
  id: string;
  name: string;
  createdAt: string;
  itemIds: string[];
}

export default function CollectionsPage() {
  const { favorites } = useAudio();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load collections from localStorage or initialize with default
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sfx_user_collections');
      if (stored) {
        const parsed: CollectionItem[] = JSON.parse(stored);
        setCollections(parsed);
      } else {
        // Default initial collection seeded with current favorites
        const defaultCol: CollectionItem = {
          id: 'default-favorites',
          name: 'My Saved SFX',
          createdAt: new Date().toISOString(),
          itemIds: favorites.length > 0 ? favorites : ['sfx-birds-in-the-grove', 'sfx-gentle-rain-thunder', 'sfx-heavy-body-impact'],
        };
        setCollections([defaultCol]);
        localStorage.setItem('sfx_user_collections', JSON.stringify([defaultCol]));
      }
    } catch (e) {
      console.warn('Could not load collections:', e);
    }
  }, []);

  // Save collections to localStorage whenever changed
  const saveCollections = (items: CollectionItem[]) => {
    setCollections(items);
    try {
      localStorage.setItem('sfx_user_collections', JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save collections:', e);
    }
  };

  // Ensure default collection is synced with favorites if added from main page
  useEffect(() => {
    if (favorites.length > 0 && collections.length > 0) {
      const defaultCol = collections.find((c) => c.id === 'default-favorites');
      if (defaultCol) {
        const merged = Array.from(new Set([...defaultCol.itemIds, ...favorites]));
        if (merged.length !== defaultCol.itemIds.length) {
          const updated = collections.map((c) =>
            c.id === 'default-favorites' ? { ...c, itemIds: merged } : c
          );
          saveCollections(updated);
        }
      }
    }
  }, [favorites]);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCollectionName.trim();
    if (!cleanName) return;

    const newCol: CollectionItem = {
      id: `col-${Date.now()}`,
      name: cleanName,
      createdAt: new Date().toISOString(),
      itemIds: [],
    };

    const next = [...collections, newCol];
    saveCollections(next);
    setNewCollectionName('');
    setIsCreateModalOpen(false);
    showToast(`Collection "${cleanName}" created!`);
  };

  const handleDeleteCollection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === 'default-favorites' && collections.length === 1) {
      showToast('Cannot delete default collection');
      return;
    }
    const next = collections.filter((c) => c.id !== id);
    saveCollections(next);
    setActiveMenuId(null);
    if (selectedCollectionId === id) setSelectedCollectionId(null);
    showToast('Collection deleted');
  };

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/collections?id=${id}`;
      navigator.clipboard.writeText(url).then(() => {
        showToast('Share link copied to clipboard!');
      });
    }
  };

  const handleStartRename = (col: CollectionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(col.id);
    setRenameValue(col.name);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (!renameValue.trim()) return;
    const next = collections.map((c) =>
      c.id === id ? { ...c, name: renameValue.trim() } : c
    );
    saveCollections(next);
    setRenamingId(null);
    showToast('Collection renamed!');
  };

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);
  const selectedSoundEffects: SoundEffect[] = selectedCollection
    ? (selectedCollection.itemIds
        .map((id) => SOUND_EFFECTS_DATA.find((s) => s.id === id))
        .filter(Boolean) as SoundEffect[])
    : [];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#181818] border border-neutral-700 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 flex flex-col">
        {!selectedCollection ? (
          /* ================= ALL COLLECTIONS VIEW (Matching Image 2) ================= */
          <div>
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6">
              My Collections
            </h1>

            {/* Create New Collection Button (Sleek dark theme button) */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2.5 text-sm font-semibold text-white hover:text-neutral-200 transition-colors mb-8 group cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-white text-black font-black flex items-center justify-center text-sm shadow-sm group-hover:bg-neutral-200 group-hover:scale-110 transition-all">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="group-hover:underline">Create new collection</span>
            </button>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {collections.map((col) => {
                const assetCount = col.itemIds.length;
                const firstSound = SOUND_EFFECTS_DATA.find((s) => s.id === col.itemIds[0]);
                const previewTitle = firstSound ? firstSound.title : col.name;

                return (
                  <div
                    key={col.id}
                    onClick={() => setSelectedCollectionId(col.id)}
                    className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer border border-[#262626] hover:border-neutral-500 bg-[#141414] hover:bg-[#181818] transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* Top Preview Card (Charcoal Grey with Sound Title & Audio Waves) */}
                    <div className="relative h-40 bg-[#1a1a1a] p-4 flex flex-col justify-between overflow-hidden">
                      {/* Top Preview Title */}
                      <span className="text-xs font-semibold text-neutral-300 truncate max-w-[90%]">
                        {previewTitle}
                      </span>

                      {/* Centered Clean Audio Equalizer Bars (Neutral silver/white) */}
                      <div className="flex items-center justify-center gap-1.5 h-10 my-auto">
                        <span className="w-1 bg-neutral-300 group-hover:bg-white h-3 rounded-full transition-colors" />
                        <span className="w-1 bg-neutral-300 group-hover:bg-white h-6 rounded-full transition-colors" />
                        <span className="w-1 bg-neutral-300 group-hover:bg-white h-9 rounded-full transition-colors" />
                        <span className="w-1 bg-neutral-300 group-hover:bg-white h-5 rounded-full transition-colors" />
                        <span className="w-1 bg-neutral-300 group-hover:bg-white h-3 rounded-full transition-colors" />
                      </div>

                      {/* Subtle hover gradient */}
                      <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    {/* Bottom Card Footer Area */}
                    <div className="px-4 py-3 bg-[#121212] border-t border-[#242424] flex items-center justify-between">
                      {/* Left: Asset count */}
                      <div>
                        <div className="text-sm font-bold text-white leading-tight">
                          {assetCount}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {assetCount === 1 ? '1 asset' : `${assetCount} assets`}
                        </div>
                      </div>

                      {/* Right: Actions (Copy Link & 3 Dots Menu) */}
                      <div className="flex items-center gap-2">
                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(col.id, e)}
                          className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          title="Copy link"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>

                        {/* More 3-Dots Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === col.id ? null : col.id);
                            }}
                            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === col.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 bottom-full mb-1 w-40 bg-[#181818] border border-neutral-700 rounded-lg shadow-2xl p-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-150"
                            >
                              <button
                                type="button"
                                onClick={(e) => handleStartRename(col, e)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors text-left"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Rename</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCollection(col.id, e)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ================= SINGLE COLLECTION DETAILS VIEW ================= */
          <div>
            {/* Back to collections breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
              <button
                type="button"
                onClick={() => setSelectedCollectionId(null)}
                className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>My Collections</span>
              </button>
              <span>/</span>
              <span className="text-white font-medium">{selectedCollection.name}</span>
            </div>

            {/* Collection Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedCollection.name}
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  {selectedSoundEffects.length} sound effect
                  {selectedSoundEffects.length === 1 ? '' : 's'} in this collection
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCollectionId(null)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 hover:text-white transition-all cursor-pointer"
                >
                  View All Collections
                </button>
              </div>
            </div>

            {/* Sound Effects in this Collection */}
            {selectedSoundEffects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-[#141414]/60 border border-[#242424]">
                <Music className="w-12 h-12 text-neutral-600 mb-3" />
                <h3 className="text-base font-semibold text-white">This collection is empty</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  Browse sound effects in the catalog and click the bookmark icon to save them to your collections.
                </p>
                <Link
                  href="/"
                  className="mt-5 px-5 py-2 rounded-full text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  Explore Sound Effects
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                {selectedSoundEffects.map((sfx) => (
                  <SoundEffectCard key={sfx.id} soundEffect={sfx} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Collection Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#161616] border border-[#2b2b2b] rounded-2xl shadow-2xl p-6 z-10">
            <h2 className="text-lg font-bold text-white mb-2">Create New Collection</h2>
            <p className="text-xs text-neutral-400 mb-4">
              Give your collection a name to organize your favorite sound effects.
            </p>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Cinematic Trailers, Nature Foley, Sci-Fi Impacts..."
                  autoFocus
                  className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCollectionName.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-white hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Collection Modal */}
      {renamingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setRenamingId(null)}
          />
          <div className="relative w-full max-w-md bg-[#161616] border border-[#2b2b2b] rounded-2xl shadow-2xl p-6 z-10">
            <h2 className="text-lg font-bold text-white mb-2">Rename Collection</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-neutral-400 transition-colors"
              />
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingId(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveRename(renamingId)}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-all font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Call to Action */}
      <BottomPlayer />
    </div>
  );
}
