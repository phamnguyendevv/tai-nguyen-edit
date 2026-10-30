import React, { Suspense } from 'react';
import SoundEffectsExplorer from '@/components/SoundEffectsExplorer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sound Effects Library | Magnific SFX Audio Studio',
  description:
    'Search, preview, and download thousands of royalty-free sound effects across Wildlife, Ambience, Foley, Musical, and Transitions.',
};

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs text-neutral-400 font-mono">Loading Sound Studio...</span>
          </div>
        </div>
      }
    >
      <SoundEffectsExplorer />
    </Suspense>
  );
}
