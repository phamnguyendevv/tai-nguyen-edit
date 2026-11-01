'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Window of 5 pages
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 py-12 mt-4 border-t border-[#1a1a1a] select-none text-sm">
      {/* Previous button (only if not on first page) */}
      {currentPage > 1 && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          className="text-white hover:text-neutral-300 font-medium transition-colors mr-1 cursor-pointer active:scale-95"
        >
          « Prev
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-4 sm:gap-6">
        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'w-9 h-9 flex items-center justify-center rounded-md bg-[#1d2127] text-white font-semibold text-sm shadow-sm'
                  : 'text-white hover:text-neutral-300 font-medium text-sm hover:scale-105 active:scale-95'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Next Button matching screenshot (Next ») */}
      {currentPage < totalPages && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          className="text-white hover:text-neutral-300 font-semibold transition-colors ml-1 cursor-pointer active:scale-95"
        >
          Next »
        </button>
      )}
    </div>
  );
};
