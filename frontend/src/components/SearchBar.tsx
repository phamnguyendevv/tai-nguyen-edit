'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialQuery);
  const { t, language } = useLanguage();

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full bg-[#141414] border border-[#222222] rounded-lg px-4 py-1.5 focus-within:border-neutral-600 transition-colors shadow-inner"
    >
      <Search className="w-4 h-4 text-neutral-400 mr-3 flex-shrink-0" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none py-1.5"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-neutral-400 hover:text-white mr-2 transition-colors"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <button
        type="submit"
        className="px-4 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] text-white text-xs font-semibold rounded-md transition-colors"
      >
        {language === 'vi' ? 'Tìm kiếm' : 'Search'}
      </button>
    </form>
  );
};
