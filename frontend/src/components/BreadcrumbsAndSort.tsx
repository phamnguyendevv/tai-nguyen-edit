'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { SortOption, Category } from '@/types/sfx';
import { useLanguage } from '@/lib/i18n/language-context';

interface BreadcrumbsAndSortProps {
  category: string;
  subcategory: string;
  categories: Category[];
  sort: SortOption;
  onSelectCategory: (category: string, subcategory?: string) => void;
  onSelectSort: (sort: SortOption) => void;
}

export const BreadcrumbsAndSort: React.FC<BreadcrumbsAndSortProps> = ({
  category,
  subcategory,
  categories,
  sort,
  onSelectCategory,
  onSelectSort,
}) => {
  const { language, t } = useLanguage();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (catRef.current && !catRef.current.contains(event.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (subRef.current && !subRef.current.contains(event.target as Node)) {
        setIsSubDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCatObj = categories.find(
    (c) => c.slug.toLowerCase() === category.toLowerCase()
  );

  const currentSubObj = currentCatObj?.subcategories?.find(
    (s) => s.slug.toLowerCase() === subcategory.toLowerCase()
  );

  const sortLabels: Record<SortOption, string> = {
    'most-popular': t('mostPopular'),
    'most-favorites': t('mostFavorites'),
    'newest': t('newest'),
    'oldest': t('oldest'),
    'name-asc': t('nameAsc'),
    'name-desc': t('nameDesc'),
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 text-xs text-neutral-300">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 font-medium flex-wrap">
        <button
          type="button"
          onClick={() => onSelectCategory('all', '')}
          className="hover:text-white transition-colors text-neutral-400 py-1"
        >
          {t('stockSoundEffects')}
        </button>

        {currentCatObj && currentCatObj.slug !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <div className="relative" ref={catRef}>
              <button
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="flex items-center gap-1 text-white hover:text-neutral-200 py-1 px-1.5 rounded hover:bg-neutral-900 transition-all"
              >
                <span>{currentCatObj.name}</span>
                <ChevronDown
                  className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${
                    isCatDropdownOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Smooth Category Dropdown */}
              <div
                className={`absolute left-0 mt-2 w-48 bg-[#181818]/95 backdrop-blur-md border border-neutral-800 rounded-lg shadow-2xl py-1.5 z-30 transition-all duration-200 origin-top-left ${
                  isCatDropdownOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
              >
                {categories
                  .filter((c) => c.slug !== 'all')
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelectCategory(c.slug, '');
                        setIsCatDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-neutral-800 transition-all duration-150 ${
                        c.slug === currentCatObj.slug
                          ? 'text-white font-semibold bg-neutral-800/40'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}

        {currentSubObj && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <div className="relative" ref={subRef}>
              <button
                type="button"
                onClick={() => setIsSubDropdownOpen(!isSubDropdownOpen)}
                className="flex items-center gap-1 text-white hover:text-neutral-200 py-1 px-1.5 rounded hover:bg-neutral-900 transition-all"
              >
                <span>{currentSubObj.name}</span>
                <ChevronDown
                  className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${
                    isSubDropdownOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Smooth Subcategory Dropdown */}
              {currentCatObj?.subcategories && (
                <div
                  className={`absolute left-0 mt-2 w-52 bg-[#181818]/95 backdrop-blur-md border border-neutral-800 rounded-lg shadow-2xl py-1.5 z-30 transition-all duration-200 origin-top-left ${
                    isSubDropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                  }`}
                >
                  {currentCatObj.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        onSelectCategory(currentCatObj.slug, sub.slug);
                        setIsSubDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-neutral-800 transition-all duration-150 ${
                        sub.slug === currentSubObj.slug
                          ? 'text-white font-semibold bg-neutral-800/40'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sort By Dropdown on the Right with smooth expansion */}
      <div className="relative" ref={sortRef}>
        <button
          type="button"
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-all duration-200"
        >
          <span className="text-neutral-500">{t('sortBy')}</span>
          <span className="font-semibold text-white">{sortLabels[sort]}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
              isSortOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {/* Smooth expanding dropdown container */}
        <div
          className={`absolute right-0 mt-2 w-48 bg-[#181818]/95 backdrop-blur-md border border-neutral-800 rounded-lg shadow-2xl py-1.5 z-30 transition-all duration-200 origin-top-right ${
            isSortOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
          }`}
        >
          {(Object.keys(sortLabels) as SortOption[]).map((optionKey) => (
            <button
              key={optionKey}
              type="button"
              onClick={() => {
                onSelectSort(optionKey);
                setIsSortOpen(false);
              }}
              className={`w-full text-left px-3.5 py-1.5 text-xs transition-all duration-150 ${
                sort === optionKey
                  ? 'text-white font-semibold bg-neutral-800/70'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
              }`}
            >
              {sortLabels[optionKey]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
