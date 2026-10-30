import React, { Suspense } from 'react';
import SoundEffectsExplorer from '@/components/SoundEffectsExplorer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voiceover & Vocals | Magnific Audio Studio',
  description: 'Download royalty-free voiceover tracks, AI voiceovers, game character voices, and vocal sound effects.',
};

export default function VoiceoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs text-neutral-400 font-mono">Loading Voiceover Studio...</span>
          </div>
        </div>
      }
    >
      <SoundEffectsExplorer initialCategory="voiceover" initialTitle="Voiceover & Vocal FX" />
    </Suspense>
  );
}
