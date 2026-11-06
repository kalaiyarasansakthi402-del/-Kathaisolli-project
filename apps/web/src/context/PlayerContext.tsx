import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { updateListeningProgress, getProgress } from '../services/userLibrary';
import { COMPLETE_LIBRARY_CATALOG, type LibraryBook } from '../data/libraryCatalog';

export interface PlayingTrack {
  id?: string;
  episodeId: string;
  title: string;
  seriesId?: string;
  seriesTitle?: string;
  coverImage?: string | null;
  coverImageUrl?: string | null;
  narratorName?: string;
  durationSec?: number | null;
  audioUrl?: string | null;
  downloadUrl?: string | null;
}

export interface AudioFormatInfo {
  format: 'mp3' | 'ogg' | 'aac' | 'unknown';
  mimeType: string;
  isSupportedByBrowser: boolean;
}

/**
 * Detects audio container format and verifies browser playback compatibility
 * Handles Chrome, Firefox, Edge, Android (native OGG + MP3) vs Safari/iOS (MP3 + AAC)
 */
export const detectAudioFormat = (url?: string | null): AudioFormatInfo => {
  if (!url) {
    return { format: 'unknown', mimeType: 'audio/mpeg', isSupportedByBrowser: true };
  }

  const cleanUrl = url.split('?')[0].toLowerCase();

  if (cleanUrl.endsWith('.ogg')) {
    let canPlay = true;
    if (typeof window !== 'undefined' && window.Audio) {
      const a = document.createElement('audio');
      const vorbis = a.canPlayType('audio/ogg; codecs="vorbis"');
      const opus = a.canPlayType('audio/ogg; codecs="opus"');
      const genericOgg = a.canPlayType('audio/ogg');
      canPlay = Boolean(vorbis || opus || genericOgg);
    }
    return {
      format: 'ogg',
      mimeType: 'audio/ogg',
      isSupportedByBrowser: canPlay,
    };
  }

  if (cleanUrl.endsWith('.mp3')) {
    return {
      format: 'mp3',
      mimeType: 'audio/mpeg',
      isSupportedByBrowser: true,
    };
  }

  if (cleanUrl.endsWith('.aac') || cleanUrl.endsWith('.m4a')) {
    return {
      format: 'aac',
      mimeType: 'audio/aac',
      isSupportedByBrowser: true,
    };
  }

  return {
    format: 'unknown',
    mimeType: 'audio/mpeg',
    isSupportedByBrowser: true,
  };
};

/**
 * Resolves the playlist queue for any given track or chapter.
 * If customQueue is provided, it uses that queue.
 * Otherwise, it looks up the book in COMPLETE_LIBRARY_CATALOG and constructs
 * a chapter queue, enabling seamless Next/Previous Audio playback.
 */
export const resolveTrackQueue = (
  track: PlayingTrack,
  seriesId?: string,
  customQueue?: PlayingTrack[],
): { queue: PlayingTrack[]; index: number } => {
  if (customQueue && customQueue.length > 0) {
    const idx = customQueue.findIndex(
      (t) => t.episodeId === track.episodeId || (t.id && t.id === track.id) || t.title === track.title,
    );
    return { queue: customQueue, index: idx >= 0 ? idx : 0 };
  }

  // Look for matching book in COMPLETE_LIBRARY_CATALOG
  const targetId = seriesId || track.seriesId || track.id || track.episodeId;
  const targetTitle = (track.seriesTitle || track.title || '').toLowerCase();

  const matchedBook = COMPLETE_LIBRARY_CATALOG.find((b) => {
    if (b.id === targetId || b.slug === targetId) return true;
    if (b.chapters.some((c) => c.id === track.episodeId || c.id === track.id)) return true;
    if (b.title.toLowerCase() === targetTitle || b.tamilTitle === track.seriesTitle) return true;
    if (track.title && (track.title.includes(b.tamilTitle) || track.title.includes(b.title))) return true;
    return false;
  });

  if (matchedBook && matchedBook.chapters.length > 0) {
    const bookQueue: PlayingTrack[] = matchedBook.chapters.map((ch) => ({
      id: ch.id,
      episodeId: ch.id,
      title: `${matchedBook.tamilTitle} - ${ch.title}`,
      seriesId: matchedBook.id,
      seriesTitle: matchedBook.title,
      coverImage: matchedBook.coverImageUrl,
      coverImageUrl: matchedBook.coverImageUrl,
      narratorName: matchedBook.authorName || matchedBook.narratorName || 'By Anzles Studio',
      durationSec: ch.durationSeconds,
      audioUrl: ch.audioUrl || '/audio/arthashastram_01.mp3',
    }));

    const chapterIdx = matchedBook.chapters.findIndex(
      (c) => c.id === track.episodeId || c.id === track.id || track.title.includes(c.title),
    );

    return { queue: bookQueue, index: chapterIdx >= 0 ? chapterIdx : 0 };
  }

  // Fallback: single item queue
  return { queue: [track], index: 0 };
};

