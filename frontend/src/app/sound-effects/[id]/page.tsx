import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { SoundDetailClient } from '@/components/SoundDetailClient';
import { SOUND_EFFECTS_DATA } from '@/lib/data/sound-effects';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return SOUND_EFFECTS_DATA.flatMap((s) => [
    { id: s.id },
    { id: s.slug },
  ]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cleanId = decodeURIComponent(id).toLowerCase();
  const found = SOUND_EFFECTS_DATA.find(
    (s) =>
      s.id.toLowerCase() === cleanId ||
      s.slug.toLowerCase() === cleanId ||
      s.id.replace(/^sfx-/, '').toLowerCase() === cleanId
  );

  if (!found) {
    return {
      title: 'Sound Effect Not Found | Magnific SFX',
    };
  }

  return {
    title: `${found.title} - Free Sound Effect Download | Magnific SFX`,
    description: `Listen and download "${found.title}" high quality sound effect in WAV format. Royalty-free commercial license.`,
  };
}

async function SoundDetailWrapper({ params }: PageProps) {
  const { id } = await params;
  return <SoundDetailClient soundId={id} />;
}

export default function SoundEffectDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs text-neutral-400 font-mono">Loading Sound Details...</span>
          </div>
        </div>
      }
    >
      <SoundDetailWrapper params={params} />
    </Suspense>
  );
}
