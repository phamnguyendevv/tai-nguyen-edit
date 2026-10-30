'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { BreadcrumbsAndSort } from '@/components/BreadcrumbsAndSort';
import { SoundEffectCard } from '@/components/SoundEffectCard';
import { BottomPlayer } from '@/components/BottomPlayer';
import { Pagination } from '@/components/Pagination';
import { SoundEffect, Category, SortOption, PaginatedSoundEffectsResponse } from '@/types/sfx';
import { CATEGORIES_DATA } from '@/lib/data/categories';
import { SOUND_EFFECTS_DATA } from '@/lib/data/sound-effects';
import { VolumeX, Search, Sparkles, RefreshCw } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/auth-context';
import { useLanguage } from '@/lib/i18n/language-context';

interface SoundEffectsExplorerProps {
  initialCategory?: string;
  initialTitle?: string;
}

export default function SoundEffectsExplorer({
  initialCategory,
  initialTitle,
}: SoundEffectsExplorerProps = {}) {
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL search params sync
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || initialCategory || 'all';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const sortParam = (searchParams.get('sort') as SortOption) || 'most-popular';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local states
  const [data, setData] = useState<PaginatedSoundEffectsResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  // Sync state to URL
  const updateUrlParams = useCallback(
    (updates: {
      q?: string;
      category?: string;
      subcategory?: string;
      sort?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.q !== undefined) {
        if (updates.q) params.set('q', updates.q);
        else params.delete('q');
      }

      if (updates.category !== undefined) {
        if (updates.category && updates.category !== 'all') {
          params.set('category', updates.category);
        } else {
          params.delete('category');
        }
      }

      if (updates.subcategory !== undefined) {
        if (updates.subcategory) params.set('subcategory', updates.subcategory);
        else params.delete('subcategory');
      }

      if (updates.sort !== undefined) {
        if (updates.sort !== 'most-popular') params.set('sort', updates.sort);
        else params.delete('sort');
      }

      if (updates.page !== undefined) {
        if (updates.page > 1) params.set('page', updates.page.toString());
        else params.delete('page');
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Fetch sound effects when URL params change
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const json = await ApiClient.getSoundEffects({
        q: queryParam,
        category: categoryParam,
        subcategory: subcategoryParam,
        sort: sortParam,
        page: pageParam,
        limit: 12,
      });
      setData(json);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error loading sound effects.');
    } finally {
      setIsLoading(false);
    }
  }, [queryParam, categoryParam, subcategoryParam, sortParam, pageParam]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleSearch = (q: string) => {
    updateUrlParams({ q, page: 1 });
  };

  const handleSelectCategory = (category: string, subcategory = '') => {
    updateUrlParams({
      category,
      subcategory,
      page: 1,
    });
  };

  const handleSelectSort = (sort: SortOption) => {
    updateUrlParams({ sort, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };


  // Derive dynamic page heading
  const getPageHeading = () => {
    if (queryParam) {
      return language === 'vi' ? `Kết quả cho "${queryParam}"` : `Results for "${queryParam}"`;
    }
    if (subcategoryParam) {
      const foundSub = categories
        .flatMap((c) => c.subcategories || [])
        .find((s) => s.slug.toLowerCase() === subcategoryParam.toLowerCase());
      if (foundSub) {
        return language === 'vi' ? `Hiệu ứng âm thanh ${foundSub.name}` : `${foundSub.name} sound effects`;
      }
      return language === 'vi'
        ? `Hiệu ứng âm thanh ${subcategoryParam.replace('-', ' ')}`
        : `${subcategoryParam.replace('-', ' ')} sound effects`;
    }
    if (categoryParam && categoryParam !== 'all') {
      const foundCat = categories.find(
        (c) => c.slug.toLowerCase() === categoryParam.toLowerCase()
      );
      const catName = foundCat ? foundCat.name : categoryParam;
      return language === 'vi' ? `Hiệu ứng âm thanh ${catName}` : `${catName} sound effects`;
    }
    return language === 'vi' ? 'Tất cả hiệu ứng âm thanh' : 'All Sound Effects';
  };

  const displayCount = data ? data.total : 0;

  return (
    <div className={`min-h-screen bg-[#0d0d0d] text-white flex flex-col transition-all duration-300 ${!isAuthenticated ? 'pb-16' : 'pb-6'}`}>
      {/* Top Navbar */}
      <Header
        onToggleSidebar={() => setIsSidebarOpenMobile(true)}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6 flex gap-4 lg:gap-8">
        {/* Left Categories Sidebar */}
        <Sidebar
          categories={categories}
          currentCategory={categoryParam}
          currentSubcategory={subcategoryParam}
          onSelectCategory={handleSelectCategory}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Center/Right Content Area */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Hero Section / Category Title */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight capitalize text-white">
              {getPageHeading()}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 sm:mt-1.5 font-medium">
              {language === 'vi'
                ? `${displayCount} hiệu ứng âm thanh`
                : `${displayCount} sound effect${displayCount === 1 ? '' : 's'}`}
            </p>
          </div>

          {/* Search Box */}
          <div className="mb-3 sm:mb-4">
            <SearchBar initialQuery={queryParam} onSearch={handleSearch} />
          </div>

          {/* Mobile Horizontal Category Quick-Filter Bar */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto scrollbar-none py-1 mb-2.5 -mx-1 px-1">
            {categories.map((cat) => {
              const isCatActive = categoryParam.toLowerCase() === cat.slug.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug, '')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isCatActive
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'bg-[#181818] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Breadcrumbs & Sort row */}
          <BreadcrumbsAndSort
            category={categoryParam}
            subcategory={subcategoryParam}
            categories={categories}
            sort={sortParam}
            onSelectCategory={handleSelectCategory}
            onSelectSort={handleSelectSort}
          />

          {/* Content Listing Area */}
          <div className="mt-4 flex-1">
            {/* Error State */}
            {error && (
              <div className="p-6 bg-red-950/20 border border-red-900/50 rounded-xl text-center text-red-300 my-8">
                <p className="text-sm font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={fetchData}
                  className="mt-3 px-4 py-1.5 bg-red-900/40 hover:bg-red-800/60 text-white rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {language === 'vi' ? 'Thử lại' : 'Try Again'}
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {isLoading && !data && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg bg-[#141414] border border-[#1e1e1e] animate-pulse flex items-center px-4 gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-800" />
                    <div className="w-28 h-4 bg-neutral-800 rounded" />
                    <div className="flex-1 h-6 bg-neutral-800/50 rounded" />
                    <div className="w-12 h-6 bg-neutral-800/40 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && data && data.items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-[#121212]/50 border border-neutral-900 my-6">
                <Search className="w-12 h-12 text-neutral-600 mb-3 stroke-[1.2]" />
                <h3 className="text-base font-semibold text-white">
                  {language === 'vi' ? 'Không tìm thấy hiệu ứng âm thanh' : 'No sound effects found'}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-md">
                  {language === 'vi'
                    ? 'Không tìm thấy hiệu ứng âm thanh nào phù hợp với từ khóa của bạn. Hãy thử thay đổi từ khóa hoặc khám phá tất cả danh mục.'
                    : 'We couldn\'t find any sound effects matching your criteria. Try adjusting your search term, clearing subcategories, or browsing all categories.'}
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all', '')}
                  className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white rounded-md transition-colors"
                >
                  {language === 'vi' ? 'Khám phá tất cả âm thanh' : 'Browse All Sound Effects'}
                </button>
              </div>
            )}

            {/* Sound Effect Cards (2 Columns Grid matching Magnific screenshot) */}
            {data && data.items.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 sm:gap-3.5">
                {data.items.map((sfx) => (
                  <SoundEffectCard key={sfx.id} soundEffect={sfx} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                totalItems={data.total}
                pageSize={data.pageSize}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Bottom Player & CTA bar */}
      <BottomPlayer />
    </div>
  );
}
