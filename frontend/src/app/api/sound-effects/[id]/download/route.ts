import { NextRequest, NextResponse } from 'next/server';
import { SoundEffectRepository } from '@/lib/data/sfx-repository';
import fs from 'fs';
import path from 'path';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleDownload(context);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleDownload(context);
}

async function handleDownload(context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const item = await SoundEffectRepository.getById(id);

    if (!item) {
      return NextResponse.json({ error: 'Sound effect not found' }, { status: 404 });
    }

    // Increment download count in repository
    await SoundEffectRepository.incrementDownload(id);

    // Locate audio file on disk
    const cleanAudioPath = item.audioUrl.startsWith('/') ? item.audioUrl.slice(1) : item.audioUrl;
    
    // Check multiple candidate paths for robustness across dev/build environments
    const candidatePaths = [
      path.join(process.cwd(), 'public', cleanAudioPath),
      path.join(process.cwd(), 'frontend', 'public', cleanAudioPath),
      path.join(process.cwd(), '..', 'public', cleanAudioPath),
      path.join(process.cwd(), '..', 'frontend', 'public', cleanAudioPath),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      console.warn('Audio file not found on disk at candidate paths:', candidatePaths);
      return NextResponse.json({ error: 'Audio file not found on disk' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ foundPath);
    const uint8 = new Uint8Array(fileBuffer);
    const filename = `${item.slug || item.id}.wav`;

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': uint8.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error handling download:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
