'use client';

import React from 'react';
import { X, Crown, Sparkles, Check, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface DownloadLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadsCount: number;
  maxLimit: number;
  onUpgrade: () => void;
}

export const DownloadLimitModal: React.FC<DownloadLimitModalProps> = ({
  isOpen,
  onClose,
  downloadsCount,
  maxLimit = 5,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#141414] border border-neutral-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Icon Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3 h-3" /> Hạn mức 5 lượt / ngày
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              Đã hết 5 lượt tải hôm nay
            </h3>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 mb-5">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-300 mb-2">
            <span>Lượt tải hôm nay đã sử dụng</span>
            <span className="text-amber-400 font-bold">
              {downloadsCount} / {maxLimit} bài (100%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full w-full" />
          </div>
          <p className="text-[11px] text-neutral-400 mt-2">
            Tài khoản miễn phí được tải tối đa <strong>{maxLimit} sound effect mỗi ngày</strong>. Lượt tải sẽ tự động làm mới sau <strong>00:00</strong> đêm nay, hoặc bạn có thể nâng cấp gói <strong>Pro</strong> để tải không giới hạn ngay lập tức!
          </p>
        </div>

        {/* Main message & Benefits */}
        <div className="space-y-3 mb-6">
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Nâng cấp gói thành viên <strong className="text-white">Pro</strong> để mở khóa lượt tải không giới hạn và tải trọn bộ file âm thanh gốc chất lượng cao nhất:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300 pt-1">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Tải <strong>không giới hạn</strong> SFX</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>File gốc <strong>WAV 44.1kHz</strong></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Giấy phép <strong>thương mại</strong></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Tạo <strong>Bộ sưu tập VIP</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onUpgrade}
            className="w-full sm:flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Nâng cấp Pro ngay (Từ 63k/tháng)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 sm:py-3 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Để sau
          </button>
        </div>

        <div className="text-center mt-3">
          <Link
            href="/pricing"
            onClick={onClose}
            className="text-[11px] text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Xem bảng so sánh chi tiết các gói dịch vụ
          </Link>
        </div>
      </div>
    </div>
  );
};
