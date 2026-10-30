'use client';

import React from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/language-context';

interface DownloadLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadsCount: number;
  maxLimit: number;
  onUpgrade?: () => void;
}

export const DownloadLimitModal: React.FC<DownloadLimitModalProps> = ({
  isOpen,
  onClose,
  downloadsCount,
  maxLimit = 5,
  onUpgrade,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[700px] bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col sm:flex-row border border-neutral-800/20">
        {/* Close Button for easy dismissal */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-neutral-400 hover:text-neutral-800 rounded-full hover:bg-neutral-100 transition-colors z-20 cursor-pointer"
          aria-label={isVi ? 'Đóng' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: 3D Soundwave Artwork */}
        <div className="w-full sm:w-[48%] h-44 sm:h-auto min-h-[180px] sm:min-h-[420px] relative bg-neutral-950 flex-shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/premium-banner.png"
            alt="Premium Plan sound visualizer"
            className="w-full h-full object-cover object-center select-none"
          />
        </div>

        {/* Right: Premium Information Content */}
        <div className="w-full sm:w-[52%] bg-white text-neutral-900 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Top plan category */}
            <span className="inline-block text-[11px] sm:text-xs font-semibold text-blue-600 tracking-wider uppercase mb-1.5">
              {isVi ? 'GÓI PREMIUM' : 'PREMIUM PLAN'}
            </span>

            {/* Main title */}
            <h2 className="text-xl sm:text-[22px] font-bold text-neutral-900 tracking-tight leading-snug mb-2.5">
              {isVi ? 'Tiếp tục tải hiệu ứng âm thanh' : 'Keep downloading sound effects'}
            </h2>

            {/* Description note with user's daily limit */}
            <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed mb-5">
              {isVi
                ? `Bạn đã đạt giới hạn ${maxLimit} lượt tải hôm nay với tài khoản miễn phí.`
                : `You've reached your daily limit of ${maxLimit} downloads as a free user.`}
            </p>

            {/* Feature list with bullets matching Image 1 */}
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-neutral-800 font-normal mb-6 pl-1">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 flex-shrink-0" />
                <span>
                  {isVi
                    ? 'Tải không giới hạn hiệu ứng âm thanh'
                    : 'Unlimited sound effect downloads'}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 flex-shrink-0" />
                <span>
                  {isVi
                    ? 'Truy cập kho sound effect cao cấp độc quyền'
                    : 'Access to premium sound effects'}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 flex-shrink-0" />
                <span>
                  {isVi
                    ? 'Quyền sử dụng thương mại đầy đủ'
                    : 'Commercial usage rights'}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 flex-shrink-0" />
                <span>
                  {isVi ? 'Hỗ trợ kỹ thuật ưu tiên' : 'Priority support'}
                </span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/pricing"
              onClick={() => {
                onClose();
                if (onUpgrade) onUpgrade();
              }}
              className="w-full py-3 px-4 rounded-lg bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-medium text-xs sm:text-sm transition-all duration-150 cursor-pointer shadow-sm text-center block"
            >
              {isVi ? 'Nâng cấp lên Premium' : 'Upgrade to Premium'}
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-1 text-xs sm:text-[13px] font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer text-center"
            >
              {isVi ? 'Để sau' : 'Maybe later'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
