import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { PricingSection } from '@/components/PricingSection';
import { BottomPlayer } from '@/components/BottomPlayer';

export const metadata: Metadata = {
  title: 'Gói Cước & Đăng Ký Bản Quyền Âm Thanh Pro | Magnific SFX',
  description:
    'Đăng ký gói trả phí 1 tháng (69k), 3 tháng, 6 tháng, 1 năm tải không giới hạn SFX 24-bit WAV bản quyền thương mại cho YouTube, TikTok, Game và Video Editor.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 flex flex-col">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
          <Link href="/" className="hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sound Effects Library</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">Bảng Giá Gói Pro</span>
        </div>

        {/* Pricing Content */}
        <PricingSection />
      </main>

      {/* Bottom Audio Player bar */}
      <BottomPlayer />
    </div>
  );
}
