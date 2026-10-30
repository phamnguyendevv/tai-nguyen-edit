'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { SoundEffect } from '@/types/sfx';
import { useAuth } from '@/lib/auth/auth-context';
import { DownloadLimitModal } from '@/components/DownloadLimitModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { PRICING_PLANS } from '@/components/PricingSection';

export const FREE_DAILY_DOWNLOAD_LIMIT = 5;
export const FREE_DOWNLOAD_LIMIT = 5;

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface DailyDownloadQuota {
  date: string; // YYYY-MM-DD in local time
  soundIds: string[]; // Sound effect IDs downloaded today
}

export interface UserCollection {
  id: string;
  name: string;
  createdAt: string;
  itemIds: string[];
}

interface AudioContextType {
  currentTrack: SoundEffect | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  favorites: string[];
  downloads: string[];
  collections: UserCollection[];
  addToCollection: (collectionId: string, soundId: string) => void;
  removeFromCollection: (collectionId: string, soundId: string) => void;
  createCollection: (name: string, soundId?: string) => UserCollection;
  isSoundInCollection: (collectionId: string, soundId: string) => boolean;
  isSoundInAnyCollection: (soundId: string) => boolean;
  playTrack: (track: SoundEffect, startTime?: number) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: (track: SoundEffect) => void;
  seekTo: (seconds: number) => void;
  seekToPercent: (percent: number, track?: SoundEffect) => void;
  seekTrack: (track: SoundEffect, percent: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  downloadTrack: (track: SoundEffect) => Promise<void>;
  clearDownloads: () => void;
  downloadToast: string | null;
  dailyDownloads: string[];
  dailyDownloadsCount: number;
  freeDownloadLimit: number;
  remainingDownloads: number;
  isDownloadLimitReached: boolean;
  isLimitModalOpen: boolean;
  openLimitModal: () => void;
  closeLimitModal: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { isPro } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const blobCacheRef = useRef<Map<string, string>>(new Map());
  const [currentTrack, setCurrentTrack] = useState<SoundEffect | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [downloads, setDownloads] = useState<string[]>([]);
  const [dailyDownloads, setDailyDownloads] = useState<string[]>([]);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Initialize favorites, downloads, daily quota, and collections from localStorage on client
  useEffect(() => {
    try {
      const storedFav = localStorage.getItem('sfx_favorites');
      if (storedFav) {
        setFavorites(JSON.parse(storedFav));
      }
      const storedDown = localStorage.getItem('sfx_downloads');
      if (storedDown) {
        setDownloads(JSON.parse(storedDown));
      }

      // Initialize daily download quota
      const today = getTodayDateString();
      const storedDaily = localStorage.getItem('sfx_daily_downloads');
      if (storedDaily) {
        try {
          const parsed: DailyDownloadQuota = JSON.parse(storedDaily);
          if (parsed && parsed.date === today && Array.isArray(parsed.soundIds)) {
            setDailyDownloads(parsed.soundIds);
          } else {
            // New day: reset today's quota
            const freshQuota: DailyDownloadQuota = { date: today, soundIds: [] };
            localStorage.setItem('sfx_daily_downloads', JSON.stringify(freshQuota));
            setDailyDownloads([]);
          }
        } catch {
          const freshQuota: DailyDownloadQuota = { date: today, soundIds: [] };
          localStorage.setItem('sfx_daily_downloads', JSON.stringify(freshQuota));
          setDailyDownloads([]);
        }
      } else {
        const freshQuota: DailyDownloadQuota = { date: today, soundIds: [] };
        localStorage.setItem('sfx_daily_downloads', JSON.stringify(freshQuota));
        setDailyDownloads([]);
      }

      const storedCols = localStorage.getItem('sfx_user_collections');
      if (storedCols) {
        setCollections(JSON.parse(storedCols));
      } else {
        const defaultCol: UserCollection = {
          id: 'default-favorites',
          name: 'My Saved SFX',
          createdAt: new Date().toISOString(),
          itemIds: ['sfx-birds-in-the-grove', 'sfx-gentle-rain-thunder', 'sfx-heavy-body-impact'],
        };
        setCollections([defaultCol]);
        localStorage.setItem('sfx_user_collections', JSON.stringify([defaultCol]));
      }
    } catch (e) {
      console.warn('Could not read user data from localStorage', e);
    }
  }, []);

  // Automatically reset daily quota after midnight (00:00) when tab is active or focused
  useEffect(() => {
    const checkDayReset = () => {
      const today = getTodayDateString();
      try {
        const stored = localStorage.getItem('sfx_daily_downloads');
        if (stored) {
          const parsed: DailyDownloadQuota = JSON.parse(stored);
          if (parsed && parsed.date !== today) {
            const freshQuota: DailyDownloadQuota = { date: today, soundIds: [] };
            localStorage.setItem('sfx_daily_downloads', JSON.stringify(freshQuota));
            setDailyDownloads([]);
          }
        }
      } catch {}
    };

    window.addEventListener('focus', checkDayReset);
    const interval = setInterval(checkDayReset, 30000); // Check every 30 seconds
    return () => {
      window.removeEventListener('focus', checkDayReset);
      clearInterval(interval);
    };
  }, []);

  const addToCollection = useCallback((collectionId: string, soundId: string) => {
    setCollections((prev) => {
      const next = prev.map((c) => {
        if (c.id === collectionId) {
          if (!c.itemIds.includes(soundId)) {
            return { ...c, itemIds: [soundId, ...c.itemIds] };
          }
        }
        return c;
      });
      try {
        localStorage.setItem('sfx_user_collections', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const removeFromCollection = useCallback((collectionId: string, soundId: string) => {
    setCollections((prev) => {
      const next = prev.map((c) => {
        if (c.id === collectionId) {
          return { ...c, itemIds: c.itemIds.filter((id) => id !== soundId) };
        }
        return c;
      });
      try {
        localStorage.setItem('sfx_user_collections', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const createCollection = useCallback((name: string, soundId?: string) => {
    const clean = name.trim();
    const newCol: UserCollection = {
      id: `col-${Date.now()}`,
      name: clean || 'New Collection',
      createdAt: new Date().toISOString(),
      itemIds: soundId ? [soundId] : [],
    };
    setCollections((prev) => {
      const next = [...prev, newCol];
      try {
        localStorage.setItem('sfx_user_collections', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    return newCol;
  }, []);

  const isSoundInCollection = useCallback((collectionId: string, soundId: string) => {
    const found = collections.find((c) => c.id === collectionId);
    return found ? found.itemIds.includes(soundId) : false;
  }, [collections]);

  const isSoundInAnyCollection = useCallback((soundId: string) => {
    return collections.some((c) => c.itemIds.includes(soundId));
  }, [collections]);

  const clearDownloads = useCallback(() => {
    setDownloads([]);
    try {
      localStorage.removeItem('sfx_downloads');
    } catch (e) {
      console.warn('Could not clear downloads from localStorage', e);
    }
  }, []);

  // Sync favorites changes
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('sfx_favorites', JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save favorites to localStorage', e);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  // Set up Audio instance
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'metadata';

    const handleTimeUpdate = () => {
      if (pendingSeekRef.current !== null && pendingSeekRef.current > 0) {
        // If the browser audio hasn't seeked yet (currentTime is still near 0 while target is > 0.1),
        // do NOT overwrite currentTime with 0!
        if (audio.currentTime < 0.15 && pendingSeekRef.current > 0.2) {
          return;
        }
        if (
          Math.abs(audio.currentTime - pendingSeekRef.current) < 0.4 ||
          audio.currentTime > pendingSeekRef.current
        ) {
          pendingSeekRef.current = null;
        }
      }
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      if (pendingSeekRef.current !== null && pendingSeekRef.current > 0) {
        const maxDur =
          audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
            ? audio.duration
            : pendingSeekRef.current;
        const clamped = Math.max(0, Math.min(pendingSeekRef.current, maxDur));
        try {
          audio.currentTime = clamped;
          setCurrentTime(clamped);
        } catch (e) {
          console.warn('Could not set currentTime in loadedmetadata:', e);
        }
      }
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      if (pendingSeekRef.current !== null && pendingSeekRef.current > 0) {
        try {
          const maxDur =
            audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
              ? audio.duration
              : pendingSeekRef.current;
          const clamped = Math.max(0, Math.min(pendingSeekRef.current, maxDur));
          if (Math.abs(audio.currentTime - clamped) > 0.1) {
            audio.currentTime = clamped;
          }
        } catch (e) {}
      }
      setIsLoading(false);
    };

    const handleEnded = () => {
      pendingSeekRef.current = null;
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      pendingSeekRef.current = null;
      setIsLoading(false);
      setIsPlaying(false);
      setError('Cannot load or play this audio file. Please check audio format or connection.');
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleSeeked = () => {
      pendingSeekRef.current = null;
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('seeked', handleSeeked);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('seeked', handleSeeked);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      blobCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobCacheRef.current.clear();
    };
  }, []);

  // 60FPS continuous time update loop for ultra-smooth waveform and playback tracking
  useEffect(() => {
    let animId: number;
    const updateSmoothTime = () => {
      if (audioRef.current && isPlaying) {
        if (pendingSeekRef.current !== null && pendingSeekRef.current > 0) {
          if (audioRef.current.currentTime < 0.15 && pendingSeekRef.current > 0.2) {
            animId = requestAnimationFrame(updateSmoothTime);
            return;
          }
          if (
            Math.abs(audioRef.current.currentTime - pendingSeekRef.current) < 0.4 ||
            audioRef.current.currentTime > pendingSeekRef.current
          ) {
            pendingSeekRef.current = null;
          }
        }
        setCurrentTime(audioRef.current.currentTime);
        animId = requestAnimationFrame(updateSmoothTime);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(updateSmoothTime);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  const safePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused && audio.currentTime > 0) {
      setIsPlaying(true);
      return;
    }

    const p = audio.play();
    if (p !== undefined) {
      playPromiseRef.current = p;
      p.then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        setError(null);
      }).catch((err) => {
        // AbortError is normal when switching tracks or rapid seeks occur
        if (err.name === 'AbortError') return;
        console.error('Audio playback error:', err);
        setIsPlaying(false);
        setIsLoading(false);
        setError('Could not play audio track. User gesture may be required.');
      });
    }
  }, []);

  const playTrack = useCallback(
    (track: SoundEffect, startTime?: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      setError(null);
      const targetTime = startTime !== undefined && startTime >= 0 ? startTime : 0;

      // If playing the same track
      if (currentTrack?.id === track.id) {
        pendingSeekRef.current = null;
        if (startTime !== undefined) {
          const maxDur =
            audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
              ? audio.duration
              : track.duration;
          const clamped = Math.max(0, Math.min(targetTime, maxDur));
          try {
            audio.currentTime = clamped;
          } catch {}
          setCurrentTime(clamped);
        }
        safePlay();
        return;
      }

      // Switching track
      pendingSeekRef.current = targetTime > 0 ? targetTime : null;
      setCurrentTrack(track);
      setCurrentTime(targetTime);
      setDuration(track.duration || 0);
      setIsLoading(true);

      // Clean up previous listeners and set loading
      const applySeekOnReady = () => {
        if (targetTime > 0) {
          const maxDur =
            audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
              ? audio.duration
              : track.duration;
          const clamped = Math.max(0, Math.min(targetTime, maxDur));
          try {
            audio.currentTime = clamped;
            setCurrentTime(clamped);
          } catch (e) {
            console.warn('Could not set currentTime immediately:', e);
          }
        }
      };

      const handleMeta = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
        applySeekOnReady();
        audio.removeEventListener('loadedmetadata', handleMeta);
      };
      audio.addEventListener('loadedmetadata', handleMeta);

      // Load audio stream securely as an in-memory blob to hide real URL from sniffer tools
      const loadAudioStream = async () => {
        let streamUrl = blobCacheRef.current.get(track.id);
        if (!streamUrl) {
          try {
            const res = await fetch(track.audioUrl, {
              headers: {
                'X-Requested-With': 'SFX-WebPlayer',
              },
            });
            if (res.ok) {
              const blob = await res.blob();
              streamUrl = URL.createObjectURL(blob);
              blobCacheRef.current.set(track.id, streamUrl);
            }
          } catch {
            // fallback
          }
        }
        audio.src = streamUrl || track.audioUrl;
        audio.volume = isMuted ? 0 : volume;
        safePlay();
      };

      loadAudioStream();
    },
    [currentTrack, volume, isMuted, safePlay]
  );

  const pauseTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      safePlay();
    }
  }, [currentTrack, safePlay]);

  const togglePlay = useCallback(
    (track: SoundEffect) => {
      if (currentTrack?.id === track.id && isPlaying) {
        pauseTrack();
      } else {
        playTrack(track);
      }
    },
    [currentTrack, isPlaying, pauseTrack, playTrack]
  );

  const seekTo = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (audio && currentTrack) {
        const effectiveDur =
          audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
            ? audio.duration
            : duration || currentTrack.duration;
        const clamped = Math.max(0, Math.min(seconds, effectiveDur));
        try {
          audio.currentTime = clamped;
        } catch {}
        setCurrentTime(clamped);
      }
    },
    [currentTrack, duration]
  );

  const seekTrack = useCallback(
    (track: SoundEffect, percent: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const clampedPercent = Math.max(0, Math.min(1, percent));
      const trackDur = track.duration || 0;
      const targetTime = clampedPercent * trackDur;

      if (currentTrack?.id === track.id) {
        const effectiveDur =
          audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
            ? audio.duration
            : duration || trackDur;
        const actualTarget = Math.max(0, Math.min(effectiveDur, clampedPercent * effectiveDur));

        try {
          if (audio.readyState >= 1) {
            audio.currentTime = actualTarget;
          } else {
            pendingSeekRef.current = actualTarget;
          }
        } catch {
          pendingSeekRef.current = actualTarget;
        }
        setCurrentTime(actualTarget);
        safePlay();
      } else {
        // Track is not playing yet: switch to it and immediately start at targetTime!
        playTrack(track, targetTime);
      }
    },
    [currentTrack, duration, playTrack, safePlay]
  );

  const seekToPercent = useCallback(
    (percent: number, track?: SoundEffect) => {
      const activeTrack = track || currentTrack;
      if (!activeTrack) return;
      seekTrack(activeTrack, percent);
    },
    [currentTrack, seekTrack]
  );

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      setIsMuted(clamped === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.8;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const downloadTrack = useCallback(
    async (track: SoundEffect) => {
      const today = getTodayDateString();

      // Read fresh daily quota from localStorage to avoid stale closure state
      let currentDailyList = dailyDownloads;
      try {
        const stored = localStorage.getItem('sfx_daily_downloads');
        if (stored) {
          const parsed: DailyDownloadQuota = JSON.parse(stored);
          if (parsed && parsed.date === today && Array.isArray(parsed.soundIds)) {
            currentDailyList = parsed.soundIds;
          } else {
            currentDailyList = [];
          }
        }
      } catch {}

      const alreadyDownloadedToday = currentDailyList.includes(track.id);
      const isDailyLimitReached =
        !isPro && currentDailyList.length >= FREE_DAILY_DOWNLOAD_LIMIT && !alreadyDownloadedToday;

      if (isDailyLimitReached) {
        setIsLimitModalOpen(true);
        setDownloadToast(
          `Hôm nay bạn đã dùng hết 5/5 lượt tải miễn phí. Lượt tải sẽ tự động làm mới sau 00:00!`
        );
        setTimeout(() => {
          setDownloadToast(null);
        }, 4500);
        return;
      }

      try {
        // 1. Update full download history (for My Downloads page)
        const nextDownloads = [track.id, ...downloads.filter((id) => id !== track.id)];
        setDownloads(nextDownloads);
        try {
          localStorage.setItem('sfx_downloads', JSON.stringify(nextDownloads));
        } catch (e) {
          console.warn('Could not save downloads to localStorage', e);
        }

        // 2. Update today's download quota (if not already downloaded today)
        let nextDailyList = currentDailyList;
        if (!alreadyDownloadedToday) {
          nextDailyList = [track.id, ...currentDailyList.filter((id) => id !== track.id)];
          setDailyDownloads(nextDailyList);
          try {
            const quota: DailyDownloadQuota = { date: today, soundIds: nextDailyList };
            localStorage.setItem('sfx_daily_downloads', JSON.stringify(quota));
          } catch (e) {
            console.warn('Could not save daily downloads to localStorage', e);
          }
        }

        // 3. Trigger native browser download directly via the official attachment endpoint
        const downloadUrl = `/api/sound-effects/${track.id}/download`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${track.slug || track.id}.wav`;
        document.body.appendChild(link);
        link.click();

        // Delay DOM removal to ensure browser native download manager initiates
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 5000);

        if (isPro) {
          setDownloadToast(`Đã tải: ${track.title} (Gói Pro - Không giới hạn)`);
        } else {
          const remainingToday = Math.max(0, FREE_DAILY_DOWNLOAD_LIMIT - nextDailyList.length);
          setDownloadToast(
            alreadyDownloadedToday
              ? `Đã tải lại: ${track.title} (Không tính thêm lượt tải hôm nay)`
              : `Đã tải: ${track.title} (Còn lại ${remainingToday}/${FREE_DAILY_DOWNLOAD_LIMIT} lượt hôm nay)`
          );
        }
        setTimeout(() => {
          setDownloadToast(null);
        }, 3500);
      } catch (e) {
        console.error('Download error:', e);
        setDownloadToast(`Lỗi khi tải ${track.title}`);
        setTimeout(() => {
          setDownloadToast(null);
        }, 3500);
      }
    },
    [dailyDownloads, downloads, isPro]
  );

  const remainingDownloads = isPro
    ? Infinity
    : Math.max(0, FREE_DAILY_DOWNLOAD_LIMIT - dailyDownloads.length);
  const isDownloadLimitReached = !isPro && dailyDownloads.length >= FREE_DAILY_DOWNLOAD_LIMIT;

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration: duration || currentTrack?.duration || 0,
        volume,
        isMuted,
        isLoading,
        error,
        favorites,
        downloads,
        dailyDownloads,
        dailyDownloadsCount: dailyDownloads.length,
        collections,
        addToCollection,
        removeFromCollection,
        createCollection,
        isSoundInCollection,
        isSoundInAnyCollection,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        seekTo,
        seekToPercent,
        seekTrack,
        setVolume,
        toggleMute,
        toggleFavorite,
        isFavorite,
        downloadTrack,
        clearDownloads,
        downloadToast,
        freeDownloadLimit: FREE_DAILY_DOWNLOAD_LIMIT,
        remainingDownloads,
        isDownloadLimitReached,
        isLimitModalOpen,
        openLimitModal: () => setIsLimitModalOpen(true),
        closeLimitModal: () => setIsLimitModalOpen(false),
      }}
    >
      {children}

      {/* Free Daily Download Limit Modal */}
      <DownloadLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        downloadsCount={dailyDownloads.length}
        maxLimit={FREE_DAILY_DOWNLOAD_LIMIT}
        onUpgrade={() => {
          setIsLimitModalOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Direct Pro Checkout Modal when user upgrades from limit modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        plan={PRICING_PLANS[1] || PRICING_PLANS[0]}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setDownloadToast('Chúc mừng! Bạn đã nâng cấp gói Pro thành công!');
          setTimeout(() => setDownloadToast(null), 4000);
        }}
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within a PlayerProvider');
  }
  return context;
}
