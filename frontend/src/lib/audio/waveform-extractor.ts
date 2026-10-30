/**
 * Real-time Audio Waveform Analyzer using Web Audio API.
 * Accurately analyzes any uploaded audio file (.wav, .mp3, .ogg, .flac, etc.)
 * by decoding raw PCM audio samples and extracting precise peak amplitudes.
 */
export async function analyzeAudioFile(
  file: File,
  barCount = 48
): Promise<{
  duration: number;
  waveform: number[];
  audioUrl: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  // Clone buffer because decodeAudioData mutates/detaches it
  const cloneBuffer = arrayBuffer.slice(0);

  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(cloneBuffer);
    const duration = Number(audioBuffer.duration.toFixed(2));
    const channelData = audioBuffer.getChannelData(0);
    const totalSamples = channelData.length;
    const samplesPerBar = Math.floor(totalSamples / barCount);

    const rawPeaks: number[] = [];

    for (let b = 0; b < barCount; b++) {
      let max = 0;
      const start = b * samplesPerBar;
      const end = Math.min(totalSamples, start + samplesPerBar);
      for (let i = start; i < end; i++) {
        const val = Math.abs(channelData[i]);
        if (val > max) max = val;
      }
      rawPeaks.push(max);
    }

    // Normalize so highest peak reaches ~0.96 and baseline is ~0.12
    const maxOverall = Math.max(...rawPeaks, 0.001);
    const waveform = rawPeaks.map((p) => {
      const normalized = (p / maxOverall) * 0.84 + 0.12;
      return Number(normalized.toFixed(2));
    });

    const audioUrl = URL.createObjectURL(file);
    return { duration, waveform, audioUrl };
  } finally {
    audioCtx.close().catch(() => {});
  }
}
