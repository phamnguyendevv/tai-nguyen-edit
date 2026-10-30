'use client';

import React, { useState, useRef } from 'react';
import { X, UploadCloud, Play, Pause, CheckCircle2, Music, Loader2 } from 'lucide-react';
import { analyzeAudioFile } from '@/lib/audio/waveform-extractor';
import { WaveformScrubber } from './WaveformScrubber';
import { Category, CategorySlug } from '@/types/sfx';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUploadSuccess: (newSfx: any) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategorySlug>('realistic');
  const [subcategory, setSubcategory] = useState('wildlife');
  const [tags, setTags] = useState('');

  // Analyzed audio properties
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [waveform, setWaveform] = useState<number[]>([]);

  // Preview playback state
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsAnalyzing(true);

    // Auto title
    const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));

    try {
      const result = await analyzeAudioFile(selectedFile);
      setAudioUrl(result.audioUrl);
      setDuration(result.duration);
      setWaveform(result.waveform);
    } catch (err) {
      console.error('Audio analysis failed:', err);
      alert('Could not decode audio file. Please try another standard audio format (.wav, .mp3, .ogg).');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setPreviewProgress(audio.currentTime / audio.duration);
        }
      };
      audio.onended = () => {
        setIsPlayingPreview(false);
        setPreviewProgress(0);
      };
    }

    const audio = previewAudioRef.current;
    if (!audio) return;

    if (isPlayingPreview) {
      audio.pause();
      setIsPlayingPreview(false);
    } else {
      audio.play().then(() => setIsPlayingPreview(true)).catch(console.error);
    }
  };

  const handleSeekPreview = (pct: number) => {
    if (previewAudioRef.current && duration > 0) {
      previewAudioRef.current.currentTime = pct * duration;
      setPreviewProgress(pct);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || waveform.length === 0) return;

    setIsSubmitting(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const audioBase64 = await base64Promise;

      const payload = {
        title: title.trim(),
        category,
        subcategory,
        duration,
        waveform,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        audioBase64,
        format: file.type || 'audio/wav',
      };

      const res = await fetch('http://localhost:5000/api/sound-effects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const createdSfx = await res.json();
      onUploadSuccess(createdSfx);
      onClose();
    } catch (err) {
      console.error('Error saving sound effect:', err);
      // Fallback add directly to client
      const fallbackSfx = {
        id: `sfx-custom-${Date.now()}`,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        subcategory,
        audioUrl: audioUrl || '',
        duration,
        waveform,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        downloadsCount: 0,
        popularity: 90,
        createdAt: new Date().toISOString(),
        fileSizeBytes: file.size,
        format: file.type || 'Audio',
        license: 'Custom Upload',
      };
      onUploadSuccess(fallbackSfx);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSubs = categories.find((c) => c.slug === category)?.subcategories || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#121212] border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">Upload & Analyze New Sound Effect</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Dropzone */}
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('sfx-file-input')?.click()}
              className="border-2 border-dashed border-neutral-700 hover:border-neutral-400 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-neutral-900/40 hover:bg-neutral-900/80 transition-all text-center"
            >
              <Music className="w-10 h-10 text-neutral-400 stroke-[1.2]" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Drop your audio file here, or <span className="underline text-neutral-300">browse</span>
                </p>
                <p className="text-neutral-500 mt-1">Supports MP3, WAV, OGG, FLAC, M4A</p>
              </div>
              <input
                id="sfx-file-input"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="bg-[#181818] border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white truncate max-w-sm">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setWaveform([]);
                    if (previewAudioRef.current) previewAudioRef.current.pause();
                    setIsPlayingPreview(false);
                  }}
                  className="text-neutral-400 hover:text-red-400 text-[11px]"
                >
                  Change File
                </button>
              </div>

              {/* Waveform Real Analysis Result */}
              {isAnalyzing ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                  <span>Decoding audio samples & calculating real peak amplitude...</span>
                </div>
              ) : waveform.length > 0 ? (
                <div className="bg-[#101010] p-3 rounded-lg border border-neutral-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span className="text-emerald-400">✓ Waveform Extracted ({waveform.length} peak points)</span>
                    <span>Duration: {duration}s</span>
                  </div>

                  {/* Interactive Waveform Preview */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePreviewPlay}
                      className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
                    >
                      {isPlayingPreview ? (
                        <Pause className="w-3.5 h-3.5 fill-black" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <WaveformScrubber
                        waveform={waveform}
                        progress={previewProgress}
                        isPlaying={isPlayingPreview}
                        onSeek={handleSeekPreview}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Metadata Fields */}
          {file && !isAnalyzing && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Sound Effect Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#181818] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value as CategorySlug;
                      setCategory(newCat);
                      const sub = categories.find((c) => c.slug === newCat)?.subcategories?.[0]?.slug || '';
                      setSubcategory(sub);
                    }}
                    className="w-full bg-[#181818] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    {categories
                      .filter((c) => c.slug !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Subcategory</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-[#181818] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    {availableSubs.map((sub) => (
                      <option key={sub.id} value={sub.slug}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. laser, whoosh, sci-fi, fast"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-[#181818] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Add to Sound Effects Library</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
