import { NextRequest, NextResponse } from 'next/server';
import { SoundEffectRepository } from '@/lib/data/sfx-repository';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updated = await SoundEffectRepository.incrementDownload(id);

    if (!updated) {
      return NextResponse.json({ error: 'Sound effect not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      downloadsCount: updated.downloadsCount,
      downloadUrl: updated.audioUrl,
      title: updated.title,
    });
  } catch (error) {
    console.error('Error handling download increment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
