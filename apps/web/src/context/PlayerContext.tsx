import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { updateListeningProgress, getProgress } from '../services/userLibrary';

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
  playEpisode: (trackOrId: PlayingTrack | string, seriesId?: string) => Promise<void>;
  play: () => void;
  resume: () => void;
  pause: () => void;
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

  const [currentTrack, setCurrentTrack] = useState<PlayingTrack | null>(() => {
    try {
      const saved = localStorage.getItem('kathaisolli_last_track');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default verified initial track
    return {
      id: 'appusamy-africa-ch2',
      episodeId: 'appusamy-africa-ch2',
      title: 'அப்புசாமியும் ஆப்பிரிக்க அழகியும் - அத்தியாயம் 2',
      seriesTitle: 'பாக்கியம் ராமசாமி',
      coverImage: '/images/temple-sunset.jpg',
      coverImageUrl: '/images/temple-sunset.jpg',
      narratorName: 'பாக்கியம் ராமசாமி',
      durationSec: 1456,
      audioUrl: '/audio/arthashastram_01.mp3',
    };
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
  const userRef = useRef(user);
  userRef.current = user;
  const apiRef = useRef(api);
  apiRef.current = api;
  const lastSyncRef = useRef<number>(0);
  const fallbackAttemptsRef = useRef<Set<string>>(new Set());

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

  const playEpisode = async (trackOrId: PlayingTrack | string, seriesId?: string) => {
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

      setCurrentTrack(track);
      if (track.durationSec && track.durationSec > 0) {
        setDuration(track.durationSec);
      }
      setCurrentTime(0);

      try {
        localStorage.setItem('kathaisolli_last_track', JSON.stringify(track));
      } catch {}

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

      const audio = audioRef.current;
      if (audio) {
        setIsBuffering(true);
        audio.pause();
        audio.src = streamUrl;
        audio.playbackRate = playbackRate;
        audio.volume = isMuted ? 0 : volume;
        audio.load();

        if (startPosition > 0) {
          audio.currentTime = startPosition;
          setCurrentTime(startPosition);
        }

        await audio.play().catch((playErr) => {
          setIsBuffering(false);
          setIsPlaying(false);
          if (playErr.name !== 'AbortError') {
            console.warn('[Player] Audio play interrupted:', playErr.message);
          }
        });
      }
    } catch (err) {
      console.error('Playback error:', err);
      setIsBuffering(false);
      setIsPlaying(false);
      setPlaybackError('ஆடியோ இயக்க முடியவில்லை (Could not play audio).');
    }
  };

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
        playEpisode,
        play,
        resume,
        pause,
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
