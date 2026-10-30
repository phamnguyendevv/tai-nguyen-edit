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
}

const AudioContext = createContext<AudioContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
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
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Initialize favorites, downloads and collections from localStorage on client
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

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
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
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
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
          audio.currentTime = clamped;
          setCurrentTime(clamped);
        }
        audio.play().catch((err) => {
          console.error('Playback error:', err);
          setError('Browser blocked audio autoplay or failed to decode.');
          setIsPlaying(false);
        });
        return;
      }

      // Switching track
      pendingSeekRef.current = targetTime > 0 ? targetTime : null;
      setCurrentTrack(track);
      setCurrentTime(targetTime);
      setDuration(track.duration || 0);
      setIsLoading(true);

      audio.src = track.audioUrl;
      audio.volume = isMuted ? 0 : volume;

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

      audio
        .play()
        .then(() => {
          applySeekOnReady();
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Audio playback error:', err);
          pendingSeekRef.current = null;
          setIsLoading(false);
          setIsPlaying(false);
          setError('Could not play audio track. User gesture may be required.');
        });
    },
    [currentTrack, volume, isMuted]
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
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

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
        audio.currentTime = clamped;
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
        audio.currentTime = actualTarget;
        setCurrentTime(actualTarget);
        if (!isPlaying) {
          audio.play().then(() => setIsPlaying(true)).catch(console.error);
        }
      } else {
        // Track is not playing yet: switch to it and immediately start at targetTime!
        playTrack(track, targetTime);
      }
    },
    [currentTrack, duration, isPlaying, playTrack]
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

  const downloadTrack = useCallback(async (track: SoundEffect) => {
    try {
      // Add to downloads history
      setDownloads((prev) => {
        const next = [track.id, ...prev.filter((id) => id !== track.id)];
        try {
          localStorage.setItem('sfx_downloads', JSON.stringify(next));
        } catch (e) {
          console.warn('Could not save downloads to localStorage', e);
        }
        return next;
      });

      // Trigger API to increment downloads
      fetch(`/api/sound-effects/${track.id}/download`, { method: 'POST' }).catch((e) =>
        console.warn('Failed to increment download counter', e)
      );

      // Create download trigger element
      const link = document.createElement('a');
      link.href = track.audioUrl;
      link.download = `${track.slug}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadToast(`Downloaded: ${track.title}`);
      setTimeout(() => {
        setDownloadToast(null);
      }, 3500);
    } catch (e) {
      console.error('Download error:', e);
      setDownloadToast(`Failed to download ${track.title}`);
      setTimeout(() => {
        setDownloadToast(null);
      }, 3500);
    }
  }, []);

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
      }}
    >
      {children}
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
