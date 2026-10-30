'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, X, Music, Mic, Volume2, Bookmark, Download, Crown } from 'lucide-react';
import { Category, CategorySlug } from '@/types/sfx';

interface SidebarProps {
  categories: Category[];
  currentCategory: string;
  currentSubcategory: string;
  onSelectCategory: (category: CategorySlug | string, subcategory?: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  currentCategory,
  currentSubcategory,
  onSelectCategory,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  // Only ONE category expanded at a time (defaults to 'realistic')
  const [expandedCategory, setExpandedCategory] = useState<string | null>('realistic');

  const toggleExpand = (catSlug: string) => {
    // If clicking the currently expanded category, collapse it; otherwise open it and close others
    setExpandedCategory((prev) => (prev === catSlug ? null : catSlug));
  };

  const handleCategoryClick = (category: Category) => {
    if (category.slug === 'all') {
      setExpandedCategory(null);
      onSelectCategory('all', '');
      if (onCloseMobile) onCloseMobile();
      return;
    }

    // If clicking a category that has subcategories:
    // - If it is currently expanded, collapse it (close)!
    // - If it is not expanded, open it and automatically close other categories!
    if (category.subcategories && category.subcategories.length > 0) {
      setExpandedCategory((prev) => (prev === category.slug ? null : category.slug));
    } else {
      setExpandedCategory(null);
      if (onCloseMobile) onCloseMobile();
    }

    onSelectCategory(category.slug, '');
  };

  const handleSubcategoryClick = (categorySlug: string, subSlug: string) => {
    onSelectCategory(categorySlug, subSlug);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="w-full flex flex-col gap-1 py-4 text-sm font-normal text-neutral-300">
      {categories.map((category) => {
        const isSelected =
          currentCategory.toLowerCase() === category.slug.toLowerCase() &&
          !currentSubcategory;
        const hasSub = !!category.subcategories && category.subcategories.length > 0;
        const isExpanded = expandedCategory === category.slug;

        return (
          <div key={category.id} className="flex flex-col">
            <div
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 select-none ${
                isSelected
                  ? 'text-white font-medium bg-[#1e1e1e] shadow-sm'
                  : 'hover:text-white hover:bg-neutral-900 text-neutral-300'
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              <span className="truncate">{category.name}</span>
              {hasSub && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(category.slug);
                  }}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                  aria-label={`Toggle ${category.name} subcategories`}
                >
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${
                      isExpanded ? 'rotate-90 text-white' : 'rotate-0 text-neutral-500'
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Smooth CSS Grid Accordion expansion */}
            {hasSub && (
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded
                    ? 'grid-rows-[1fr] opacity-100 my-1'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="ml-3.5 pl-2.5 flex flex-col gap-1 py-0.5 border-l border-neutral-800">
                    {category.subcategories!.map((sub) => {
                      const isSubActive =
                        currentCategory.toLowerCase() === category.slug.toLowerCase() &&
                        currentSubcategory.toLowerCase() === sub.slug.toLowerCase();

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSubcategoryClick(category.slug, sub.slug)}
                          className={`text-left px-3 py-1.5 rounded-md text-xs transition-all duration-200 ${
                            isSubActive
                              ? 'bg-[#222222] text-white font-medium shadow-sm translate-x-0.5'
                              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/80'
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 pr-6 border-r border-[#1a1a1a] min-h-[calc(100vh-4rem)]">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#101010] p-4 sm:p-5 shadow-2xl flex flex-col z-10 border-r border-neutral-800 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-sm font-semibold text-white uppercase tracking-wider">
                Menu & Thư Viện
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Close categories menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="py-2 border-b border-neutral-800 space-y-0.5">
              <Link
                href="/music"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
              >
                <Music className="w-4 h-4 text-neutral-400" />
                <span>Music</span>
              </Link>
              <Link
                href="/voiceover"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
              >
                <Mic className="w-4 h-4 text-neutral-400" />
                <span>Voiceover</span>
              </Link>
              <Link
                href="/"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-neutral-400" />
                <span>Sound Effects</span>
              </Link>
              <Link
                href="/collections"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
              >
                <Bookmark className="w-4 h-4 text-neutral-400" />
                <span>Playlists</span>
              </Link>
              <Link
                href="/downloads"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
              >
                <Download className="w-4 h-4 text-neutral-400" />
                <span>Downloads</span>
              </Link>
              <Link
                href="/pricing"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <Crown className="w-4 h-4 text-white" />
                <span>Gói Pro (69k)</span>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 pr-1">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