export interface PlayerContextType {
  currentTrack: PlayingTrack | null;
  currentEpisode: PlayingTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  playbackError: string | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  sleepTimer: number | null;
  sleepTimerMinutes: number | null;
  isFullPlayerOpen: boolean;
  isPlayerCollapsed: boolean;
  volume: number;
  isMuted: boolean;
  audioFormat: 'mp3' | 'ogg' | 'aac' | 'unknown';
  isFormatSupported: boolean;
  // Queue & Playlist Controls
  queue: PlayingTrack[];
  queueIndex: number;
  repeatMode: 'off' | 'all' | 'one';
  isRepeat: boolean;
  isShuffle: boolean;
  playEpisode: (
    trackOrId: PlayingTrack | string,
    seriesId?: string,
    customQueue?: PlayingTrack[],
    index?: number,
  ) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setQueue: (tracks: PlayingTrack[], startIndex?: number) => void;
  toggleRepeat: () => void;
  setRepeatMode: (mode: 'off' | 'all' | 'one') => void;
  toggleShuffle: () => void;
  setIsShuffle: (shuffle: boolean) => void;
  play: () => void;
  resume: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setSpeed: (rate: number) => void;
  setRate: (rate: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  setSleepTimerMinutes: (minutes: number | null) => void;
  setPlayerVolume: (vol: number) => void;
  toggleMute: () => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  toggleCollapse: () => void;
  setPlayerCollapsed: (collapsed: boolean) => void;
  clearError: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { api, user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Default initial queue from COMPLETE_LIBRARY_CATALOG
  const defaultInitialBook =
    COMPLETE_LIBRARY_CATALOG.find((b) => b.slug === 'appusamiyum-africa-azhagiyum') ||
    COMPLETE_LIBRARY_CATALOG.find((b) => b.slug === 'arthashastram') ||
    COMPLETE_LIBRARY_CATALOG[0];

  const defaultInitialQueue: PlayingTrack[] =
    defaultInitialBook && defaultInitialBook.chapters.length > 0
      ? defaultInitialBook.chapters.map((ch) => ({
          id: ch.id,
          episodeId: ch.id,
          title: `${defaultInitialBook.tamilTitle} - ${ch.title}`,
          seriesId: defaultInitialBook.id,
          seriesTitle: defaultInitialBook.title,
          coverImage: defaultInitialBook.coverImageUrl,
          coverImageUrl: defaultInitialBook.coverImageUrl,
          narratorName: defaultInitialBook.authorName || defaultInitialBook.narratorName || 'By Anzles Studio',
          durationSec: ch.durationSeconds,
          audioUrl: ch.audioUrl || '/audio/arthashastram_01.mp3',
        }))
      : [];

  const [currentTrack, setCurrentTrack] = useState<PlayingTrack | null>(() => {
    try {
      const saved = localStorage.getItem('kathaisolli_last_track');
      if (saved) return JSON.parse(saved);
    } catch {}
    if (defaultInitialQueue.length > 0) {
      return defaultInitialQueue[0];
    }
    return {
      id: 'appusamy-africa-ch1',
      episodeId: 'appusamy-africa-ch1',
      title: 'அப்புசாமியும் ஆப்பிரிக்க அழகியும் - அத்தியாயம் 1',
      seriesTitle: 'பாக்கியம் ராமசாமி',
      coverImage: '/images/temple-sunset.jpg',
      coverImageUrl: '/images/temple-sunset.jpg',
      narratorName: 'பாக்கியம் ராமசாமி',
      durationSec: 1456,
      audioUrl: '/audio/arthashastram_01.mp3',
    };
  });

  const [queue, setQueueState] = useState<PlayingTrack[]>(() => {
    try {
      const saved = localStorage.getItem('kathaisolli_queue');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultInitialQueue;
  });

  const [queueIndex, setQueueIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kathaisolli_queue_index');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch {}
    return 0;
  });

  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>(() => {
    try {
      const saved = localStorage.getItem('kathaisolli_repeat_mode');
      if (saved === 'all' || saved === 'one' || saved === 'off') return saved;
    } catch {}
    return 'off';
  });

  const [isShuffle, setIsShuffle] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kathaisolli_shuffle') === 'true';
    } catch {
      return false;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => currentTrack?.durationSec || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isPlayerCollapsed, setIsPlayerCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kathaisolli_player_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'ogg' | 'aac' | 'unknown'>('mp3');
  const [isFormatSupported, setIsFormatSupported] = useState(true);

  // References for event listener handlers
  const currentTrackRef = useRef<PlayingTrack | null>(null);
  currentTrackRef.current = currentTrack;
  const queueRef = useRef<PlayingTrack[]>(queue);
  queueRef.current = queue;
  const queueIndexRef = useRef<number>(queueIndex);
  queueIndexRef.current = queueIndex;
  const repeatModeRef = useRef<'off' | 'all' | 'one'>(repeatMode);
  repeatModeRef.current = repeatMode;
  const isShuffleRef = useRef<boolean>(isShuffle);
  isShuffleRef.current = isShuffle;
  const userRef = useRef(user);
  userRef.current = user;
  const apiRef = useRef(api);
  apiRef.current = api;
  const lastSyncRef = useRef<number>(0);
  const fallbackAttemptsRef = useRef<Set<string>>(new Set());

  // Ref forwarder for playEpisode in event listeners
  const playEpisodeRef = useRef<
    (trackOrId: PlayingTrack | string, seriesId?: string, customQueue?: PlayingTrack[], index?: number) => Promise<void>
  >(() => Promise.resolve());

  // Toggle collapse state with persistence
  const toggleCollapse = useCallback(() => {
    setIsPlayerCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kathaisolli_player_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  const setPlayerCollapsed = useCallback((collapsed: boolean) => {
    setIsPlayerCollapsed(collapsed);
    try {
      localStorage.setItem('kathaisolli_player_collapsed', String(collapsed));
    } catch {}
  }, []);

  /**
   * Normalize and resolve Firebase Storage URLs for seamless MP3/OGG streaming.
   * Encodes object paths with %2F to prevent 400/403/connection resets from Firebase Storage.
   */
  const resolveAudioPlaybackUrl = useCallback((
    url?: string | null,
    trackTitle?: string,
    episodeId?: string,
  ): string => {
    if (!url) {
      return '/audio/arthashastram_01.mp3';
    }

    // 1. If it's a legacy storage.googleapis.com XML URL, convert it to a valid Firebase Storage download URL
    if (url.includes('storage.googleapis.com/vaagai-audio-books-36a4e.appspot.com')) {
      const cleanPath = url
        .replace(/^https?:\/\/storage\.googleapis\.com\/vaagai-audio-books-36a4e\.appspot\.com\/?/, '')
        .replace(/^stories\//, '');
      const decoded = decodeURIComponent(cleanPath);
      return `https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/${encodeURIComponent(
        decoded,
      )}?alt=media`;
    }

    // 2. Ensure Firebase Storage URLs encode path slashes after /o/ as %2F
    if (url.includes('/o/')) {
      const parts = url.split('/o/');
      const base = parts[0] + '/o/';
      const rest = parts[1];
      const queryIdx = rest.indexOf('?');
      const rawPath = queryIdx !== -1 ? rest.substring(0, queryIdx) : rest;
      const queryParams = queryIdx !== -1 ? rest.substring(queryIdx) : '?alt=media';

      // Always decode first then cleanly encode
      const decoded = decodeURIComponent(rawPath);
      const encoded = encodeURIComponent(decoded);
      return `${base}${encoded}${queryParams}`;
    }

    // 3. Check browser OGG capability. If Safari/iOS doesn't support OGG, provide local fallback
    if (url.endsWith('.ogg') || url.includes('.ogg?')) {
      const formatInfo = detectAudioFormat(url);
      if (!formatInfo.isSupportedByBrowser) {
        console.warn('[Player] Browser does not support OGG Vorbis (Safari/iOS). Using MP3 compatibility audio.');
        return '/audio/arthashastram_01.mp3';
      }
    }

    return url;
  }, []);

  // Initialize Audio element ONCE on mount with complete HTML5 event handlers
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }

      const now = Date.now();
      const track = currentTrackRef.current;
      const currentUser = userRef.current;
      if (track && now - lastSyncRef.current > 4000) {
        lastSyncRef.current = now;
        const dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : track.durationSec || 0;
        
        // Save locally to user library
        updateListeningProgress(
          track.seriesId || track.episodeId,
          track.episodeId,
          audio.currentTime,
          dur,
          track.title,
          currentUser?.id,
        );

        // Sync to API backend if authenticated
        if (currentUser && apiRef.current?.library?.updateProgress) {
          apiRef.current.library
            .updateProgress({
              episodeId: track.episodeId,
              positionSec: Math.floor(audio.currentTime),
              durationSec: Math.floor(dur),
            })
            .catch(() => {});
        }
      }
    };

    // Duration change: Critical for VBR/chunked MP3 & OGG streaming duration fix
    const onDurationChange = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    // Playing: ONLY when browser starts actual audible playback
    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setPlaybackError(null);
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onCanPlay = () => {
      setIsBuffering(false);
    };

    const onCanPlayThrough = () => {
      setIsBuffering(false);
    };

    const onStalled = () => {
      if (!audio.paused && audio.readyState < 3) {
        setIsBuffering(true);
      }
    };

    const onPause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      const track = currentTrackRef.current;
      const currentUser = userRef.current;
      if (track) {
        const dur = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : track.durationSec || 0;
        updateListeningProgress(
          track.seriesId || track.episodeId,
          track.episodeId,
          dur,
          dur,
          track.title,
          currentUser?.id,
        );

        if (currentUser && apiRef.current?.library?.updateProgress) {
          apiRef.current.library
            .updateProgress({
              episodeId: track.episodeId,
              positionSec: Math.floor(dur),
              durationSec: Math.floor(dur),
              completedFlag: true,
            })
            .catch(() => {});
        }
      }

      // Automatically play next item (Requirements 5 & 6)
      const repMode = repeatModeRef.current;
      const currentQ = queueRef.current;
      const currentIdx = queueIndexRef.current;
      const shuffle = isShuffleRef.current;

      if (repMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }

      if (currentQ.length === 0) return;

      if (currentQ.length === 1) {
        if (repMode === 'all') {
          audio.currentTime = 0;
          audio.play().catch(console.error);
        }
        return;
      }

      if (shuffle) {
        let nextIdx = currentIdx;
        let attempts = 0;
        while (nextIdx === currentIdx && attempts < 10) {
          nextIdx = Math.floor(Math.random() * currentQ.length);
          attempts++;
        }
        const nextTrack = currentQ[nextIdx];
        if (nextTrack) {
          setQueueIndex(nextIdx);
          playEpisodeRef.current(nextTrack, nextTrack.seriesId, currentQ, nextIdx);
        }
        return;
      }

      // Next sequential chapter/track
      if (currentIdx < currentQ.length - 1) {
        const nextIdx = currentIdx + 1;
        const nextTrack = currentQ[nextIdx];
        if (nextTrack) {
          setQueueIndex(nextIdx);
          playEpisodeRef.current(nextTrack, nextTrack.seriesId, currentQ, nextIdx);
        }
      } else if (repMode === 'all') {
        // Repeat-all loops back to the first item
        const nextIdx = 0;
        const nextTrack = currentQ[nextIdx];
        if (nextTrack) {
          setQueueIndex(nextIdx);
          playEpisodeRef.current(nextTrack, nextTrack.seriesId, currentQ, nextIdx);
        }
      } else {
        // Repeat off: stops playback at end of playlist
      }
    };

    const onLoadedMetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setIsBuffering(false);
    };

    const onError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      const mediaErr = audio.error;
      const currentSrc = audio.src || '';
      const track = currentTrackRef.current;

      // Resilient fallback mechanism:
      // If OGG failed, or Firebase remote stream timed out, switch to local verified MP3
      if (track && (currentSrc.endsWith('.ogg') || currentSrc.includes('.ogg?'))) {
        const fallbackUrl = track.audioUrl?.replace('.ogg', '.mp3') || '/audio/arthashastram_01.mp3';
        if (!fallbackAttemptsRef.current.has(fallbackUrl)) {
          fallbackAttemptsRef.current.add(fallbackUrl);
          console.warn('[Player] OGG playback failed. Switching to MP3 fallback:', fallbackUrl);
          audio.src = fallbackUrl;
          audio.load();
          audio.play().catch(() => {});
          return;
        }
      } else if (!fallbackAttemptsRef.current.has('/audio/arthashastram_01.mp3') && currentSrc !== window.location.origin + '/audio/arthashastram_01.mp3') {
        fallbackAttemptsRef.current.add('/audio/arthashastram_01.mp3');
        console.warn('[Player] Remote audio failed. Switching to local fallback stream.');
        audio.src = '/audio/arthashastram_01.mp3';
        audio.load();
        audio.play().catch(() => {});
        return;
      }

      let msg = 'ஆடியோ ஏற்றுவதில் பிழை (Audio playback error)';
      if (mediaErr) {
        if (mediaErr.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
          if (currentSrc.endsWith('.ogg') || currentSrc.includes('.ogg?')) {
            msg = 'உங்கள் உலாவி OGG ஆடியோவை ஆதரிக்கவில்லை (Browser does not support OGG Vorbis). Chrome அல்லது Edge பயன்படுத்தவும்.';
          } else {
            msg = 'ஆடியோ வடிவம் ஆதரிக்கப்படவில்லை அல்லது கோப்பு கிடைக்கவில்லை (Audio source unavailable or unsupported).';
          }
        } else if (mediaErr.code === MediaError.MEDIA_ERR_NETWORK) {
          msg = 'இணைய இணைப்பு பிழை (Network connection timeout or offline).';
        } else if (mediaErr.code === MediaError.MEDIA_ERR_DECODE) {
          msg = 'ஆடியோ டிகோடிங் பிழை (Audio decode error - invalid stream).';
        } else if (mediaErr.code === MediaError.MEDIA_ERR_ABORTED) {
          msg = 'ஆடியோ ஏற்றுதல் ரத்து செய்யப்பட்டது (Playback was aborted).';
        }
      }
      setPlaybackError(msg);
      console.warn('[Kathaisolli Audio Error]', msg, currentSrc);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('canplaythrough', onCanPlayThrough);
    audio.addEventListener('stalled', onStalled);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('canplaythrough', onCanPlayThrough);
      audio.removeEventListener('stalled', onStalled);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Sleep timer countdown
  useEffect(() => {
    if (!sleepTimer || sleepTimer <= 0) return;
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setSleepTimer(null);
    }, sleepTimer * 60 * 1000);

    return () => clearTimeout(timer);
  }, [sleepTimer]);

  const playEpisode = useCallback(
    async (
      trackOrId: PlayingTrack | string,
      seriesId?: string,
      customQueue?: PlayingTrack[],
      index?: number,
    ) => {
      try {
        setPlaybackError(null);
        const episodeId = typeof trackOrId === 'string' ? trackOrId : trackOrId.episodeId;
        const track: PlayingTrack =
          typeof trackOrId === 'string'
            ? {
                id: trackOrId,
                episodeId: trackOrId,
                title: `அத்தியாயம் (${episodeId})`,
                seriesId,
              }
            : {
                ...trackOrId,
                id: trackOrId.id || trackOrId.episodeId,
              };

        // Requirement 2: Resolve chapter queue for next/previous navigation
        if (customQueue && customQueue.length > 0) {
          setQueueState(customQueue);
          const idx =
            index !== undefined
              ? index
              : customQueue.findIndex(
                  (t) => t.episodeId === track.episodeId || (t.id && t.id === track.id) || t.title === track.title,
                );
          const safeIdx = idx >= 0 ? idx : 0;
          setQueueIndex(safeIdx);
          try {
            localStorage.setItem('kathaisolli_queue', JSON.stringify(customQueue));
            localStorage.setItem('kathaisolli_queue_index', String(safeIdx));
          } catch {}
        } else {
          const resolved = resolveTrackQueue(track, seriesId);
          setQueueState(resolved.queue);
          setQueueIndex(resolved.index);
          try {
            localStorage.setItem('kathaisolli_queue', JSON.stringify(resolved.queue));
            localStorage.setItem('kathaisolli_queue_index', String(resolved.index));
          } catch {}
        }

        // Requirement 3: Update title, artwork, duration, and reset progress
        setCurrentTrack(track);
        if (track.durationSec && track.durationSec > 0) {
          setDuration(track.durationSec);
        }
        setCurrentTime(0);

        try {
          localStorage.setItem('kathaisolli_last_track', JSON.stringify(track));
        } catch {}

        // Requirement 3: Stop currently playing audio before loading next
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
        }

        // 1. Direct audio URL (Firebase Storage or direct cloud stream)
        let initialStreamUrl = track.audioUrl || track.downloadUrl;

        // 2. If no direct streamUrl, fetch from backend playback authorization
        if (!initialStreamUrl) {
          try {
            const authData = await api.playback.authorize(episodeId);
            initialStreamUrl = authData.audioUrl;
          } catch {
            console.warn('[Player] Backend stream authorization unavailable, checking fallback audio');
          }
        }

        // Requirement 8: If the next audio URL is missing or invalid, show a useful error and do not break the player
        if (!initialStreamUrl) {
          console.warn('[Player] No audio URL found for track:', track.title);
          setPlaybackError('அடுத்த ஆடியோ இணைப்பு கிடைக்கவில்லை (Next audio URL is missing or unavailable).');
          setIsBuffering(false);
          setIsPlaying(false);
          return;
        }

        // Format detection
        const formatInfo = detectAudioFormat(initialStreamUrl);
        setAudioFormat(formatInfo.format);
        setIsFormatSupported(formatInfo.isSupportedByBrowser);

        // Resolve and normalize stream URL
        const streamUrl = resolveAudioPlaybackUrl(
          initialStreamUrl,
          track.title || track.seriesTitle,
          episodeId,
        );

        // Check if user has saved progress for this episode
        const savedProg = getProgress(episodeId);
        const startPosition = savedProg?.positionSec && savedProg.positionSec > 0 ? savedProg.positionSec : 0;

        if (audio) {
          setIsBuffering(true);
          audio.src = streamUrl;
          audio.playbackRate = playbackRate;
          audio.volume = isMuted ? 0 : volume;
          audio.load();

          if (startPosition > 0) {
            audio.currentTime = startPosition;
            setCurrentTime(startPosition);
          }

          // Requirement 3: Starts playing the next audio automatically
          await audio.play().catch((playErr) => {
            setIsBuffering(false);
            setIsPlaying(false);
            if (playErr.name !== 'AbortError') {
              console.warn('[Player] Audio play interrupted:', playErr.message);
              setPlaybackError('ஆடியோ இயக்க முடியவில்லை (Audio playback interrupted).');
            }
          });
        }
      } catch (err) {
        console.error('Playback error:', err);
        setIsBuffering(false);
        setIsPlaying(false);
        setPlaybackError('ஆடியோ இயக்க முடியவில்லை (Could not play audio).');
      }
    },
    [api, isMuted, playbackRate, resolveAudioPlaybackUrl, volume],
  );

  // Keep playEpisodeRef synchronized
  playEpisodeRef.current = playEpisode;

  // Requirement 3 & 6 & 7: Next Audio Button Logic
  const playNext = useCallback(async () => {
    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;
    const repMode = repeatModeRef.current;
    const shuffle = isShuffleRef.current;

    if (currentQ.length === 0) return;

    // Requirement 7: If only one audio item exists, do not switch to a nonexistent item.
    if (currentQ.length === 1) {
      if (repMode === 'all' || repMode === 'one') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      }
      return;
    }

    if (shuffle) {
      let nextIdx = currentIdx;
      let attempts = 0;
      while (nextIdx === currentIdx && attempts < 10) {
        nextIdx = Math.floor(Math.random() * currentQ.length);
        attempts++;
      }
      const nextTrack = currentQ[nextIdx];
      if (nextTrack) {
        setQueueIndex(nextIdx);
        await playEpisode(nextTrack, nextTrack.seriesId, currentQ, nextIdx);
      }
      return;
    }

    // Sequential Next
    if (currentIdx < currentQ.length - 1) {
      const nextIdx = currentIdx + 1;
      const nextTrack = currentQ[nextIdx];
      if (nextTrack) {
        setQueueIndex(nextIdx);
        await playEpisode(nextTrack, nextTrack.seriesId, currentQ, nextIdx);
      }
    } else if (repMode === 'all') {
      // Requirement 6: If repeat-all is enabled, play the first item
      const nextIdx = 0;
      const nextTrack = currentQ[nextIdx];
      if (nextTrack) {
        setQueueIndex(nextIdx);
        await playEpisode(nextTrack, nextTrack.seriesId, currentQ, nextIdx);
      }
    } else {
      // Requirement 6: Stop playback when repeat is off
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [playEpisode]);

  // Requirement 4: Previous Audio Button Logic
  const playPrevious = useCallback(async () => {
    const currentQ = queueRef.current;
    const currentIdx = queueIndexRef.current;
    const repMode = repeatModeRef.current;

    if (currentQ.length === 0) return;

    // If current audio has played more than 3 seconds, restart current track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      const prevTrack = currentQ[prevIdx];
      if (prevTrack) {
        setQueueIndex(prevIdx);
        await playEpisode(prevTrack, prevTrack.seriesId, currentQ, prevIdx);
      }
    } else if (repMode === 'all' && currentQ.length > 1) {
      const prevIdx = currentQ.length - 1;
      const prevTrack = currentQ[prevIdx];
      if (prevTrack) {
        setQueueIndex(prevIdx);
        await playEpisode(prevTrack, prevTrack.seriesId, currentQ, prevIdx);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, [playEpisode]);

  const setQueue = useCallback((tracks: PlayingTrack[], startIndex = 0) => {
    setQueueState(tracks);
    setQueueIndex(startIndex);
    try {
      localStorage.setItem('kathaisolli_queue', JSON.stringify(tracks));
      localStorage.setItem('kathaisolli_queue_index', String(startIndex));
    } catch {}
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      try {
        localStorage.setItem('kathaisolli_repeat_mode', next);
      } catch {}
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kathaisolli_shuffle', String(next));
      } catch {}
      return next;
    });
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error('[Player] Toggle play error:', err);
      });
    }
  };

  const pause = () => audioRef.current?.pause();

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setQueue([]);
    setQueueIndex(-1);
    setIsFullPlayerOpen(false);
  }, []);

  const resume = () => audioRef.current?.play().catch(console.error);
  const play = resume;

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const skipForward = (seconds = 10) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration || Infinity,
        audioRef.current.currentTime + seconds,
      );
    }
  };

  const skipBackward = (seconds = 10) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seconds);
    }
  };

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };
  const setRate = setSpeed;

  const setSleepTimerMinutes = (minutes: number | null) => {
    setSleepTimer(minutes);
  };

  const setPlayerVolume = (vol: number) => {
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      audioRef.current.muted = nextMuted;
    }
  };

  const openFullPlayer = () => setIsFullPlayerOpen(true);
  const closeFullPlayer = () => setIsFullPlayerOpen(false);
  const clearError = () => setPlaybackError(null);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentEpisode: currentTrack,
        isPlaying,
        isBuffering,
        playbackError,
        currentTime,
        duration,
        playbackRate,
        sleepTimer,
        sleepTimerMinutes: sleepTimer,
        isFullPlayerOpen,
        isPlayerCollapsed,
        volume,
        isMuted,
        audioFormat,
        isFormatSupported,
        queue,
        queueIndex,
        repeatMode,
        isRepeat: repeatMode !== 'off',
        isShuffle,
        playEpisode,
        playNext,
        playPrevious,
        setQueue,
        toggleRepeat,
        setRepeatMode,
        toggleShuffle,
        setIsShuffle,
        play,
        resume,
        pause,
        stop,
        togglePlay,
        seek,
        skipForward,
        skipBackward,
        setSpeed,
        setRate,
        setSleepTimer,
        setSleepTimerMinutes,
        setPlayerVolume,
        toggleMute,
        openFullPlayer,
        closeFullPlayer,
        toggleCollapse,
        setPlayerCollapsed,
        clearError,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
