import React, { Suspense } from 'react';
import SoundEffectsExplorer from '@/components/SoundEffectsExplorer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Music & Musical SFX | Magnific Audio Studio',
  description: 'Download royalty-free background music, acoustic guitar, piano, and orchestra riffs.',
};

export default function MusicPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs text-neutral-400 font-mono">Loading Music Studio...</span>
          </div>
        </div>
      }
    >
      <SoundEffectsExplorer initialCategory="musical" initialTitle="Music & Musical SFX" />
    </Suspense>
  );
}
